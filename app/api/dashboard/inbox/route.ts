import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const status = searchParams.get("status");
    const assigned_to = searchParams.get("assigned_to");
    const office = searchParams.get("office");
    const search = searchParams.get("search");

    let query = supabase
      .from("leads")
      .select("*")
      .eq("is_opted_out", false)
      .in("status", status ? [status] : ["new", "ai_qualified", "assigned", "contacted", "consultation", "proposal_sent", "negotiation"])
      .order("priority", { ascending: false })
      .order("last_user_message_at", { ascending: false })
      .limit(50);

    if (assigned_to) query = query.eq("assigned_to", assigned_to);
    if (office) query = query.eq("office_location", office);
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: leads, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch last 3 messages for each lead
    const leadsWithMessages = await Promise.all(
      (leads || []).map(async (lead) => {
        const { data: messages } = await supabase
          .from("messages")
          .select("*")
          .eq("lead_id", lead.id)
          .order("created_at", { ascending: false })
          .limit(3);

        return { ...lead, recent_messages: messages || [] };
      })
    );

    return NextResponse.json({ data: leadsWithMessages }, { status: 200 });
  } catch (err) {
    console.error("Dashboard inbox error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
