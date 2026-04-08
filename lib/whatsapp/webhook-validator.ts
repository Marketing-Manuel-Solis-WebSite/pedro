import { createHmac } from "crypto";

/**
 * Validate the X-Hub-Signature-256 header from WhatsApp webhook.
 */
export function validateWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;

  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.error("WHATSAPP_APP_SECRET not configured");
    return false;
  }

  const expectedSignature =
    "sha256=" +
    createHmac("sha256", appSecret).update(rawBody).digest("hex");

  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return false;

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  return result === 0;
}
