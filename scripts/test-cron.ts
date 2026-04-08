import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const PORT = process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] || "3000";
const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${PORT}`;
const CRON_SECRET = process.env.CRON_SECRET || "";

const ENDPOINTS: Record<string, string> = {
  followup: "/api/cron/followup",
  "window-closer": "/api/cron/window-closer",
  "consent-audit": "/api/cron/consent-audit",
  "analytics-rollup": "/api/cron/analytics-rollup",
};

async function main() {
  const endpoint = process.argv[2] || "followup";

  if (!ENDPOINTS[endpoint]) {
    console.error(`Unknown endpoint: ${endpoint}`);
    console.error(`Available: ${Object.keys(ENDPOINTS).join(", ")}`);
    process.exit(1);
  }

  const url = `${BASE_URL}${ENDPOINTS[endpoint]}`;

  console.log(`\n--- Cron Test: ${endpoint} ---`);
  console.log(`URL: ${url}`);
  console.log(`Secret: ${CRON_SECRET ? CRON_SECRET.substring(0, 8) + "..." : "NOT SET"}\n`);

  if (!CRON_SECRET) {
    console.error("ERROR: CRON_SECRET not set in .env.local");
    process.exit(1);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CRON_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(body, null, 2));

    if (res.status === 200) {
      console.log(`\nCron job '${endpoint}' executed successfully.`);
    } else if (res.status === 401) {
      console.log("\nUnauthorized. Check CRON_SECRET in .env.local.");
    } else {
      console.log(`\nUnexpected status ${res.status}. Check server logs.`);
    }
  } catch (err) {
    console.error("Request failed:", err);
    console.error("Is the dev server running? (npm run dev)");
  }
}

main();
