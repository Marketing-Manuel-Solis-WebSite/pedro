import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { sendMessageToLead, sendTemplateToLead } from "@/lib/whatsapp/message-sender";
import { isWithinWindow } from "@/lib/whatsapp/window-checker";

export async function POST(request: NextRequest) {
  try {
    const { lead_id, content, template_name, template_language, template_components } =
      (await request.json()) as {
        lead_id: string;
        content?: string;
        template_name?: string;
        template_language?: string;
        template_components?: Array<{ type: "body" | "header" | "button"; parameters: Array<{ type: "text"; text?: string }> }>;
      };

    if (!lead_id) {
      return NextResponse.json({ error: "lead_id required" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();

    // Fetch lead
    const { data: lead } = await supabase
      .from("leads")
      .select("id, is_opted_out, wa_window_expires_at")
      .eq("id", lead_id)
      .single();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (lead.is_opted_out) {
      return NextResponse.json({ error: "Lead has opted out" }, { status: 403 });
    }

    // Rate limiting: max 3 messages per minute per lead
    const oneMinAgo = new Date(Date.now() - 60000).toISOString();
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("lead_id", lead_id)
      .eq("direction", "outbound")
      .gt("created_at", oneMinAgo);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Rate limit: max 3 messages per minute" },
        { status: 429 }
      );
    }

    // Check window and decide send method
    const withinWindow = isWithinWindow(lead.wa_window_expires_at);

    if (!withinWindow) {
      // Must use template
      if (!template_name) {
        return NextResponse.json(
          { error: "Window expired — must use template" },
          { status: 400 }
        );
      }

      const result = await sendTemplateToLead(
        lead_id,
        template_name,
        template_language || "es",
        template_components
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({ message_id: result.message_id }, { status: 200 });
    }

    // Within window — send free-form text
    if (!content) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const result = await sendMessageToLead(lead_id, content, "human");

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Log event
    await supabase.from("conversation_events").insert({
      lead_id,
      event_type: "handoff_accepted",
      triggered_by: "human",
    });

    return NextResponse.json({ message_id: result.message_id }, { status: 200 });
  } catch (err) {
    console.error("Message send error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
