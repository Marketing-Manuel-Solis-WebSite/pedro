"use client";

import { useState } from "react";
import type { WindowInfo } from "@/types/dashboard";

interface ReplyBoxProps {
  leadId: string;
  windowInfo: WindowInfo;
  onSend: (content: string) => Promise<void>;
}

export function ReplyBox({ leadId, windowInfo, onSend }: ReplyBoxProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const windowClosed = windowInfo.status === "closed";

  async function handleSend() {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await onSend(message.trim());
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (windowClosed) {
    return (
      <div className="border-t border-surface-border bg-red-50 px-4 py-3">
        <p className="text-sm text-red-700">
          Ventana de 24h cerrada. Solo se pueden enviar plantillas aprobadas.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-surface-border bg-white px-4 py-3">
      <div className="flex items-end gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          rows={1}
          className="flex-1 resize-none rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-300"
          disabled={sending}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary-800 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </div>
      <input type="hidden" name="lead_id" value={leadId} />
    </div>
  );
}
