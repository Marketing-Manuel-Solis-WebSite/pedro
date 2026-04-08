import { NextResponse } from "next/server";
import { validateCronSecret } from "@/lib/cron/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();
  let archived = 0;
  let windowsClosed = 0;

  // 1. Archive leads with exhausted follow-ups and expired windows
  const { data: exhaustedLeads, error: exhaustedErr } = await supabase
    .from("leads")
    .select("id")
    .not("wa_window_expires_at", "is", null)
    .lte("wa_window_expires_at", now)
    .in("status", ["new", "qualified"])
    .gte("followup_count", 3);

  if (exhaustedErr) {
    console.error("Exhausted leads query error:", exhaustedErr);
    return NextResponse.json({ error: exhaustedErr.message }, { status: 500 });
  }

  for (const lead of exhaustedLeads || []) {
    await supabase
      .from("leads")
      .update({
        status: "archived",
        is_archived: true,
        archived_at: now,
      })
      .eq("id", lead.id);

    await supabase.from("conversation_events").insert({
      lead_id: lead.id,
      event_type: "window_closed",
      event_data: { action: "archived", reason: "followups_exhausted" },
      triggered_by: "cron",
    });

    await supabase.from("conversation_events").insert({
      lead_id: lead.id,
      event_type: "lead_archived",
      event_data: { reason: "window_expired_no_response" },
      triggered_by: "cron",
    });

    archived++;
  }

  // 2. Log window_closed for assigned leads (don't archive — human is handling)
  const { data: assignedExpired, error: assignedErr } = await supabase
    .from("leads")
    .select("id")
    .eq("status", "assigned")
    .not("wa_window_expires_at", "is", null)
    .lte("wa_window_expires_at", now);

  if (assignedErr) {
    console.error("Assigned expired query error:", assignedErr);
  }

  for (const lead of assignedExpired || []) {
    // Check if we already logged window_closed recently (idempotency)
    const { data: existingEvent } = await supabase
      .from("conversation_events")
      .select("id")
      .eq("lead_id", lead.id)
      .eq("event_type", "window_closed")
      .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .maybeSingle();

    if (!existingEvent) {
      await supabase.from("conversation_events").insert({
        lead_id: lead.id,
        event_type: "window_closed",
        event_data: { action: "logged_only", status: "assigned" },
        triggered_by: "cron",
      });
      windowsClosed++;
    }
  }

  return NextResponse.json({ archived, windows_closed: windowsClosed });
}
