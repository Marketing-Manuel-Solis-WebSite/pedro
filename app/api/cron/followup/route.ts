import { NextResponse } from "next/server";
import { validateCronSecret } from "@/lib/cron/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { sendTextMessage, sendTemplateMessage } from "@/lib/whatsapp/client";

const FOLLOWUP_1_ES =
  "Seguimos aquí para ayudarte. Responde:\n1️⃣ Continuar por WhatsApp\n2️⃣ Prefiero llamada\n3️⃣ Hablar con una persona";
const FOLLOWUP_2_ES =
  "No quiero dejar tu consulta en el aire. Si todavía quieres atención, responde a este mensaje y lo retomamos de inmediato.";
const FOLLOWUP_1_EN =
  "We're still here to help. Reply:\n1️⃣ Continue on WhatsApp\n2️⃣ I prefer a call\n3️⃣ Talk to a person";
const FOLLOWUP_2_EN =
  "I don't want to leave your inquiry unattended. If you still need help, reply to this message and we'll pick up right away.";

const FOLLOWUP_1_DELAY_MS = 15 * 60 * 1000; // 15 minutes
const FOLLOWUP_2_DELAY_MS = 2 * 60 * 60 * 1000; // 2 hours

const firmName = process.env.NEXT_PUBLIC_FIRM_NAME || "Abogados de Inmigración";

function isQuietHours(timezone: string): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(now), 10);
  return hour < 8 || hour >= 21;
}

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  const now = Date.now();
  let followupsSent = 0;
  let templatesSent = 0;
  let skippedQuietHours = 0;
  let processed = 0;

  // --- In-window follow-ups ---
  const { data: eligibleLeads, error: eligibleErr } = await supabase.rpc(
    "get_followup_eligible_leads"
  );

  if (eligibleErr) {
    console.error("get_followup_eligible_leads error:", eligibleErr);
    return NextResponse.json({ error: eligibleErr.message }, { status: 500 });
  }

  for (const lead of eligibleLeads || []) {
    processed++;
    const tz = lead.timezone || "America/Chicago";

    if (isQuietHours(tz)) {
      skippedQuietHours++;
      await supabase.from("conversation_events").insert({
        lead_id: lead.lead_id,
        event_type: "quiet_hours_blocked",
        event_data: { timezone: tz, followup_count: lead.followup_count },
        triggered_by: "cron",
      });
      continue;
    }

    // Check opt-out list one more time
    const { data: optedOut } = await supabase
      .from("opt_out_list")
      .select("id")
      .eq("phone_normalized", lead.phone_normalized)
      .maybeSingle();

    if (optedOut) continue;

    const timeSinceBot = now - new Date(lead.last_bot_message_at).getTime();
    const lang = lead.language || "es";
    let messageText: string | null = null;

    if (lead.followup_count === 0 && timeSinceBot >= FOLLOWUP_1_DELAY_MS) {
      messageText = lang === "en" ? FOLLOWUP_1_EN : FOLLOWUP_1_ES;
    } else if (lead.followup_count === 1 && timeSinceBot >= FOLLOWUP_2_DELAY_MS) {
      messageText = lang === "en" ? FOLLOWUP_2_EN : FOLLOWUP_2_ES;
    }

    if (!messageText) continue;

    try {
      const { message_id } = await sendTextMessage(
        lead.phone_normalized,
        messageText
      );

      // Store message
      await supabase.from("messages").insert({
        lead_id: lead.lead_id,
        wa_message_id: message_id,
        direction: "outbound",
        sender_type: "bot",
        content: messageText,
        content_type: "text",
        is_within_window: true,
      });

      // Update lead
      await supabase
        .from("leads")
        .update({
          followup_count: lead.followup_count + 1,
          last_bot_message_at: new Date().toISOString(),
        })
        .eq("id", lead.lead_id);

      // Log event
      await supabase.from("conversation_events").insert({
        lead_id: lead.lead_id,
        event_type: "followup_sent",
        event_data: { followup_number: lead.followup_count + 1, language: lang },
        triggered_by: "cron",
      });

      followupsSent++;
    } catch (err) {
      console.error(`Followup send failed for lead ${lead.lead_id}:`, err);
    }
  }

  // --- Window-expired template follow-ups ---
  const { data: expiredLeads, error: expiredErr } = await supabase.rpc(
    "get_window_expired_leads"
  );

  if (expiredErr) {
    console.error("get_window_expired_leads error:", expiredErr);
  }

  for (const lead of expiredLeads || []) {
    processed++;
    const tz = lead.timezone || "America/Chicago";

    if (isQuietHours(tz)) {
      skippedQuietHours++;
      continue;
    }

    // Check opt-out list
    const { data: optedOut } = await supabase
      .from("opt_out_list")
      .select("id")
      .eq("phone_normalized", lead.phone_normalized)
      .maybeSingle();

    if (optedOut) continue;

    const lang = lead.language || "es";
    const templateName =
      lang === "en" ? "followup_inactive_24h_en" : "followup_inactive_24h";

    // Verify template is approved
    const { data: template } = await supabase
      .from("wa_templates")
      .select("wa_status")
      .eq("template_name", templateName)
      .maybeSingle();

    if (!template || template.wa_status !== "approved") {
      console.warn(`Template ${templateName} not approved, skipping`);
      continue;
    }

    try {
      const { message_id } = await sendTemplateMessage(
        lead.phone_normalized,
        templateName,
        lang === "en" ? "en" : "es",
        [{ type: "body", parameters: [{ type: "text", text: firmName }] }]
      );

      await supabase.from("messages").insert({
        lead_id: lead.lead_id,
        wa_message_id: message_id,
        direction: "outbound",
        sender_type: "template",
        content: templateName,
        content_type: "template",
        template_name: templateName,
        is_within_window: false,
      });

      await supabase
        .from("leads")
        .update({ followup_count: 3 })
        .eq("id", lead.lead_id);

      await supabase.from("conversation_events").insert({
        lead_id: lead.lead_id,
        event_type: "template_sent",
        event_data: { template: templateName, language: lang },
        triggered_by: "cron",
      });

      templatesSent++;
    } catch (err) {
      console.error(`Template send failed for lead ${lead.lead_id}:`, err);
      await supabase.from("conversation_events").insert({
        lead_id: lead.lead_id,
        event_type: "template_failed",
        event_data: {
          template: templateName,
          error: err instanceof Error ? err.message : "Unknown",
        },
        triggered_by: "cron",
      });
    }
  }

  return NextResponse.json({
    processed,
    followups_sent: followupsSent,
    templates_sent: templatesSent,
    skipped_quiet_hours: skippedQuietHours,
  });
}
