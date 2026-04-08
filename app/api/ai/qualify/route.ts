import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { qualifyLead } from "@/lib/ai/qualify";
import { offices } from "@/lib/config/offices";
import type { Message } from "@/types/message";

const firmName = process.env.NEXT_PUBLIC_FIRM_NAME || "Abogados de Inmigración";

export async function POST(request: NextRequest) {
  try {
    const { lead_id } = (await request.json()) as { lead_id: string };

    if (!lead_id) {
      return NextResponse.json({ error: "lead_id required" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    // Get conversation history
    const { data: messages, error: msgErr } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", lead_id)
      .order("created_at", { ascending: true })
      .limit(20);

    if (msgErr) {
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    const officeNames = offices.map((o) => `${o.city}, ${o.stateCode}`);
    const result = await qualifyLead(
      (messages || []) as Message[],
      firmName,
      officeNames
    );

    // Update lead
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
  } catch (err) {
    console.error("AI qualify error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
