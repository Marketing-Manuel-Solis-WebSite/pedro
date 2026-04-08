"use client";

import { offices } from "@/lib/config/offices";
import { CONSENT_MICROCOPY } from "@/lib/config/consent";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="font-display text-2xl text-primary-900">Configuración</h1>

      <div className="mt-8 space-y-8">
        {/* Office Locations */}
        <section>
          <h2 className="font-display text-lg text-primary-900">Oficinas</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-surface-border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-border bg-surface-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Ciudad</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Teléfono</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">WhatsApp</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Zona horaria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {offices.map((office) => (
                  <tr key={office.slug}>
                    <td className="px-4 py-3 font-medium text-text-primary">{office.city}</td>
                    <td className="px-4 py-3 text-text-secondary">{office.state}</td>
                    <td className="px-4 py-3 text-text-secondary">{office.phone}</td>
                    <td className="px-4 py-3 text-text-secondary">{office.whatsappPhone}</td>
                    <td className="px-4 py-3 text-text-secondary">{office.timezone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Consent Text Versions */}
        <section>
          <h2 className="font-display text-lg text-primary-900">
            Textos de Consentimiento
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(Object.entries(CONSENT_MICROCOPY) as [string, typeof CONSENT_MICROCOPY.es][]).map(
              ([lang, copy]) => (
                <div
                  key={lang}
                  className="rounded-xl border border-surface-border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary uppercase">
                      {lang}
                    </span>
                    <span className="text-xs text-text-tertiary">{copy.version}</span>
                  </div>
                  <div className="mt-3 rounded-lg bg-surface-muted p-3">
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {copy.text}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Environment Status */}
        <section>
          <h2 className="font-display text-lg text-primary-900">Estado del Sistema</h2>
          <div className="mt-4 rounded-xl border border-surface-border bg-white p-5 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <EnvStatus label="Supabase" configured={!!process.env.NEXT_PUBLIC_SUPABASE_URL} />
              <EnvStatus label="WhatsApp API" configured={false} hint="Server-side only" />
              <EnvStatus label="Gemini AI" configured={false} hint="Server-side only" />
              <EnvStatus label="Google Analytics" configured={!!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID} />
              <EnvStatus label="Google Ads" configured={!!process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function EnvStatus({
  label,
  configured,
  hint,
}: {
  label: string;
  configured: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        {hint && <span className="text-xs text-text-tertiary">{hint}</span>}
        <span
          className={`h-2 w-2 rounded-full ${configured ? "bg-status-success" : "bg-surface-border"}`}
        />
      </div>
    </div>
  );
}
