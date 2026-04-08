"use client";

import { useState, useEffect } from "react";
import type { WATemplate } from "@/types/whatsapp";

const statusColors: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<WATemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      const res = await fetch("/api/templates");
      const json = await res.json();
      setTemplates(json.data || []);
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-300 border-t-primary-700" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="font-display text-2xl text-primary-900">Plantillas WhatsApp</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.length === 0 ? (
          <p className="text-sm text-text-tertiary col-span-full">
            No hay plantillas configuradas
          </p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-surface-border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {template.template_name}
                  </h3>
                  <p className="mt-0.5 text-xs text-text-tertiary">
                    {template.category} · {template.language}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColors[template.wa_status] || statusColors.pending
                  }`}
                >
                  {template.wa_status}
                </span>
              </div>

              {/* Preview */}
              <div className="mt-4 rounded-lg bg-surface-muted p-3">
                <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
                  {template.body_text}
                </p>
              </div>

              {template.variables.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-text-tertiary">
                    Variables: {template.variables.join(", ")}
                  </p>
                </div>
              )}

              {template.use_case && (
                <p className="mt-2 text-xs text-text-tertiary">
                  Uso: {template.use_case}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
