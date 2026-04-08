import { ALL_OPT_OUT_KEYWORDS } from "@/lib/config/consent";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Check if a message text matches an opt-out keyword.
 */
export function isOptOutMessage(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return ALL_OPT_OUT_KEYWORDS.some((keyword) => normalized === keyword);
}

/**
 * Process opt-out for a lead: update lead, deactivate consent, log event.
 */
export async function processOptOut(leadId: string, phone: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();

  // Update lead (triggers sync_opt_out_list and consent deactivation)
  await supabase
    .from("leads")
    .update({ is_opted_out: true, opted_out_at: now, opted_out_method: "keyword" })
    .eq("id", leadId);

  // Deactivate all consent records for this phone
  await supabase
    .from("consent_records")
    .update({ is_active: false, revoked_at: now, revocation_method: "keyword" })
    .eq("phone", phone)
    .eq("is_active", true);

  // Log event
  await supabase.from("conversation_events").insert({
    lead_id: leadId,
    event_type: "opt_out",
    event_data: { method: "keyword" },
    triggered_by: "user",
  });
}

/**
 * Get the opt-out confirmation message based on detected language.
 */
export function getOptOutConfirmation(language: string): string {
  if (language === "en") {
    return "Done, we've stopped messaging you. If you need help in the future, feel free to reach out again. Thank you.";
  }
  return "Listo, dejamos de enviarte mensajes. Si en el futuro necesitas ayuda, puedes escribirnos de nuevo. Gracias.";
}
