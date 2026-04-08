/**
 * Client-side analytics event helpers.
 * These are meant to be called in browser context only.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackWhatsAppClick(params: {
  officeName: string;
  campaignId: string | null;
  consentEventId: string;
  officeSlug: string;
}): void {
  if (typeof window === "undefined" || !window.gtag) return;

  // GA4 event
  window.gtag("event", "whatsapp_click", {
    event_category: "lead_capture",
    event_label: params.officeName,
    campaign_id: params.campaignId,
    office: params.officeSlug,
    consent_event_id: params.consentEventId,
    value: 1,
  });

  // Google Ads conversion
  const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (conversionId && conversionLabel) {
    window.gtag("event", "conversion", {
      send_to: `${conversionId}/${conversionLabel}`,
      value: 1.0,
      currency: "USD",
    });
  }
}

export function trackConsentError(params: {
  officeName: string;
  error: string;
}): void {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", "consent_error", {
    event_category: "error",
    event_label: params.officeName,
    error_message: params.error,
  });
}
