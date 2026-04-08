/**
 * Normalize a phone number to E.164 format.
 * Handles common formats: +1..., 1..., (832)..., etc.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  // Mexican numbers: 10 digits starting with common area codes
  if (digits.length === 10 && /^[2-9]/.test(digits)) {
    // Could be US or MX — default to US with +1
    return `+1${digits}`;
  }

  // Already has country code
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // Mexican with country code 52
  if (digits.length === 12 && digits.startsWith("52")) {
    return `+${digits}`;
  }

  // If already starts with +, just strip non-digits and re-add +
  if (phone.startsWith("+")) {
    return `+${digits}`;
  }

  // Fallback: return with + prefix
  return `+${digits}`;
}

/**
 * Mask a phone number for display: +1 *** *** 4567
 */
export function maskPhone(phone: string): string {
  if (phone.length < 4) return "***";
  const last4 = phone.slice(-4);
  const countryCode = phone.startsWith("+") ? phone.slice(0, phone.length - 10) : "";
  return `${countryCode} *** *** ${last4}`;
}

/**
 * Validate that a phone is in E.164 format.
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}
