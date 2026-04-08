"use client";

import { useState, useEffect, useCallback } from "react";
import { InboxList } from "@/components/dashboard/inbox-list";
import { ConversationThread } from "@/components/dashboard/conversation-thread";
import { ReplyBox } from "@/components/dashboard/reply-box";
import { WindowCountdown } from "@/components/dashboard/window-countdown";
import { QualificationBadge } from "@/components/dashboard/qualification-badge";
import { getWindowInfo } from "@/lib/whatsapp/window-checker";
import { maskPhone } from "@/lib/utils/phone";
import type { Lead } from "@/types/lead";
import type { Message } from "@/types/message";

interface LeadWithMessages extends Lead {
  recent_messages: Message[];
}

export default function InboxPage() {
  const [leads, setLeads] = useState<LeadWithMessages[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/inbox");
      const json = await res.json();
      setLeads(json.data || []);
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInbox();
    const interval = setInterval(fetchInbox, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchInbox]);

  const selectedLead = leads.find((l) => l.id === selectedId);

  useEffect(() => {
    if (selectedLead) {
      setMessages(selectedLead.recent_messages || []);
    }
  }, [selectedLead]);

  async function handleSendMessage(content: string) {
    if (!selectedId) return;

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: selectedId, content }),
    });

    if (res.ok) {
      await fetchInbox();
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-300 border-t-primary-700" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversations list */}
      <div className="w-80 shrink-0 border-r border-surface-border bg-white">
        <div className="flex h-14 items-center border-b border-surface-border px-4">
          <h1 className="text-sm font-semibold text-text-primary">
            Inbox ({leads.length})
          </h1>
        </div>
        <InboxList
          leads={leads}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Conversation detail */}
      {selectedLead ? (
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-border bg-white px-6 py-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                {selectedLead.name || "Sin nombre"}
              </h2>
              <p className="text-xs text-text-tertiary">
                {maskPhone(selectedLead.phone_normalized)}
                {selectedLead.city && ` · ${selectedLead.city}`}
                {selectedLead.case_type && ` · ${selectedLead.case_type}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <QualificationBadge score={selectedLead.qualification_score} />
              <WindowCountdown expiresAt={selectedLead.wa_window_expires_at} />
            </div>
          </div>

          {/* Messages */}
          <ConversationThread messages={messages} />

          {/* Reply */}
          <ReplyBox
            leadId={selectedLead.id}
            windowInfo={getWindowInfo(selectedLead.wa_window_expires_at)}
            onSend={handleSendMessage}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-text-tertiary">
          Selecciona una conversación
        </div>
      )}
    </div>
  );
}
