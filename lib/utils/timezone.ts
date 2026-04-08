/**
 * Check if current time is within quiet hours (21:00-08:00) in a given timezone.
 */
export function isQuietHours(timezone: string): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(now), 10);
  return hour >= 21 || hour < 8;
}

/**
 * Get the default timezone for a phone number based on country code.
 */
export function getDefaultTimezone(phone: string): string {
  if (phone.startsWith("+52")) return "America/Mexico_City";
  return "America/Chicago";
}
