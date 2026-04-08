"use client";

import { useState } from "react";

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
  source: string;
}

interface ReviewsCarouselProps {
  language?: "es" | "en";
}

const reviews: Review[] = [
  {
    name: "María G.",
    rating: 5,
    text: "Excelente atención. Me ayudaron con todo el proceso de mi residencia y siempre estuvieron disponibles para resolver mis dudas. Muy profesionales.",
    date: "2025-11",
    source: "Google",
  },
  {
    name: "José L.",
    rating: 5,
    text: "Los recomiendo ampliamente. Mi caso de asilo fue manejado con mucha dedicación y logramos un resultado favorable. Gracias por todo.",
    date: "2025-10",
    source: "Google",
  },
  {
    name: "Ana R.",
    rating: 5,
    text: "Desde la primera consulta me sentí en confianza. Explicaron todo claramente y el proceso fue más rápido de lo que esperaba.",
    date: "2025-09",
    source: "Google",
  },
  {
    name: "Carlos M.",
    rating: 5,
    text: "Muy agradecido con el equipo. Me ayudaron con la petición familiar de mi esposa y todo salió perfecto. Servicio de primera.",
    date: "2025-08",
    source: "Google",
  },
  {
    name: "Laura P.",
    rating: 5,
    text: "Profesionales y humanos. Entendieron mi situación y me orientaron paso a paso. No duden en contactarlos.",
    date: "2025-07",
    source: "Google",
  },
];

export function ReviewsCarousel({ language = "es" }: ReviewsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const sectionTitle = language === "en" ? "What Our Clients Say" : "Lo Que Dicen Nuestros Clientes";
  const sourceLabel = language === "en" ? "Verified review on" : "Opinión verificada en";

  const prev = () => setCurrent((c) => (c === 0 ? reviews.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === reviews.length - 1 ? 0 : c + 1));

  // Show 1 on mobile, 3 on desktop
  const getVisibleReviews = () => {
    const visible: Review[] = [];
    for (let i = 0; i < 3; i++) {
      visible.push(reviews[(current + i) % reviews.length]);
    }
    return visible;
  };

  return (
    <section id="opiniones" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-display text-3xl text-primary-900 sm:text-4xl">
          {sectionTitle}
        </h2>

        <div className="relative mt-12">
          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            {getVisibleReviews().map((review, idx) => (
              <div
                key={`${review.name}-${idx}`}
                className={`rounded-xl border border-surface-border bg-surface-card p-6 shadow-sm ${
                  idx > 0 ? "hidden sm:block" : ""
                }`}
              >
                <div className="flex items-center gap-1 text-accent-500">
                  {Array.from({ length: review.rating }, (_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary-900">
                    {review.name}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {sourceLabel} {review.source}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-text-secondary shadow-sm hover:bg-surface-muted transition-colors"
              aria-label="Anterior"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex gap-2">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx === current ? "bg-primary-600" : "bg-surface-border"
                  }`}
                  aria-label={`Review ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-text-secondary shadow-sm hover:bg-surface-muted transition-colors"
              aria-label="Siguiente"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
