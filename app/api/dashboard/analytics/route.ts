import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const days = parseInt(searchParams.get("days") || "30", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Total leads in period
    const { count: totalLeads } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);

    // Qualified leads
    const { count: qualifiedLeads } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
      .in("status", ["qualified", "assigned", "closed"]);

    // Opted out
    const { count: optedOut } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
      .eq("is_opted_out", true);

    const total = totalLeads ?? 0;
    const qualified = qualifiedLeads ?? 0;
    const optOuts = optedOut ?? 0;

    // Leads by source
    const { data: bySource } = await supabase
      .from("leads")
      .select("source_campaign")
      .gte("created_at", since);

    const sourceCounts: Record<string, number> = {};
    for (const lead of bySource || []) {
      const source = lead.source_campaign || "Direct";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    }

    // Leads by office
    const { data: byOffice } = await supabase
      .from("leads")
      .select("office_location")
      .gte("created_at", since);

    const officeCounts: Record<string, number> = {};
    for (const lead of byOffice || []) {
      const office = lead.office_location || "Unassigned";
      officeCounts[office] = (officeCounts[office] || 0) + 1;
    }

    return NextResponse.json({
      kpis: {
        total_leads: total,
        qualified_rate: total > 0 ? Math.round((qualified / total) * 100) : 0,
        opt_out_rate: total > 0 ? Math.round((optOuts / total) * 100) : 0,
        avg_response_time_min: 0, // TODO: calculate from messages
        avg_handoff_time_min: 0,
      },
      leads_by_source: Object.entries(sourceCounts).map(([source, count]) => ({
        source,
        count,
      })),
      leads_by_office: Object.entries(officeCounts).map(([office, count]) => ({
        office,
        count,
      })),
      period_days: days,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
