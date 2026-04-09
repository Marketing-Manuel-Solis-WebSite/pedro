import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { createHmac } from "crypto";

const PORT = process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] || "3000";
const BASE = process.env.TEST_BASE_URL || `http://localhost:${PORT}`;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";

function sign(payload: string): string {
  return "sha256=" + createHmac("sha256", APP_SECRET).update(payload).digest("hex");
}

interface TestCase {
  name: string;
  run: () => Promise<{ status: number; pass: boolean; detail?: string }>;
}

const tests: TestCase[] = [
  {
    name: "Webhook: empty body",
    run: async () => {
      const body = "{}";
      const res = await fetch(`${BASE}/api/webhook/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Hub-Signature-256": sign(body) },
        body,
      });
      return { status: res.status, pass: res.status !== 500 };
    },
  },
  {
    name: "Webhook: missing signature",
    run: async () => {
      const res = await fetch(`${BASE}/api/webhook/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"test":true}',
      });
      return { status: res.status, pass: res.status === 403 };
    },
  },
  {
    name: "Webhook: invalid signature",
    run: async () => {
      const res = await fetch(`${BASE}/api/webhook/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Hub-Signature-256": "sha256=badbadbadbad" },
        body: '{"test":true}',
      });
      return { status: res.status, pass: res.status === 403 };
    },
  },
  {
    name: "Webhook: valid sig, malformed WA payload",
    run: async () => {
      const body = JSON.stringify({ object: "whatsapp_business_account", entry: [{ id: "X", changes: [{ value: {}, field: "messages" }] }] });
      const res = await fetch(`${BASE}/api/webhook/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Hub-Signature-256": sign(body) },
        body,
      });
      return { status: res.status, pass: res.status !== 500, detail: res.status === 500 ? "Crashed on malformed payload" : undefined };
    },
  },
  {
    name: "Webhook: status update for non-existent msg",
    run: async () => {
      const body = JSON.stringify({
        object: "whatsapp_business_account",
        entry: [{ id: "A", changes: [{ value: { messaging_product: "whatsapp", metadata: { display_phone_number: "15551234567", phone_number_id: "PID" }, statuses: [{ id: "wamid.ghost", status: "delivered", timestamp: String(Math.floor(Date.now() / 1000)), recipient_id: "5215551234567" }] }, field: "messages" }] }],
      });
      const res = await fetch(`${BASE}/api/webhook/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Hub-Signature-256": sign(body) },
        body,
      });
      return { status: res.status, pass: res.status !== 500 };
    },
  },
  {
    name: "Consent: missing required fields",
    run: async () => {
      const res = await fetch(`${BASE}/api/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "+1234" }),
      });
      return { status: res.status, pass: res.status === 400 };
    },
  },
  {
    name: "Consent: empty body",
    run: async () => {
      const res = await fetch(`${BASE}/api/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      return { status: res.status, pass: res.status !== 500 };
    },
  },
  {
    name: "Consent: CORS preflight",
    run: async () => {
      const res = await fetch(`${BASE}/api/consent`, {
        method: "OPTIONS",
        headers: { Origin: "https://external-site.com", "Access-Control-Request-Method": "POST" },
      });
      const acao = res.headers.get("access-control-allow-origin");
      return { status: res.status, pass: res.status === 200 && acao !== null, detail: acao ? `ACAO: ${acao}` : "Missing CORS headers" };
    },
  },
  {
    name: "Cron: wrong secret",
    run: async () => {
      const res = await fetch(`${BASE}/api/cron/followup`, {
        method: "POST",
        headers: { Authorization: "Bearer wrong-secret" },
      });
      return { status: res.status, pass: res.status === 401 };
    },
  },
  {
    name: "Widget: serves JavaScript",
    run: async () => {
      const res = await fetch(`${BASE}/api/widget?lang=es`);
      const ct = res.headers.get("content-type") || "";
      const body = await res.text();
      return { status: res.status, pass: res.status === 200 && ct.includes("javascript") && body.includes("wa-lead-widget"), detail: `CT: ${ct.substring(0, 40)}` };
    },
  },
];

async function main() {
  console.log(`\n${"=".repeat(55)}`);
  console.log(`  EDGE CASE TESTS | ${BASE}`);
  console.log(`${"=".repeat(55)}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const r = await test.run();
    const icon = r.pass ? "ok" : "FAIL";
    console.log(`  [${icon}] ${test.name} -> ${r.status}${r.detail ? " (" + r.detail + ")" : ""}`);
    if (r.pass) passed++; else failed++;
  }

  console.log(`\n  Results: ${passed}/${tests.length} passed`);
  if (failed) { console.log("  Fix 500 errors before proceeding."); process.exit(1); }
}

main();
