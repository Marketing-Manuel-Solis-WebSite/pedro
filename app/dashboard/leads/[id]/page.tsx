"use client";

import { useState, useEffect, use } from "react";
import { ConversationThread } from "@/components/dashboard/conversation-thread";
import { ReplyBox } from "@/components/dashboard/reply-box";
import { WindowCountdown } from "@/components/dashboard/window-countdown";
import { QualificationBadge } from "@/components/dashboard/qualification-badge";
import { getWindowInfo } from "@/lib/whatsapp/window-checker";
import { maskPhone } from "@/lib/utils/phone";
import type { Lead } from "@/types/lead";
import type { Message } from "@/types/message";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLead() {
      const res = await fetch(`/api/leads?search=${id}`);
      const json = await res.json();
      if (json.data?.[0]) {
        setLead(json.data[0]);
      }
      setLoading(false);
    }
    fetchLead();
  }, [id]);

  useEffect(() => {
    if (!lead) return;
    async function fetchMessages() {
      const res = await fetch(`/api/dashboard/inbox?search=${lead!.phone_normalized}`);
      const json = await res.json();
      const match = json.data?.find((l: Lead) => l.id === lead!.id);
      if (match?.recent_messages) {
        setMessages(match.recent_messages);
      }
    }
    fetchMessages();
  }, [lead]);

  async function handleSend(content: string) {
    if (!lead) return;
    await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: lead.id, content }),
    });
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-300 border-t-primary-700" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
        Lead no encontrado
      </div>
    );
  }

  const windowInfo = getWindowInfo(lead.wa_window_expires_at);

  return (
    <div className="flex h-full">
      {/* Info panel */}
      <div className="w-80 shrink-0 overflow-y-auto border-r border-surface-border bg-white p-6">
        <h2 className="font-display text-xl text-primary-900">
          {lead.name || "Sin nombre"}
        </h2>
        <p className="mt-1 text-sm text-text-tertiary">
          {maskPhone(lead.phone_normalized)}
        </p>

        <div className="mt-6 space-y-4">
          <InfoRow label="Ciudad" value={lead.city || "—"} />
          <InfoRow label="Status" value={lead.status} />
          <InfoRow label="Prioridad" value={lead.priority} />
          <InfoRow label="Tipo de caso" value={lead.case_type || "—"} />
          <InfoRow label="Oficina" value={lead.office_location || "—"} />
          <InfoRow label="Fuente" value={lead.source_campaign || lead.source_url} />

          <div>
            <span className="text-xs font-medium text-text-tertiary">Calificación AI</span>
            <div className="mt-1">
              <QualificationBadge score={lead.qualification_score} />
            </div>
            {lead.qualification_summary && (
              <p className="mt-1 text-xs text-text-secondary">{lead.qualification_summary}</p>
            )}
          </div>

          <div>
            <span className="text-xs font-medium text-text-tertiary">Ventana WhatsApp</span>
            <div className="mt-1">
              <WindowCountdown expiresAt={lead.wa_window_expires_at} />
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-text-tertiary">Creado</span>
            <p className="mt-0.5 text-sm text-text-secondary">
              {new Date(lead.created_at).toLocaleString("es-MX")}
            </p>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex flex-1 flex-col">
        <ConversationThread messages={messages} />
        <ReplyBox
          leadId={lead.id}
          windowInfo={windowInfo}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-text-tertiary">{label}</span>
      <p className="mt-0.5 text-sm text-text-secondary">{value}</p>
    </div>
  );
}
