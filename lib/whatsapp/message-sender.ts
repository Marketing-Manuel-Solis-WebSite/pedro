import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { sendTextMessage, sendTemplateMessage } from "./client";
import { isWithinWindow } from "./window-checker";
import type { WATemplateComponent } from "@/types/whatsapp";
import type { SenderType } from "@/types/message";

interface SendResult {
  success: boolean;
  message_id?: string;
  error?: string;
}

/**
 * Send a message to a lead, enforcing opt-out and window rules.
 */
export async function sendMessageToLead(
  leadId: string,
  content: string,
  senderType: SenderType
): Promise<SendResult> {
  const supabase = createSupabaseAdmin();

  // Fetch lead
  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("phone_normalized, is_opted_out, wa_window_expires_at, consent_id")
    .eq("id", leadId)
    .single();

  if (leadErr || !lead) {
    return { success: false, error: "Lead not found" };
  }

  // Check opt-out
  if (lead.is_opted_out) {
    return { success: false, error: "Lead has opted out" };
  }

  // Check consent exists
  if (!lead.consent_id) {
    return { success: false, error: "No consent record" };
  }

  // Check window
  if (!isWithinWindow(lead.wa_window_expires_at)) {
    return { success: false, error: "24h window expired — use template" };
  }

  try {
    const { message_id } = await sendTextMessage(lead.phone_normalized, content);

    // Store message
    await supabase.from("messages").insert({
      lead_id: leadId,
      wa_message_id: message_id,
      direction: "outbound",
      sender_type: senderType,
      content,
      content_type: "text",
      is_within_window: true,
    });

    // Update lead timestamps
    const now = new Date().toISOString();
    const updateField =
      senderType === "human"
        ? { last_human_message_at: now }
        : { last_bot_message_at: now };

    await supabase
      .from("leads")
      .update(updateField)
      .eq("id", leadId);

    return { success: true, message_id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: errorMsg };
  }
}

/**
 * Send a template message to a lead (works outside 24h window).
 */
export async function sendTemplateToLead(
  leadId: string,
  templateName: string,
  languageCode: string,
  components?: WATemplateComponent[]
): Promise<SendResult> {
  const supabase = createSupabaseAdmin();

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("phone_normalized, is_opted_out, consent_id")
    .eq("id", leadId)
    .single();

  if (leadErr || !lead) {
    return { success: false, error: "Lead not found" };
  }

  if (lead.is_opted_out) {
    return { success: false, error: "Lead has opted out" };
  }

  if (!lead.consent_id) {
    return { success: false, error: "No consent record" };
  }

  // Verify template is approved
  const { data: template } = await supabase
    .from("wa_templates")
    .select("wa_status")
    .eq("template_name", templateName)
    .single();

  if (!template || template.wa_status !== "approved") {
    return { success: false, error: "Template not approved" };
  }

  try {
    const { message_id } = await sendTemplateMessage(
      lead.phone_normalized,
      templateName,
      languageCode,
      components
    );

    await supabase.from("messages").insert({
      lead_id: leadId,
      wa_message_id: message_id,
      direction: "outbound",
      sender_type: "template",
      content: templateName,
      content_type: "template",
      template_name: templateName,
      is_within_window: false,
    });

    return { success: true, message_id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: errorMsg };
  }
}
