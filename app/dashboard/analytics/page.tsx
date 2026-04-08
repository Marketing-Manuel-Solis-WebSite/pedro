"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  kpis: {
    total_leads: number;
    qualified_rate: number;
    opt_out_rate: number;
    avg_response_time_min: number;
    avg_handoff_time_min: number;
  };
  leads_by_source: Array<{ source: string; count: number }>;
  leads_by_office: Array<{ office: string; count: number }>;
  period_days: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      const res = await fetch(`/api/dashboard/analytics?days=${days}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    fetchAnalytics();
  }, [days]);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-300 border-t-primary-700" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-primary-900">Analytics</h1>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm"
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard title="Total Leads" value={String(data.kpis.total_leads)} />
        <KPICard title="Tasa Calificación" value={`${data.kpis.qualified_rate}%`} />
        <KPICard title="Resp. Promedio" value={`${data.kpis.avg_response_time_min}m`} />
        <KPICard title="Handoff Promedio" value={`${data.kpis.avg_handoff_time_min}m`} />
        <KPICard title="Tasa Opt-out" value={`${data.kpis.opt_out_rate}%`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Leads by Source */}
        <div className="rounded-xl border border-surface-border bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg text-primary-900">Leads por Fuente</h3>
          <div className="mt-4 space-y-3">
            {data.leads_by_source.length === 0 ? (
              <p className="text-sm text-text-tertiary">Sin datos</p>
            ) : (
              data.leads_by_source.map((item) => (
                <div key={item.source} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.source}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{
                          width: `${Math.min(100, (item.count / data.kpis.total_leads) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{item.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leads by Office */}
        <div className="rounded-xl border border-surface-border bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg text-primary-900">Leads por Oficina</h3>
          <div className="mt-4 space-y-3">
            {data.leads_by_office.length === 0 ? (
              <p className="text-sm text-text-tertiary">Sin datos</p>
            ) : (
              data.leads_by_office.map((item) => (
                <div key={item.office} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.office}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-accent-500"
                        style={{
                          width: `${Math.min(100, (item.count / data.kpis.total_leads) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{item.count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-text-tertiary">{title}</p>
      <p className="mt-1 font-display text-2xl text-primary-900">{value}</p>
    </div>
  );
}
