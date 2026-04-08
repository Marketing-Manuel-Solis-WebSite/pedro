export type LeadStatus =
  | "new"
  | "qualified"
  | "assigned"
  | "in_progress"
  | "closed_won"
  | "closed_lost"
  | "spam"
  | "archived";

export type LeadPriority = "low" | "normal" | "high" | "urgent";

export interface Lead {
  id: string;
  phone: string;
  phone_normalized: string;
  name: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  country: string;
  description: string | null;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to: string | null;
  qualification_score: number | null;
  qualification_summary: string | null;
  office_location: string | null;
  case_type: string | null;
  case_subtype: string | null;
  source_url: string;
  source_campaign: string | null;
  source_medium: string | null;
  source_utm_source: string | null;
  source_utm_campaign: string | null;
  source_utm_content: string | null;
  source_utm_term: string | null;
  consent_id: string;
  wa_conversation_id: string | null;
  wa_window_expires_at: string | null;
  last_user_message_at: string | null;
  last_bot_message_at: string | null;
  last_human_message_at: string | null;
  followup_count: number;
  is_opted_out: boolean;
  opted_out_at: string | null;
  opted_out_method: string | null;
  is_archived: boolean;
  archived_at: string | null;
  archived_by: string | null;
  notes: string | null;
  tags: string[];
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface LeadWithMessages extends Lead {
  recent_messages: import("./message").Message[];
}

export interface LeadFilters {
  status?: LeadStatus;
  assigned_to?: string;
  office_location?: string;
  priority?: LeadPriority;
  search?: string;
}
