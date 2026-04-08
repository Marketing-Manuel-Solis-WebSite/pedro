"use client";

import { CONSENT_MICROCOPY, type ConsentLanguage } from "@/lib/config/consent";
import Link from "next/link";

interface ConsentMicrocopyProps {
  language: ConsentLanguage;
  className?: string;
}

export function ConsentMicrocopy({ language, className }: ConsentMicrocopyProps) {
  const copy = CONSENT_MICROCOPY[language];

  // Split the text around the privacy link text to insert a Link
  const parts = copy.text.split(copy.privacyLinkText);

  return (
    <p
      className={`text-xs leading-relaxed text-text-secondary ${className ?? ""}`}
      data-consent-version={copy.version}
    >
      {parts[0]}
      <Link
        href={copy.privacyUrl}
        className="underline text-text-link hover:text-primary-700 transition-colors"
        target="_blank"
      >
        {copy.privacyLinkText}
      </Link>
      {parts[1]}
    </p>
  );
}

/**
 * Get the full consent text (including privacy link text) for recording.
 */
export function getConsentTextForRecording(language: ConsentLanguage): {
  text: string;
  version: string;
  privacyUrl: string;
  privacyPolicyVersion: string;
} {
  const copy = CONSENT_MICROCOPY[language];
  return {
    text: copy.text,
    version: copy.version,
    privacyUrl: copy.privacyUrl,
    privacyPolicyVersion: copy.privacyPolicyVersion,
  };
}
