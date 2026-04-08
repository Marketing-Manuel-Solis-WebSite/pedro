export type ConsentType = "whatsapp_initial" | "whatsapp_followup" | "marketing";
export type ConsentMethod = "button_click" | "reply_message" | "template_reply";

export interface ConsentRecord {
  id: string;
  consent_event_id: string;
  phone: string;
  consent_type: ConsentType;
  consent_method: ConsentMethod;
  source_url: string;
  source_page_title: string | null;
  campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  legal_text_shown: string;
  legal_text_version: string;
  privacy_policy_url: string;
  privacy_policy_version: string;
  destination_phone: string;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  language: string;
  is_active: boolean;
  is_complete: boolean;
  revoked_at: string | null;
  revocation_method: string | null;
  created_at: string;
}

export interface ConsentPayload {
  phone: string;
  consent_type: ConsentType;
  consent_method: ConsentMethod;
  source_url: string;
  source_page_title: string | null;
  campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  legal_text_shown: string;
  legal_text_version: string;
  privacy_policy_url: string;
  privacy_policy_version: string;
  destination_phone: string;
  device_fingerprint: string | null;
  language: string;
  consent_event_id: string;
}
