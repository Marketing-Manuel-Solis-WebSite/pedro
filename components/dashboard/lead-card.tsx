"use client";

import { maskPhone } from "@/lib/utils/phone";
import { WindowCountdown } from "./window-countdown";
import { QualificationBadge } from "./qualification-badge";
import type { Lead } from "@/types/lead";

interface LeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onClick: () => void;
}

const statusLabels: Record<string, { label: string; class: string }> = {
  new: { label: "Nuevo", class: "bg-blue-100 text-blue-800" },
  qualified: { label: "Calificado", class: "bg-purple-100 text-purple-800" },
  assigned: { label: "Asignado", class: "bg-green-100 text-green-800" },
  in_progress: { label: "En proceso", class: "bg-teal-100 text-teal-800" },
  closed_won: { label: "Cerrado (ganado)", class: "bg-green-100 text-green-800" },
  closed_lost: { label: "Cerrado (perdido)", class: "bg-gray-100 text-gray-800" },
  spam: { label: "Spam", class: "bg-red-100 text-red-800" },
  archived: { label: "Archivado", class: "bg-gray-50 text-gray-500" },
};

const priorityLabels: Record<string, { label: string; class: string }> = {
  urgent: { label: "Urgente", class: "bg-red-100 text-red-800" },
  high: { label: "Alta", class: "bg-orange-100 text-orange-800" },
  normal: { label: "Normal", class: "bg-gray-100 text-gray-600" },
  low: { label: "Baja", class: "bg-gray-50 text-gray-500" },
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function LeadCard({ lead, isSelected, onClick }: LeadCardProps) {
  const statusInfo = statusLabels[lead.status] || statusLabels.new;
  const priorityInfo = priorityLabels[lead.priority] || priorityLabels.normal;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border-b border-surface-border p-4 transition-colors hover:bg-surface-muted ${
        isSelected ? "bg-primary-50 border-l-2 border-l-primary-600" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-text-primary">
              {lead.name || "Sin nombre"}
            </span>
            <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusInfo.class}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-text-tertiary">
            {maskPhone(lead.phone_normalized)}
            {lead.city && ` · ${lead.city}`}
          </p>
        </div>
        <span className="shrink-0 text-xs text-text-tertiary">
          {timeAgo(lead.last_user_message_at)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {lead.priority !== "normal" && (
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${priorityInfo.class}`}>
            {priorityInfo.label}
          </span>
        )}
        <QualificationBadge score={lead.qualification_score} />
        <WindowCountdown expiresAt={lead.wa_window_expires_at} />
      </div>
    </button>
  );
}
