"use client";

import { LeadCard } from "./lead-card";
import type { Lead } from "@/types/lead";

interface InboxListProps {
  leads: Lead[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function InboxList({ leads, selectedId, onSelect }: InboxListProps) {
  if (leads.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-text-tertiary">
        No hay conversaciones activas
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          isSelected={selectedId === lead.id}
          onClick={() => onSelect(lead.id)}
        />
      ))}
    </div>
  );
}
