import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { qualifyLead } from "@/lib/ai/qualify";
import { offices } from "@/lib/config/offices";
import type { Message } from "@/types/message";

const firmName = process.env.NEXT_PUBLIC_FIRM_NAME || "Abogados de Inmigración";

const SAFE_HANDOFF = {
  response_text:
    "Gracias por tu mensaje. Te comunico con un asesor que podrá ayudarte. Responderá en menos de 5 minutos hábiles.",
  intent: "hablar_persona" as const,
  should_handoff: true,
  handoff_reason: "ai_error",
  qualification_score: 50,
  detected_case_type: null,
  detected_urgency: "normal" as const,
  suggested_office: null,
  next_action: "handoff_human" as const,
};

export async function POST(request: NextRequest) {
  try {
    const { lead_id } = (await request.json()) as { lead_id: string };

    if (!lead_id) {
      return NextResponse.json({ error: "lead_id required" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    const { data: messages, error: msgErr } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", lead_id)
      .order("created_at", { ascending: true })
      .limit(20);

    if (msgErr) {
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    const officeNames = offices.map((o) => `${o.city}, ${o.stateCode}`);
    const result = await qualifyLead(
      (messages || []) as Message[],
      firmName,
      officeNames
    );

    await supabase
      .from("leads")
      .update({
        qualification_score: result.qualification_score,
        qualification_summary: `${result.intent} - ${result.detected_case_type || "pending"}`,
        case_type: result.detected_case_type,
        office_location: result.suggested_office,
      })
      .eq("id", lead_id);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("AI qualification error:", error);

    // Check if safety filter block
    if (
      error instanceof Error &&
      error.message.includes("SAFETY")
    ) {
      return NextResponse.json(
        { ...SAFE_HANDOFF, handoff_reason: "safety_filter_block" },
        { status: 200 }
      );
    }

    // Return 200 even on AI error — the webhook should not retry
    return NextResponse.json(SAFE_HANDOFF, { status: 200 });
  }
}
