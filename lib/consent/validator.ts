import type { ConsentPayload } from "@/types/consent";

const REQUIRED_FIELDS: (keyof ConsentPayload)[] = [
  "phone",
  "consent_type",
  "consent_method",
  "source_url",
  "legal_text_shown",
  "legal_text_version",
  "privacy_policy_url",
  "privacy_policy_version",
  "destination_phone",
  "language",
  "consent_event_id",
];

export interface ValidationResult {
  valid: boolean;
  missing_fields: string[];
}

export function validateConsentPayload(
  payload: Partial<ConsentPayload>
): ValidationResult {
  const missing: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = payload[field];
    if (value === undefined || value === null || value === "") {
      missing.push(field);
    }
  }

  return {
    valid: missing.length === 0,
    missing_fields: missing,
  };
}
