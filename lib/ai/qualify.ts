import Anthropic from "@anthropic-ai/sdk";
import { QUALIFICATION_SYSTEM_PROMPT } from "./prompts";
import type { Message } from "@/types/message";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface QualificationResult {
  response_text: string;
  intent: "nueva_consulta" | "seguimiento" | "agendar" | "hablar_persona";
  should_handoff: boolean;
  handoff_reason: string | null;
  qualification_score: number;
  detected_case_type: string | null;
  detected_urgency: "low" | "normal" | "high" | "critical";
  suggested_office: string | null;
  next_action: "continue_bot" | "handoff_human" | "send_template" | "close";
}

export async function qualifyLead(
  conversationHistory: Message[],
  firmName: string,
  officeLocations: string[]
): Promise<QualificationResult> {
  const messages: Anthropic.MessageParam[] = conversationHistory.map((msg) => ({
    role: msg.direction === "inbound" ? ("user" as const) : ("assistant" as const),
    content: msg.content,
  }));

  const officeContext = `Oficinas disponibles: ${officeLocations.join(", ")}. Nombre de la firma: ${firmName}.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `${QUALIFICATION_SYSTEM_PROMPT}\n\nContexto: ${officeContext}`,
    messages,
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON");
  }

  const result: QualificationResult = JSON.parse(jsonMatch[0]);
  return result;
}
