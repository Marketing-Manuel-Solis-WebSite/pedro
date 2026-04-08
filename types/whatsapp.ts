export interface WAIncomingMessage {
  object: "whatsapp_business_account";
  entry: WAEntry[];
}

export interface WAEntry {
  id: string;
  changes: WAChange[];
}

export interface WAChange {
  value: WAChangeValue;
  field: "messages";
}

export interface WAChangeValue {
  messaging_product: "whatsapp";
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WAContact[];
  messages?: WAMessage[];
  statuses?: WAStatus[];
}

export interface WAContact {
  profile: { name: string };
  wa_id: string;
}

export interface WAMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "image" | "document" | "interactive" | "button";
  text?: { body: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description: string };
  };
  button?: { text: string; payload: string };
}

export interface WAStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: WAError[];
}

export interface WAError {
  code: number;
  title: string;
  message: string;
}

export interface WASendTextPayload {
  messaging_product: "whatsapp";
  to: string;
  type: "text";
  text: { body: string };
}

export interface WASendTemplatePayload {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: {
    name: string;
    language: { code: string };
    components?: WATemplateComponent[];
  };
}

export interface WATemplateComponent {
  type: "body" | "header" | "button";
  parameters: WATemplateParameter[];
}

export interface WATemplateParameter {
  type: "text" | "image" | "document";
  text?: string;
}

export type WATemplateStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "paused"
  | "disabled";

export interface WATemplate {
  id: string;
  template_name: string;
  display_name: string;
  language: string;
  category: "utility" | "marketing" | "authentication";
  body_text: string;
  header_text: string | null;
  header_type: "text" | "image" | "document" | "video" | null;
  footer_text: string | null;
  buttons: Record<string, unknown>[] | null;
  variables: string[];
  sample_values: string[];
  wa_status: WATemplateStatus;
  wa_template_id: string | null;
  wa_rejection_reason: string | null;
  use_case: string;
  send_count: number;
  last_sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
