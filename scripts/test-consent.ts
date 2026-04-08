import { randomUUID } from "crypto";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

const PORT = process.argv.find((a) => a.startsWith("--port="))?.split("=")[1] || "3000";
const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${PORT}`;

async function main() {
  const consentEventId = randomUUID();

  const payload = {
    consent_event_id: consentEventId,
    phone: "+5215551234567",
    consent_type: "whatsapp_initial",
    consent_method: "button_click",
    source_url:
      "http://localhost:3000/?utm_source=google&utm_medium=cpc&utm_campaign=immigration_houston",
    source_page_title: "Abogados de Inmigración en Houston | Manuel Solís",
    campaign: "immigration_houston",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "immigration_houston",
    utm_content: "hero_cta",
    utm_term: "abogado inmigracion houston",
    legal_text_shown:
      "Al continuar, nos autorizas a responderte por WhatsApp para atender tu solicitud. Consulta nuestro Aviso de Privacidad. Puedes dejar de recibir mensajes escribiendo BAJA en cualquier momento.",
    legal_text_version: "consent-microcopy-es-v1.0",
    privacy_policy_url: "http://localhost:3000/privacidad",
    privacy_policy_version: "v1.0",
    destination_phone: "+15551234567",
    language: "es",
    device_fingerprint: "test-script-001",
  };

  console.log("\n--- Consent Recording Test ---");
  console.log(`URL: ${BASE_URL}/api/consent`);
  console.log(`consent_event_id: ${consentEventId}\n`);

  try {
    const res = await fetch(`${BASE_URL}/api/consent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (test script)",
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, JSON.stringify(body, null, 2));

    if (res.status === 200) {
      console.log("\nConsent recorded successfully.");
      console.log(`consent_id: ${body.consent_id}`);
      console.log("Check Supabase: consent_records table");

      // Test idempotency — send same payload again
      console.log("\n--- Testing idempotency (same event_id) ---");
      const res2 = await fetch(`${BASE_URL}/api/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body2 = await res2.json();
      console.log(`Status: ${res2.status}`);
      console.log(`Response:`, JSON.stringify(body2, null, 2));
      console.log(
        body2.status === "duplicate"
          ? "Idempotency working correctly."
          : "WARNING: Expected duplicate status."
      );
    } else {
      console.log(`\nFailed with status ${res.status}.`);
    }
  } catch (err) {
    console.error("Request failed:", err);
    console.error("Is the dev server running? (npm run dev)");
  }
}

main();
