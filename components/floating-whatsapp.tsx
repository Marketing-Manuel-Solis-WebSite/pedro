"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { WhatsAppIcon } from "./whatsapp-cta";
import { getConsentTextForRecording } from "./consent-microcopy";
import { trackWhatsAppClick, trackConsentError } from "@/lib/analytics/tracker";
import type { ConsentLanguage } from "@/lib/config/consent";

interface FloatingWhatsAppProps {
  officePhone: string;
  officeName: string;
  officeSlug: string;
  prefilledMessage?: string;
  campaignId?: string;
  language?: ConsentLanguage;
}

const CONSENT_TIMEOUT_MS = 2000;
const FAILED_CONSENT_KEY = "pedro_failed_consents";

export function FloatingWhatsApp({
  officePhone,
  officeName,
  officeSlug,
  prefilledMessage,
  campaignId,
  language = "es",
}: FloatingWhatsAppProps) {
  const [visible, setVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(false);
  const tooltipShownRef = useRef(false);
  const heroPassedRef = useRef(false);

  // Fade in after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Pulse every 8 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 600);
    }, 8000);
    return () => clearInterval(interval);
  }, [visible]);

  // Show tooltip once after scrolling past hero
  useEffect(() => {
    function handleScroll() {
      if (tooltipShownRef.current) return;
      if (window.scrollY > window.innerHeight * 0.7 && !heroPassedRef.current) {
        heroPassedRef.current = true;
        tooltipShownRef.current = true;
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = useCallback(async () => {
    const timestamp = new Date().toISOString();
    const sourceUrl = window.location.href;
    const params = new URLSearchParams(window.location.search);
    const consentInfo = getConsentTextForRecording(language);
    const consentEventId = crypto.randomUUID();

    const consentPayload = {
      phone: "",
      consent_type: "whatsapp_initial",
      consent_method: "button_click",
      source_url: sourceUrl,
      source_page_title: document.title,
      campaign: campaignId ?? params.get("utm_campaign"),
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
      legal_text_shown: consentInfo.text,
      legal_text_version: consentInfo.version,
      privacy_policy_url: consentInfo.privacyUrl,
      privacy_policy_version: consentInfo.privacyPolicyVersion,
      destination_phone: officePhone,
      device_fingerprint: null,
      language,
      consent_event_id: consentEventId,
      timestamp,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONSENT_TIMEOUT_MS);
      const res = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consentPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`${res.status}`);
    } catch (err) {
      try {
        const existing = JSON.parse(localStorage.getItem(FAILED_CONSENT_KEY) || "[]");
        existing.push(consentPayload);
        localStorage.setItem(FAILED_CONSENT_KEY, JSON.stringify(existing));
      } catch { /* noop */ }
      trackConsentError({
        officeName,
        error: err instanceof Error ? err.message : "Unknown",
      });
    }

    trackWhatsAppClick({
      officeName,
      campaignId: campaignId ?? params.get("utm_campaign"),
      consentEventId,
      officeSlug,
    });

    const phone = officePhone.replace("+", "");
    const message = prefilledMessage ? encodeURIComponent(prefilledMessage) : "";
    window.open(
      `https://wa.me/${phone}${message ? `?text=${message}` : ""}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, [officePhone, officeName, officeSlug, prefilledMessage, campaignId, language]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap rounded-lg bg-primary-800 px-4 py-2 text-sm text-white shadow-lg">
          {language === "en" ? "Need help?" : "¿Necesitas ayuda?"}
          <div className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-primary-800" />
        </div>
      )}

      {/* Button */}
      <button
        type="button"
        onClick={handleClick}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-wa transition-transform duration-[var(--transition-normal)] hover:scale-110 focus:outline-none focus:ring-2 focus:ring-whatsapp focus:ring-offset-2 sm:h-[60px] sm:w-[60px] ${
          shouldPulse ? "animate-wa-pulse" : ""
        }`}
        aria-label={language === "en" ? "Message us on WhatsApp" : "Escríbenos por WhatsApp"}
        role="button"
      >
        <WhatsAppIcon className="h-7 w-7 sm:h-8 sm:w-8" />
      </button>
    </div>
  );
}
