import { NextResponse } from "next/server";
import { validateCronSecret } from "@/lib/cron/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();

  // Calculate yesterday's date in UTC (YYYY-MM-DD)
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const targetDate = yesterday.toISOString().split("T")[0];

  const { error } = await supabase.rpc("rollup_daily_analytics", {
    target_date: targetDate,
  });

  if (error) {
    console.error("Analytics rollup error:", error);
    return NextResponse.json(
      { error: error.message, date: targetDate },
      { status: 500 }
    );
  }

  return NextResponse.json({ date: targetDate, status: "completed" });
}
