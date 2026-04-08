import { NextResponse } from "next/server";
import { validateCronSecret } from "@/lib/cron/auth";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdmin();
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Count incomplete consent records from the past week
  const { count: totalIncomplete, error: countErr } = await supabase
    .from("consent_records")
    .select("id", { count: "exact", head: true })
    .eq("is_complete", false)
    .gte("created_at", sevenDaysAgo);

  if (countErr) {
    console.error("Consent audit count error:", countErr);
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  // Fetch incomplete records for pattern analysis
  const { data: incompleteRecords, error: fetchErr } = await supabase
    .from("consent_records")
    .select(
      "phone, source_url, legal_text_shown, legal_text_version, privacy_policy_url, destination_phone, language"
    )
    .eq("is_complete", false)
    .gte("created_at", sevenDaysAgo)
    .limit(100);

  if (fetchErr) {
    console.error("Consent audit fetch error:", fetchErr);
  }

  // Analyze missing field patterns
  const patterns: Record<string, number> = {};
  for (const record of incompleteRecords || []) {
    const missing: string[] = [];
    if (!record.phone) missing.push("phone");
    if (!record.source_url || record.source_url === "unknown")
      missing.push("source_url");
    if (!record.legal_text_shown) missing.push("legal_text_shown");
    if (!record.legal_text_version) missing.push("legal_text_version");
    if (!record.privacy_policy_url) missing.push("privacy_policy_url");
    if (!record.destination_phone) missing.push("destination_phone");

    const key = missing.length > 0 ? missing.sort().join(",") : "unknown";
    patterns[key] = (patterns[key] || 0) + 1;
  }

  // Also count total consent records and opt-outs for the period
  const { count: totalRecords } = await supabase
    .from("consent_records")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);

  const { count: revokedRecords } = await supabase
    .from("consent_records")
    .select("id", { count: "exact", head: true })
    .eq("is_active", false)
    .not("revoked_at", "is", null)
    .gte("revoked_at", sevenDaysAgo);

  return NextResponse.json({
    total_incomplete: totalIncomplete ?? 0,
    total_records: totalRecords ?? 0,
    revoked_this_period: revokedRecords ?? 0,
    patterns,
    period: `${sevenDaysAgo} to now`,
  });
}
