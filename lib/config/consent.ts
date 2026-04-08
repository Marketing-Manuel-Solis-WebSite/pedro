export const CONSENT_MICROCOPY = {
  es: {
    version: "consent-microcopy-es-v1.0",
    text: "Al continuar, nos autorizas a responderte por WhatsApp para atender tu solicitud. Consulta nuestro Aviso de Privacidad. Puedes dejar de recibir mensajes escribiendo BAJA en cualquier momento.",
    privacyLinkText: "Aviso de Privacidad",
    privacyUrl: "/privacidad",
    privacyPolicyVersion: "privacy-es-v1.0",
  },
  en: {
    version: "consent-microcopy-en-v1.0",
    text: "By continuing, you authorize us to respond via WhatsApp regarding your inquiry. See our Privacy Policy. You can stop receiving messages by texting STOP at any time.",
    privacyLinkText: "Privacy Policy",
    privacyUrl: "/privacy",
    privacyPolicyVersion: "privacy-en-v1.0",
  },
} as const;

export type ConsentLanguage = keyof typeof CONSENT_MICROCOPY;

export const OPT_OUT_KEYWORDS_ES = [
  "baja",
  "parar",
  "cancelar",
  "no más",
  "detener",
  "no quiero",
] as const;

export const OPT_OUT_KEYWORDS_EN = [
  "stop",
  "unsubscribe",
  "cancel",
  "quit",
  "opt out",
  "optout",
] as const;

export const ALL_OPT_OUT_KEYWORDS = [
  ...OPT_OUT_KEYWORDS_ES,
  ...OPT_OUT_KEYWORDS_EN,
] as const;
