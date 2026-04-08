import { offices } from "@/lib/config/offices";
import { WhatsAppCTA } from "./whatsapp-cta";

interface OfficesMapProps {
  language?: "es" | "en";
}

export function OfficesMap({ language = "es" }: OfficesMapProps) {
  const sectionTitle =
    language === "en" ? "Our Offices" : "Nuestras Oficinas";

  return (
    <section id="oficinas" className="bg-surface-bg py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl text-primary-900 sm:text-4xl">
          {sectionTitle}
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {offices.map((office) => (
            <div
              key={office.slug}
              className="flex flex-col rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm"
            >
              <div className="flex-1">
                <h3 className="font-display text-lg text-primary-900">
                  {office.city}, {office.stateCode}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">{office.address}</p>
                <a
                  href={`tel:${office.phone}`}
                  className="mt-2 inline-block text-sm font-medium text-text-link hover:text-primary-700 transition-colors"
                >
                  {office.phone}
                </a>
              </div>
              <div className="mt-4">
                <WhatsAppCTA
                  variant="inline"
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
