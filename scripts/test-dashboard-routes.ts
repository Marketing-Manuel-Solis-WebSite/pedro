import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

const PORT =
  process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] || "3000";
const BASE = process.env.TEST_BASE_URL || `http://localhost:${PORT}`;

interface RouteTest {
  method: "GET" | "POST";
  path: string;
  expectedStatus: number[];
  description: string;
}

const routes: RouteTest[] = [
  { method: "GET", path: "/login", expectedStatus: [200], description: "Login page" },
  { method: "GET", path: "/api/widget?office=texas&phone=%2B15551234567&lang=es", expectedStatus: [200], description: "Widget JS" },
  { method: "GET", path: "/api/widget/embed?office=texas", expectedStatus: [200], description: "Widget embed snippet" },
  { method: "POST", path: "/api/consent", expectedStatus: [400], description: "Consent (empty body = 400)" },
  { method: "GET", path: "/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=invalid&hub.challenge=test", expectedStatus: [403], description: "Webhook verify (bad token)" },
  { method: "GET", path: "/dashboard", expectedStatus: [307, 302], description: "Dashboard (no auth)" },
  { method: "GET", path: "/dashboard/leads", expectedStatus: [307, 302], description: "Leads (no auth)" },
  { method: "GET", path: "/dashboard/analytics", expectedStatus: [307, 302], description: "Analytics (no auth)" },
  { method: "GET", path: "/dashboard/templates", expectedStatus: [307, 302], description: "Templates (no auth)" },
  { method: "GET", path: "/dashboard/settings", expectedStatus: [307, 302], description: "Settings (no auth)" },
  { method: "GET", path: "/dashboard/audit", expectedStatus: [307, 302], description: "Audit (no auth)" },
  { method: "GET", path: "/dashboard/widget", expectedStatus: [307, 302], description: "Widget config (no auth)" },
  { method: "POST", path: "/api/cron/followup", expectedStatus: [401], description: "Cron followup (no secret)" },
  { method: "POST", path: "/api/cron/window-closer", expectedStatus: [401], description: "Cron window-closer (no secret)" },
  { method: "POST", path: "/api/cron/consent-audit", expectedStatus: [401], description: "Cron consent-audit (no secret)" },
  { method: "POST", path: "/api/cron/analytics-rollup", expectedStatus: [401], description: "Cron analytics-rollup (no secret)" },
];

async function testRoute(route: RouteTest): Promise<{ pass: boolean; status: number }> {
  try {
    const res = await fetch(`${BASE}${route.path}`, {
      method: route.method,
      redirect: "manual",
      headers: route.method === "POST" ? { "Content-Type": "application/json" } : {},
      body: route.method === "POST" ? "{}" : undefined,
    });
    return { pass: route.expectedStatus.includes(res.status), status: res.status };
  } catch {
    return { pass: false, status: 0 };
  }
}

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ROUTE ACCESSIBILITY TEST | ${BASE}`);
  console.log(`${"=".repeat(60)}\n`);

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const route of routes) {
    const r = await testRoute(route);
    const icon = r.pass ? "ok" : "FAIL";
    const exp = route.expectedStatus.join("|");
    console.log(`  [${icon}] ${route.method.padEnd(5)} ${route.path.substring(0, 55).padEnd(57)} ${String(r.status).padEnd(4)} (exp ${exp}) ${route.description}`);
    if (r.pass) passed++;
    else { failed++; failures.push(`${route.method} ${route.path} -> ${r.status} (exp ${exp})`); }
  }

  console.log(`\n  Results: ${passed}/${routes.length} passed`);
  if (failures.length) { failures.forEach((f) => console.log(`  FAIL: ${f}`)); }
  if (failed) process.exit(1);
}

main();
