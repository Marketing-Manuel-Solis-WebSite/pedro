import { createSupabaseAdmin } from "@/lib/supabase/admin";
import type { ConsentPayload } from "@/types/consent";

export async function recordConsent(
  payload: ConsentPayload,
  ipAddress: string | null,
  userAgent: string | null
): Promise<{ consent_id: string; status: "recorded" | "duplicate" }> {
  const supabase = createSupabaseAdmin();

  // Idempotency check by consent_event_id
  const { data: existing } = await supabase
    .from("consent_records")
    .select("id")
    .eq("consent_event_id", payload.consent_event_id)
    .maybeSingle();

  if (existing) {
    return { consent_id: existing.id, status: "duplicate" };
  }

  const { data, error } = await supabase
    .from("consent_records")
    .insert({
      consent_event_id: payload.consent_event_id,
      phone: payload.phone,
      consent_type: payload.consent_type,
      consent_method: payload.consent_method,
      source_url: payload.source_url,
      source_page_title: payload.source_page_title,
      campaign: payload.campaign,
      utm_source: payload.utm_source,
      utm_medium: payload.utm_medium,
      utm_campaign: payload.utm_campaign,
      utm_content: payload.utm_content,
      utm_term: payload.utm_term,
      legal_text_shown: payload.legal_text_shown,
      legal_text_version: payload.legal_text_version,
      privacy_policy_url: payload.privacy_policy_url,
      privacy_policy_version: payload.privacy_policy_version,
      destination_phone: payload.destination_phone,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_fingerprint: payload.device_fingerprint,
      language: payload.language,
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to record consent: ${error.message}`);

  return { consent_id: data.id, status: "recorded" };
}
