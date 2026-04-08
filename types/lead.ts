export type LeadStatus =
  | "new"
  | "ai_qualified"
  | "assigned"
  | "contacted"
  | "consultation"
  | "proposal_sent"
  | "negotiation"
  | "contracted"
  | "in_process"
  | "completed"
  | "closed_lost"
  | "closed_no_response"
  | "spam"
  | "archived";

export type LeadPriority = "low" | "normal" | "high" | "urgent";

export interface LeadStatusConfig {
  label: string;
  color: string;
  order: number;
}

export const LEAD_STATUS_CONFIG: Record<LeadStatus, LeadStatusConfig> = {
  new:                { label: "Nuevo",              color: "#718096", order: 0 },
  ai_qualified:       { label: "Calificado IA",     color: "#4299e1", order: 1 },
  assigned:           { label: "Asignado",           color: "#805ad5", order: 2 },
  contacted:          { label: "Contactado",         color: "#d69e2e", order: 3 },
  consultation:       { label: "En consulta",        color: "#ed8936", order: 4 },
  proposal_sent:      { label: "Propuesta enviada",  color: "#e53e3e", order: 5 },
  negotiation:        { label: "En negociacion",     color: "#dd6b20", order: 6 },
  contracted:         { label: "Contratado",         color: "#38a169", order: 7 },
  in_process:         { label: "En tramite",         color: "#319795", order: 8 },
  completed:          { label: "Completado",         color: "#2f855a", order: 9 },
  closed_lost:        { label: "Perdido",            color: "#e53e3e", order: 10 },
  closed_no_response: { label: "Sin respuesta",      color: "#a0aec0", order: 11 },
  spam:               { label: "Spam",               color: "#fc8181", order: 12 },
  archived:           { label: "Archivado",          color: "#cbd5e0", order: 13 },
};

export const PIPELINE_STAGES: LeadStatus[] = [
  "new", "ai_qualified", "assigned", "contacted", "consultation",
  "proposal_sent", "negotiation", "contracted", "in_process", "completed",
];

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
