"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { maskPhone } from "@/lib/utils/phone";
import { QualificationBadge } from "@/components/dashboard/qualification-badge";
import type { Lead } from "@/types/lead";

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "new", label: "Nuevo" },
  { value: "qualified", label: "Calificado" },
  { value: "assigned", label: "Asignado" },
  { value: "in_progress", label: "En proceso" },
  { value: "closed_won", label: "Cerrado (ganado)" },
  { value: "closed_lost", label: "Cerrado (perdido)" },
  { value: "spam", label: "Spam" },
  { value: "archived", label: "Archivado" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/leads?${params}`);
      const json = await res.json();
      setLeads(json.data || []);
      setTotal(json.total || 0);
      setLoading(false);
    }
    fetchLeads();
  }, [statusFilter, search, page]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-primary-900">Leads</h1>
        <span className="text-sm text-text-tertiary">{total} total</span>
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64 rounded-lg border border-surface-border bg-white px-3 py-2 text-sm placeholder:text-text-tertiary focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-text-secondary focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Teléfono</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Ciudad</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-medium text-text-secondary">Score</th>
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
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">
                  No se encontraron leads
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-surface-muted transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="font-medium text-text-link hover:text-primary-700"
                    >
                      {lead.name || "Sin nombre"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {maskPhone(lead.phone_normalized)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{lead.city || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium capitalize">
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <QualificationBadge score={lead.qualification_score} />
                  </td>
                  <td className="px-4 py-3 text-text-tertiary">
                    {new Date(lead.created_at).toLocaleDateString("es-MX")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 25 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-surface-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-muted disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-text-tertiary">
            Página {page} de {Math.ceil(total / 25)}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 25)}
            className="rounded-lg border border-surface-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-muted disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
