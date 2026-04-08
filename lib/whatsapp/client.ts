import type {
  WASendTextPayload,
  WASendTemplatePayload,
  WATemplateComponent,
} from "@/types/whatsapp";

const API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v21.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function sendTextMessage(
  to: string,
  body: string
): Promise<{ message_id: string }> {
  const payload: WASendTextPayload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body },
  };

  const res = await fetch(`${API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `WhatsApp send failed (${res.status}): ${JSON.stringify(err)}`
    );
  }

  const data = await res.json();
  return { message_id: data.messages?.[0]?.id ?? "" };
}

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string,
  components?: WATemplateComponent[]
): Promise<{ message_id: string }> {
  const payload: WASendTemplatePayload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components ? { components } : {}),
    },
  };

  const res = await fetch(`${API_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `WhatsApp template send failed (${res.status}): ${JSON.stringify(err)}`
    );
  }

  const data = await res.json();
  return { message_id: data.messages?.[0]?.id ?? "" };
}
