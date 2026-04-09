"use client";

import { useState } from "react";

const platformUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://your-platform.vercel.app";

export default function WidgetPage() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="${platformUrl}/api/widget?lang=${lang}" defer></script>`;

  function handleCopy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-primary-900">
            Widget Embebible
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Copia el snippet y pegalo antes de {"</body>"} en el sitio web de
            la firma.
          </p>
        </div>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as "es" | "en")}
          className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="mt-8">
        <div className="rounded-xl border border-surface-border bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg text-primary-900">
                Snippet Global
              </h3>
              <p className="mt-0.5 text-sm text-text-tertiary">
                WhatsApp: +1 713 876 3560
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                copied
                  ? "bg-green-100 text-green-800"
                  : "border border-surface-border bg-white text-text-secondary hover:bg-surface-muted"
              }`}
            >
              {copied ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copiar snippet
                </>
              )}
            </button>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg bg-primary-900 p-4">
            <code className="block whitespace-pre text-xs leading-relaxed text-primary-100 font-mono">
              {snippet}
            </code>
          </div>

          <p className="mt-3 text-xs text-text-tertiary">
            Pega este codigo justo antes de {"</body>"} en el sitio web.
            Opcionalmente agrega <code className="rounded bg-white px-1.5 py-0.5 text-xs font-mono">office=texas</code> al URL para tracking por oficina.
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 rounded-xl border border-surface-border bg-surface-muted p-6">
        <h3 className="font-display text-lg text-primary-900">
          Instrucciones
        </h3>
        <ol className="mt-3 space-y-2 text-sm text-text-secondary list-decimal pl-5">
          <li>
            Copia el snippet usando el boton &quot;Copiar snippet&quot;
          </li>
          <li>
            Abre el editor del sitio web de la firma (WordPress, Wix, HTML,
            etc.)
          </li>
          <li>
            Pega el codigo justo antes de la etiqueta{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs font-mono">
              {"</body>"}
            </code>
          </li>
          <li>Guarda y publica los cambios</li>
          <li>
            Verifica que el boton de WhatsApp aparezca en la esquina inferior
            derecha
          </li>
        </ol>
      </div>
    </div>
  );
}
