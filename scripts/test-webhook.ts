import { createHmac } from "crypto";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const APP_SECRET = process.env.WHATSAPP_APP_SECRET || "";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const SCENARIOS: Record<string, object> = {
  new_lead: {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "BUSINESS_ACCOUNT_ID",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551234567",
                phone_number_id: "PHONE_NUMBER_ID",
              },
              contacts: [
                { profile: { name: "Test User" }, wa_id: "5215551234567" },
              ],
              messages: [
                {
                  from: "5215551234567",
                  id: `wamid.new_lead_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: "Hola, vengo del sitio web y quiero información sobre sus servicios.",
                  },
                  type: "text",
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  },

  reply_option: {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "BUSINESS_ACCOUNT_ID",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551234567",
                phone_number_id: "PHONE_NUMBER_ID",
              },
              contacts: [
                { profile: { name: "Test User" }, wa_id: "5215551234567" },
              ],
              messages: [
                {
                  from: "5215551234567",
                  id: `wamid.reply_option_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: "1" },
                  type: "text",
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  },

  reply_info: {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "BUSINESS_ACCOUNT_ID",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551234567",
                phone_number_id: "PHONE_NUMBER_ID",
              },
              contacts: [
                { profile: { name: "Test User" }, wa_id: "5215551234567" },
              ],
              messages: [
                {
                  from: "5215551234567",
                  id: `wamid.reply_info_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: "Me llamo Juan Pérez, vivo en Houston y necesito ayuda con mi visa de trabajo H-1B que se vence en 2 meses.",
                  },
                  type: "text",
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  },

  opt_out: {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "BUSINESS_ACCOUNT_ID",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551234567",
                phone_number_id: "PHONE_NUMBER_ID",
              },
              contacts: [
                { profile: { name: "Test User" }, wa_id: "5215551234567" },
              ],
              messages: [
                {
                  from: "5215551234567",
                  id: `wamid.opt_out_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: "BAJA" },
                  type: "text",
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  },

  status_delivered: {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "BUSINESS_ACCOUNT_ID",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551234567",
                phone_number_id: "PHONE_NUMBER_ID",
              },
              statuses: [
                {
                  id: "wamid.test_outbound_001",
                  status: "delivered",
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  recipient_id: "5215551234567",
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  },

  status_read: {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "BUSINESS_ACCOUNT_ID",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: {
                display_phone_number: "15551234567",
                phone_number_id: "PHONE_NUMBER_ID",
              },
              statuses: [
                {
                  id: "wamid.test_outbound_001",
                  status: "read",
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  recipient_id: "5215551234567",
                },
              ],
            },
            field: "messages",
          },
        ],
      },
    ],
  },
};

async function main() {
  const scenario = process.argv[2] || "new_lead";

  if (!SCENARIOS[scenario]) {
    console.error(`Unknown scenario: ${scenario}`);
    console.error(`Available: ${Object.keys(SCENARIOS).join(", ")}`);
    process.exit(1);
  }

  const payload = JSON.stringify(SCENARIOS[scenario]);

  // Compute HMAC-SHA256 signature
  const signature =
    "sha256=" + createHmac("sha256", APP_SECRET).update(payload).digest("hex");

  console.log(`\n--- Webhook Test: ${scenario} ---`);
  console.log(`URL: ${BASE_URL}/api/webhook/whatsapp`);
  console.log(`Signature: ${signature.substring(0, 30)}...`);
  console.log(`Payload size: ${payload.length} bytes\n`);

  try {
    const res = await fetch(`${BASE_URL}/api/webhook/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": signature,
      },
      body: payload,
    });

    const body = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${body}`);

    if (res.status === 200) {
      console.log("\nWebhook processed successfully.");
      console.log("Check Supabase tables: leads, messages, conversation_events");
    } else if (res.status === 403) {
      console.log(
        "\nSignature validation failed. Make sure WHATSAPP_APP_SECRET in .env.local matches."
      );
    } else {
      console.log(`\nUnexpected status ${res.status}. Check server logs.`);
    }
  } catch (err) {
    console.error("Request failed:", err);
    console.error("Is the dev server running? (npm run dev)");
  }
}

main();
