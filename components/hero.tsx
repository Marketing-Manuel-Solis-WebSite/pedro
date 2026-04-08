import { WhatsAppCTA } from "./whatsapp-cta";
import type { OfficeLocation } from "@/lib/config/offices";

interface HeroProps {
  office: OfficeLocation;
  language?: "es" | "en";
}

export function Hero({ office, language = "es" }: HeroProps) {
  const title =
    language === "en"
      ? `Immigration Attorneys in ${office.city}`
      : `Abogados de Inmigración en ${office.city}`;

  const subtitle =
    language === "en"
      ? "We fight for your rights. Free consultation via WhatsApp — fast, confidential, and with no obligation."
      : "Luchamos por tus derechos. Consulta gratis por WhatsApp — rápida, confidencial y sin compromiso.";

  const callText = language === "en" ? "Call now" : "Llamar ahora";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "radial-gradient(circle at 25px 25px, white 2px, transparent 0)",
        backgroundSize: "50px 50px",
      }} />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-primary-100 sm:text-xl">
            {subtitle}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <WhatsAppCTA
              variant="hero"
              officePhone={office.whatsappPhone}
              officeName={office.name}
              officeSlug={office.slug}
              prefilledMessage={
                language === "en"
                  ? `Hi, I'd like a consultation from the ${office.city} office.`
                  : `Hola, me gustaría una consulta de la oficina de ${office.city}.`
              }
              language={language}
            />

            <a
              href={`tel:${office.phone}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-200 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {callText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
