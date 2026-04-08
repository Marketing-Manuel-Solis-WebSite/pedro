import { execSync } from "child_process";

const PORT =
  process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] || "3000";

const suites = [
  { name: "Route Accessibility", cmd: `npx tsx scripts/test-dashboard-routes.ts --port=${PORT}` },
  { name: "Consent Recording", cmd: `npx tsx scripts/test-consent.ts --port=${PORT}` },
  { name: "Webhook (New Lead)", cmd: `npx tsx scripts/test-webhook.ts new_lead --port=${PORT}` },
  { name: "Edge Cases", cmd: `npx tsx scripts/test-edge-cases.ts --port=${PORT}` },
  { name: "Cron: Followup", cmd: `npx tsx scripts/test-cron.ts followup --port=${PORT}` },
  { name: "Cron: Window Closer", cmd: `npx tsx scripts/test-cron.ts window-closer --port=${PORT}` },
  { name: "Cron: Consent Audit", cmd: `npx tsx scripts/test-cron.ts consent-audit --port=${PORT}` },
  { name: "Cron: Analytics Rollup", cmd: `npx tsx scripts/test-cron.ts analytics-rollup --port=${PORT}` },
];

console.log("\n" + "=".repeat(55));
console.log("  FULL TEST SUITE | port " + PORT);
console.log("=".repeat(55) + "\n");

const results: { name: string; pass: boolean }[] = [];

for (const suite of suites) {
  process.stdout.write(`  ${suite.name}... `);
  try {
    execSync(suite.cmd, { stdio: "pipe", timeout: 30000 });
    console.log("PASS");
    results.push({ name: suite.name, pass: true });
  } catch {
    console.log("FAIL");
    results.push({ name: suite.name, pass: false });
  }
}

const passed = results.filter((r) => r.pass).length;
const failed = results.filter((r) => !r.pass).length;

console.log("\n" + "=".repeat(55));
results.forEach((r) => console.log(`  ${r.pass ? "[ok]" : "[FAIL]"} ${r.name}`));
console.log(`\n  Total: ${passed} passed, ${failed} failed out of ${results.length}`);
console.log("=".repeat(55) + "\n");

if (failed > 0) process.exit(1);
