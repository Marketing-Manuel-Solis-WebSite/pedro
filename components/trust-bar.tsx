interface TrustBarProps {
  language?: "es" | "en";
}

const stats = {
  es: [
    { value: "4.8", label: "Google Reviews", icon: "★★★★★" },
    { value: "500+", label: "Opiniones verificadas" },
    { value: "15+", label: "Años de experiencia" },
    { value: "10,000+", label: "Casos atendidos" },
  ],
  en: [
    { value: "4.8", label: "Google Reviews", icon: "★★★★★" },
    { value: "500+", label: "Verified reviews" },
    { value: "15+", label: "Years of experience" },
    { value: "10,000+", label: "Cases handled" },
  ],
};

export function TrustBar({ language = "es" }: TrustBarProps) {
  const items = stats[language];

  return (
    <section className="border-y border-surface-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <div className="flex items-center justify-center gap-1">
                {item.icon && (
                  <span className="text-accent-500 text-sm">{item.icon}</span>
                )}
                <span className="font-display text-2xl text-primary-900 sm:text-3xl">
                  {item.value}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-secondary sm:text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
