"use client";

import { useCallback } from "react";
import { ConsentMicrocopy, getConsentTextForRecording } from "./consent-microcopy";
import type { ConsentLanguage } from "@/lib/config/consent";

interface WhatsAppCTAProps {
  variant: "hero" | "floating" | "inline";
  officePhone: string;
  officeName: string;
  officeSlug: string;
  prefilledMessage?: string;
  campaignId?: string;
  language?: ConsentLanguage;
}

const CONSENT_TIMEOUT_MS = 2000;
const FAILED_CONSENT_KEY = "pedro_failed_consents";

function getUTMParams(): Record<string, string | null> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content"),
    utm_term: params.get("utm_term"),
  };
}

function queueFailedConsent(payload: Record<string, unknown>): void {
  try {
    const existing = JSON.parse(localStorage.getItem(FAILED_CONSENT_KEY) || "[]");
    existing.push(payload);
    localStorage.setItem(FAILED_CONSENT_KEY, JSON.stringify(existing));
  } catch {
    // localStorage unavailable
  }
}

export function WhatsAppCTA({
  variant,
  officePhone,
  officeName,
  officeSlug,
  prefilledMessage,
  campaignId,
  language = "es",
}: WhatsAppCTAProps) {
  const handleClick = useCallback(async () => {
    const sourceUrl = window.location.href;
    const utms = getUTMParams();
    const consentInfo = getConsentTextForRecording(language);
    const consentEventId = crypto.randomUUID();

    const consentPayload = {
      phone: "",
      consent_type: "whatsapp_initial" as const,
      consent_method: "button_click" as const,
      source_url: sourceUrl,
      source_page_title: document.title,
      campaign: campaignId ?? utms.utm_campaign,
      utm_source: utms.utm_source,
      utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign,
      utm_content: utms.utm_content,
      utm_term: utms.utm_term,
      legal_text_shown: consentInfo.text,
      legal_text_version: consentInfo.version,
      privacy_policy_url: consentInfo.privacyUrl,
      privacy_policy_version: consentInfo.privacyPolicyVersion,
      destination_phone: officePhone,
      device_fingerprint: null,
      language,
      consent_event_id: consentEventId,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONSENT_TIMEOUT_MS);
      const response = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consentPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`${response.status}`);
    } catch {
      queueFailedConsent(consentPayload);
    }

    const phone = officePhone.replace("+", "");
    const message = prefilledMessage ? encodeURIComponent(prefilledMessage) : "";
    window.open(`https://wa.me/${phone}${message ? `?text=${message}` : ""}`, "_blank", "noopener,noreferrer");
  }, [officePhone, officeName, officeSlug, prefilledMessage, campaignId, language]);

  if (variant === "hero") {
    return (
      <div className="flex flex-col items-center gap-3">
        <button type="button" onClick={handleClick} className="inline-flex items-center gap-3 rounded-xl bg-whatsapp px-8 py-4 text-lg font-semibold text-white shadow-wa transition-all hover:brightness-110 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-whatsapp focus:ring-offset-2" aria-label="WhatsApp">
          <WhatsAppIcon className="h-6 w-6" />
          {language === "en" ? "Message us on WhatsApp" : "Escríbenos por WhatsApp"}
        </button>
        <ConsentMicrocopy language={language} className="max-w-sm text-center" />
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-2">
        <button type="button" onClick={handleClick} className="inline-flex items-center gap-2 rounded-lg bg-whatsapp px-6 py-3 text-base font-semibold text-white shadow-wa transition-all hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-whatsapp focus:ring-offset-2" aria-label="WhatsApp">
          <WhatsAppIcon className="h-5 w-5" />
          WhatsApp
        </button>
        <ConsentMicrocopy language={language} className="max-w-xs" />
      </div>
    );
  }

  return null;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export { WhatsAppIcon };
