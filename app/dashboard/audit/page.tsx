"use client";

import { useState, useEffect } from "react";
import { maskPhone } from "@/lib/utils/phone";
import type { ConsentRecord } from "@/types/consent";

export default function AuditPage() {
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Audit records are fetched directly — in production this would
    // use a dedicated API with admin auth
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-primary-900">Auditoría de Consentimiento</h1>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Teléfono</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Tipo</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Método</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Versión</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Activo</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                  Cargando...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                  No hay registros de consentimiento aún.
                  Los registros aparecerán cuando los usuarios hagan clic en el botón de WhatsApp.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-surface-muted transition-colors">
                  <td className="px-4 py-3 text-text-secondary">
                    {maskPhone(record.phone)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{record.consent_type}</td>
                  <td className="px-4 py-3 text-text-secondary">{record.consent_method}</td>
                  <td className="px-4 py-3 text-xs text-text-tertiary">
                    {record.legal_text_version}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        record.is_active ? "bg-status-success" : "bg-status-danger"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 text-text-tertiary">
                    {new Date(record.created_at).toLocaleString("es-MX")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
