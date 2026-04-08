export type TeamMemberRole = "admin" | "attorney" | "paralegal" | "intake";

export interface TeamMember {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  role: TeamMemberRole;
  office_location: string | null;
  specialties: string[];
  is_available: boolean;
  is_active: boolean;
  can_receive_assignments: boolean;
  max_concurrent_chats: number;
  current_chat_count: number;
  last_assigned_at: string | null;
  total_assigned: number;
  total_closed_won: number;
  total_closed_lost: number;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ConversationEventType =
  | "window_opened"
  | "window_closed"
  | "window_renewed"
  | "handoff_to_human"
  | "handoff_accepted"
  | "handoff_rejected"
  | "followup_sent"
  | "followup_skipped"
  | "opt_out"
  | "opt_in"
  | "template_sent"
  | "template_failed"
  | "blocked"
  | "spam_reported"
  | "qualification_complete"
  | "qualification_failed"
  | "status_changed"
  | "priority_changed"
  | "assigned"
  | "unassigned"
  | "transferred"
  | "note_added"
  | "tag_added"
  | "tag_removed"
  | "phone_viewed"
  | "data_exported"
  | "lead_archived"
  | "lead_restored"
  | "consent_recorded"
  | "consent_revoked"
  | "message_failed"
  | "message_retried"
  | "quiet_hours_blocked";

export type EventTriggeredBy =
  | "system"
  | "bot"
  | "human"
  | "user"
  | "cron"
  | "webhook";

export interface ConversationEvent {
  id: string;
  lead_id: string;
  event_type: ConversationEventType;
  event_data: Record<string, unknown>;
  triggered_by: EventTriggeredBy;
  actor_id: string | null;
  ip_address: string | null;
  created_at: string;
}

export type WindowStatus = "open" | "closing_soon" | "expiring" | "closed";

export interface WindowInfo {
  status: WindowStatus;
  expires_at: string | null;
  remaining_ms: number;
  label: string;
  color: "green" | "yellow" | "orange" | "red";
}

export interface OptOutRecord {
  id: string;
  phone_normalized: string;
  lead_id: string | null;
  reason: string;
  opted_out_at: string;
  created_at: string;
}

export interface AnalyticsDaily {
  id: string;
  date: string;
  office_location: string | null;
  source_campaign: string | null;
  source_medium: string | null;
  total_leads: number;
  qualified_leads: number;
  assigned_leads: number;
  closed_won: number;
  closed_lost: number;
  opt_outs: number;
  avg_first_response_ms: number | null;
  avg_handoff_ms: number | null;
  total_messages_inbound: number;
  total_messages_outbound: number;
  total_templates_sent: number;
  total_followups_sent: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardKPIs {
  total_leads: number;
  qualified_rate: number;
  avg_response_time_min: number;
  avg_handoff_time_min: number;
  opt_out_rate: number;
}

export interface LeadsBySource {
  source: string;
  count: number;
}

export interface LeadsOverTime {
  date: string;
  count: number;
}
