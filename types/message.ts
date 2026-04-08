export type MessageDirection = "inbound" | "outbound";
export type SenderType = "user" | "bot" | "human" | "template" | "system";
export type ContentType =
  | "text"
  | "image"
  | "document"
  | "audio"
  | "video"
  | "template"
  | "interactive"
  | "reaction";

export interface Message {
  id: string;
  lead_id: string;
  wa_message_id: string | null;
  direction: MessageDirection;
  sender_type: SenderType;
  sender_id: string | null;
  content: string;
  content_type: ContentType;
  template_name: string | null;
  template_variables: Record<string, unknown> | null;
  is_within_window: boolean;
  ai_intent_detected: string | null;
  ai_sentiment: string | null;
  ai_handoff_recommended: boolean;
  ai_qualification_data: Record<string, unknown> | null;
  delivered_at: string | null;
  read_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  retry_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
}
