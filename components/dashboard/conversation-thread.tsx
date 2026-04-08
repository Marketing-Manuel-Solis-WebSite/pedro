"use client";

import type { Message } from "@/types/message";

interface ConversationThreadProps {
  messages: Message[];
}

const senderConfig: Record<string, { label: string; align: "left" | "right"; bg: string; border: string }> = {
  user: { label: "Usuario", align: "left", bg: "bg-white", border: "border-surface-border" },
  bot: { label: "Bot", align: "right", bg: "bg-primary-50", border: "border-primary-100" },
  human: { label: "Agente", align: "right", bg: "bg-green-50", border: "border-green-100" },
  template: { label: "Plantilla", align: "right", bg: "bg-yellow-50", border: "border-yellow-100" },
  system: { label: "Sistema", align: "right", bg: "bg-gray-50", border: "border-gray-100" },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function ConversationThread({ messages }: ConversationThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-text-tertiary">
        Sin mensajes aún
      </div>
    );
  }

  let lastDate = "";

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((msg) => {
        const config = senderConfig[msg.sender_type] || senderConfig.user;
        const msgDate = formatDate(msg.created_at);
        const showDate = msgDate !== lastDate;
        lastDate = msgDate;

        return (
          <div key={msg.id}>
            {showDate && (
              <div className="my-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-surface-border" />
                <span className="text-xs text-text-tertiary">{msgDate}</span>
                <div className="h-px flex-1 bg-surface-border" />
              </div>
            )}
            <div
              className={`flex ${config.align === "right" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-xl border px-4 py-2.5 ${config.bg} ${config.border}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase text-text-tertiary">
                    {config.label}
                  </span>
                  <span className="text-[10px] text-text-tertiary">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
                  {msg.content}
                </p>
                {msg.ai_handoff_recommended && (
                  <span className="mt-1 inline-block text-[10px] font-medium text-status-warning">
                    Handoff recomendado
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
