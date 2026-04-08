import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { QUALIFICATION_SYSTEM_PROMPT } from "./prompts";
import type { Message } from "@/types/message";

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

const SAFE_FALLBACK: QualificationResult = {
  response_text:
    "Gracias por tu mensaje. Te comunicaré con un asesor que podrá ayudarte mejor. Responderá en menos de 5 minutos hábiles.",
  intent: "hablar_persona",
  should_handoff: true,
  handoff_reason: "ai_error",
  qualification_score: 50,
  detected_case_type: null,
  detected_urgency: "normal",
  suggested_office: null,
  next_action: "handoff_human",
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function qualifyLead(
  conversationHistory: Message[],
  firmName: string,
  officeLocations: string[]
): Promise<QualificationResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
    systemInstruction: `${QUALIFICATION_SYSTEM_PROMPT(officeLocations)}\n\nNombre de la firma: ${firmName}.`,
  });

  if (conversationHistory.length === 0) {
    return SAFE_FALLBACK;
  }

  // Build Gemini chat history (all messages except the last one)
  // Gemini uses 'user' and 'model' roles
  const historyMessages = conversationHistory.slice(0, -1);
  const geminiHistory = historyMessages.map((msg) => ({
    role: msg.direction === "inbound" ? ("user" as const) : ("model" as const),
    parts: [{ text: msg.content }],
  }));

  const lastMessage = conversationHistory[conversationHistory.length - 1];

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(lastMessage.content);
  const response = result.response;
  const text = response.text();

  if (!text) {
    console.error("Gemini returned empty response");
    return { ...SAFE_FALLBACK, handoff_reason: "empty_ai_response" };
  }

  // Parse JSON response
  let parsed: QualificationResult;
  try {
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response as JSON:", text);
    return { ...SAFE_FALLBACK, handoff_reason: "ai_parse_error" };
  }

  // Validate required fields
  if (
    !parsed.response_text ||
    !parsed.intent ||
    parsed.qualification_score === undefined
  ) {
    return {
      response_text:
        parsed.response_text ||
        "Gracias por tu mensaje. Te comunicaré con un asesor.",
      intent: parsed.intent || "hablar_persona",
      should_handoff: parsed.should_handoff ?? true,
      handoff_reason: parsed.handoff_reason || "incomplete_ai_response",
      qualification_score: parsed.qualification_score ?? 50,
      detected_case_type: parsed.detected_case_type || null,
      detected_urgency: parsed.detected_urgency || "normal",
      suggested_office: parsed.suggested_office || null,
      next_action: parsed.next_action || "handoff_human",
    };
  }

  return parsed;
}
