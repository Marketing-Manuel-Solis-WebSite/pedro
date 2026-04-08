interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

interface ServicesGridProps {
  language?: "es" | "en";
}

const services: Record<string, ServiceItem[]> = {
  es: [
    { title: "Visas de Trabajo", description: "H-1B, H-2A, H-2B, L-1, O-1 y más. Asesoría completa para obtener tu visa laboral.", icon: "briefcase" },
    { title: "Residencia Permanente", description: "Green Cards por familia, empleo, inversión o categorías especiales.", icon: "home" },
    { title: "Defensa de Deportación", description: "Representación ante corte de inmigración. Cancelación de remoción y alivio migratorio.", icon: "shield" },
    { title: "Asilo y Refugio", description: "Protección para quienes enfrentan persecución en su país de origen.", icon: "heart" },
    { title: "Peticiones Familiares", description: "Reunificación familiar. Peticiones para cónyuges, hijos y padres.", icon: "users" },
    { title: "Ciudadanía", description: "Naturalización y juramento. Te acompañamos en el último paso.", icon: "star" },
  ],
  en: [
    { title: "Work Visas", description: "H-1B, H-2A, H-2B, L-1, O-1 and more. Complete guidance for your work visa.", icon: "briefcase" },
    { title: "Permanent Residency", description: "Green Cards through family, employment, investment, or special categories.", icon: "home" },
    { title: "Deportation Defense", description: "Immigration court representation. Cancellation of removal and immigration relief.", icon: "shield" },
    { title: "Asylum & Refuge", description: "Protection for those facing persecution in their home country.", icon: "heart" },
    { title: "Family Petitions", description: "Family reunification. Petitions for spouses, children, and parents.", icon: "users" },
    { title: "Citizenship", description: "Naturalization and oath ceremony. We accompany you on the final step.", icon: "star" },
  ],
};

const icons: Record<string, React.ReactNode> = {
  briefcase: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a1 1 0 00-1 1v10a2 2 0 002 2h14a2 2 0 002-2V8a1 1 0 00-1-1zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>
  ),
  home: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
  ),
  shield: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
  ),
  heart: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
  ),
  users: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
  ),
  star: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  ),
};

export function ServicesGrid({ language = "es" }: ServicesGridProps) {
  const items = services[language];
  const sectionTitle = language === "en" ? "Our Services" : "Nuestros Servicios";

  return (
    <section id="servicios" className="bg-surface-bg py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl text-primary-900 sm:text-4xl">
          {sectionTitle}
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((service) => (
            <div
              key={service.title}
              className="group rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-100">
                {icons[service.icon]}
              </div>
              <h3 className="mt-4 font-display text-lg text-primary-900">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
