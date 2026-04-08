import { NextRequest, NextResponse } from "next/server";
import { validateWebhookSignature } from "@/lib/whatsapp/webhook-validator";
import { sendTextMessage } from "@/lib/whatsapp/client";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/utils/phone";
import { isOptOutMessage, processOptOut, getOptOutConfirmation } from "@/lib/consent/opt-out";
import { qualifyLead } from "@/lib/ai/qualify";
import { offices } from "@/lib/config/offices";
import type { WAIncomingMessage, WAMessage, WAStatus } from "@/types/whatsapp";
import type { Message } from "@/types/message";

const firmName = process.env.NEXT_PUBLIC_FIRM_NAME || "Abogados de Inmigración";

// GET: Webhook verification (WhatsApp Cloud API challenge)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: Incoming messages and status updates
export async function POST(request: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const signature = request.headers.get("x-hub-signature-256");

  // Validate signature
  if (!validateWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let body: WAIncomingMessage;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.entry || !Array.isArray(body.entry)) {
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }

  // Process each entry
  for (const entry of body.entry) {
    if (!entry.changes || !Array.isArray(entry.changes)) continue;

    for (const change of entry.changes) {
      if (!change.value) continue;
      const { messages, statuses } = change.value;

      if (messages && Array.isArray(messages)) {
        for (const message of messages) {
          try {
            await handleIncomingMessage(message, change.value.contacts?.[0]?.profile?.name);
          } catch (err) {
            console.error("Error handling message:", err);
          }
        }
      }

      if (statuses && Array.isArray(statuses)) {
        for (const status of statuses) {
          try {
            await handleStatusUpdate(status);
          } catch (err) {
            console.error("Error handling status:", err);
          }
        }
      }
    }
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}

async function handleIncomingMessage(message: WAMessage, contactName?: string) {
  const supabase = createSupabaseAdmin();
  const phone = normalizePhone(message.from);
  const text = message.text?.body ?? message.interactive?.button_reply?.title ?? message.button?.text ?? "";

  // Find or create lead
  let lead = await findLeadByPhone(phone);

  if (!lead) {
    // Create new lead (consent should already exist from button click)
    const { data: consent } = await supabase
      .from("consent_records")
      .select("id")
      .eq("phone", phone)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Also check by destination phone match if phone field was empty (pre-click consent)
    let consentId = consent?.id;
    if (!consentId) {
      const { data: preClickConsent } = await supabase
        .from("consent_records")
        .select("id")
        .eq("phone", "")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (preClickConsent) {
        // Update the pre-click consent with the actual phone
        await supabase
          .from("consent_records")
          .update({ phone })
          .eq("id", preClickConsent.id);
        consentId = preClickConsent.id;
      }
    }

    if (!consentId) {
      // No consent found — log but still create lead for tracking
      console.warn(`No consent record found for phone ${phone}`);
      // Create a minimal consent record to satisfy FK constraint
      const { data: newConsent } = await supabase
        .from("consent_records")
        .insert({
          consent_event_id: crypto.randomUUID(),
          phone,
          consent_type: "whatsapp_initial",
          consent_method: "reply_message",
          source_url: "unknown",
          legal_text_shown: "Consent obtained via direct WhatsApp message",
          legal_text_version: "direct-message-v1.0",
          privacy_policy_url: "/privacidad",
          privacy_policy_version: "privacy-es-v1.0",
          destination_phone: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
          language: "es",
          is_complete: false,
        })
        .select("id")
        .single();

      consentId = newConsent?.id;
    }

    const { data: newLead } = await supabase
      .from("leads")
      .insert({
        phone,
        phone_normalized: phone,
        name: contactName || null,
        status: "new",
        source_url: "whatsapp_direct",
        consent_id: consentId,
        wa_window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        last_user_message_at: new Date().toISOString(),
      })
      .select("id, status, is_opted_out, assigned_to, name")
      .single();

    lead = newLead;

    // Log window opened
    if (lead) {
      await supabase.from("conversation_events").insert({
        lead_id: lead.id,
        event_type: "window_opened",
        triggered_by: "user",
      });
    }
  } else {
    // Update existing lead window
    await supabase
      .from("leads")
      .update({
        wa_window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        last_user_message_at: new Date().toISOString(),
        ...(contactName && !lead.name ? { name: contactName } : {}),
      })
      .eq("id", lead.id);
  }

  if (!lead) return;

  // Store inbound message
  await supabase.from("messages").insert({
    lead_id: lead.id,
    wa_message_id: message.id,
    direction: "inbound",
    sender_type: "user",
    content: text,
    content_type: "text",
    is_within_window: true,
  });

  // Check opt-out
  if (isOptOutMessage(text)) {
    await processOptOut(lead.id, phone);
    const confirmation = getOptOutConfirmation("es");
    await sendTextMessage(phone, confirmation);
    return;
  }

  // If assigned to human, skip AI — route to inbox
  if (lead.status === "assigned" && lead.assigned_to) {
    return;
  }

  // Trigger AI qualification
  try {
    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: true })
      .limit(20);

    const conversationHistory = (history || []) as Message[];
    const officeNames = offices.map((o) => `${o.city}, ${o.stateCode}`);

    const qualification = await qualifyLead(conversationHistory, firmName, officeNames);

    // Send AI response
    const { message_id } = await sendTextMessage(phone, qualification.response_text);

    // Store bot message
    await supabase.from("messages").insert({
      lead_id: lead.id,
      wa_message_id: message_id,
      direction: "outbound",
      sender_type: "bot",
      content: qualification.response_text,
      content_type: "text",
      is_within_window: true,
      ai_intent_detected: qualification.intent,
      ai_sentiment: qualification.detected_urgency,
      ai_handoff_recommended: qualification.should_handoff,
    });

    // Update lead with qualification
    await supabase
      .from("leads")
      .update({
        qualification_score: qualification.qualification_score,
        qualification_summary: `${qualification.intent} - ${qualification.detected_case_type || "pending"}`,
        case_type: qualification.detected_case_type,
        office_location: qualification.suggested_office,
        last_bot_message_at: new Date().toISOString(),
        ...(qualification.should_handoff || qualification.qualification_score > 60
          ? { status: "ai_qualified" }
          : {}),
      })
      .eq("id", lead.id);

    // Auto-assign via round robin if qualified for handoff
    if (qualification.should_handoff || qualification.qualification_score > 60) {
      await supabase.from("conversation_events").insert({
        lead_id: lead.id,
        event_type: "handoff_to_human",
        event_data: { reason: qualification.handoff_reason },
        triggered_by: "bot",
      });

      // Round robin assignment
      const { data: assigneeId } = await supabase.rpc("round_robin_assign", {
        p_lead_id: lead.id,
      });

      if (assigneeId) {
        console.log(`Lead ${lead.id} auto-assigned to ${assigneeId}`);
      }
    }

    if (qualification.next_action === "continue_bot" && lead.status === "new") {
      await supabase.from("conversation_events").insert({
        lead_id: lead.id,
        event_type: "qualification_complete",
        event_data: { score: qualification.qualification_score },
        triggered_by: "bot",
      });
    }
  } catch (err) {
    console.error("AI qualification error:", err);
    // Fallback: notify team for manual handling
  }
}

async function findLeadByPhone(phone: string) {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("leads")
    .select("id, status, is_opted_out, assigned_to, name")
    .eq("phone_normalized", phone)
    .eq("is_opted_out", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

async function handleStatusUpdate(status: WAStatus) {
  const supabase = createSupabaseAdmin();
  const updateField: Record<string, string> = {};

  switch (status.status) {
    case "delivered":
      updateField.delivered_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
      break;
    case "read":
      updateField.read_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
      break;
    case "failed":
      updateField.failed_at = new Date(parseInt(status.timestamp) * 1000).toISOString();
      if (status.errors?.[0]) {
        updateField.failure_reason = status.errors[0].message;
      }
      break;
  }

  if (Object.keys(updateField).length > 0) {
    await supabase
      .from("messages")
      .update(updateField)
      .eq("wa_message_id", status.id);
  }
}
