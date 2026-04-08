import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_PHONE = "+5215551234567";

async function verify() {
  console.log("\n" + "=".repeat(50));
  console.log("  OPT-OUT VERIFICATION");
  console.log("=".repeat(50) + "\n");

  let passed = 0;
  let failed = 0;

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("phone_normalized", TEST_PHONE)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!lead) {
    console.log("  No lead found for test phone. Run test:webhook:new first.");
    process.exit(1);
  }

  if (lead.is_opted_out === true) { console.log("  [ok] lead.is_opted_out = true"); passed++; }
  else { console.log("  [FAIL] lead.is_opted_out = " + lead.is_opted_out); failed++; }

  if (lead.opted_out_at) { console.log("  [ok] lead.opted_out_at = " + lead.opted_out_at); passed++; }
  else { console.log("  [FAIL] lead.opted_out_at is null"); failed++; }

  const { data: optOut } = await supabase
    .from("opt_out_list")
    .select("*")
    .eq("phone_normalized", TEST_PHONE)
    .maybeSingle();

  if (optOut) { console.log("  [ok] opt_out_list has entry"); passed++; }
  else { console.log("  [FAIL] opt_out_list missing entry"); failed++; }

  const { data: activeConsents } = await supabase
    .from("consent_records")
    .select("id")
    .eq("phone", TEST_PHONE)
    .eq("is_active", true);

  if (!activeConsents || activeConsents.length === 0) {
    console.log("  [ok] All consent_records deactivated"); passed++;
  } else {
    console.log("  [FAIL] " + activeConsents.length + " consent_records still active"); failed++;
  }

  const { data: confirmMsg } = await supabase
    .from("messages")
    .select("content")
    .eq("lead_id", lead.id)
    .eq("direction", "outbound")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (confirmMsg?.content?.includes("dejamos de enviarte") || confirmMsg?.content?.includes("stopped messaging")) {
    console.log("  [ok] Opt-out confirmation message found"); passed++;
  } else {
    console.log("  [info] Opt-out confirmation not matched (last outbound: " + (confirmMsg?.content?.substring(0, 60) || "none") + ")");
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed`);

  // Clean up
  console.log("\n  Cleaning up test data...");
  await supabase.from("leads").update({ is_opted_out: false, opted_out_at: null, opted_out_method: null, status: "new", followup_count: 0 }).eq("phone_normalized", TEST_PHONE);
  await supabase.from("opt_out_list").delete().eq("phone_normalized", TEST_PHONE);
  await supabase.from("consent_records").update({ is_active: true, revoked_at: null, revocation_method: null }).eq("phone", TEST_PHONE);
  console.log("  [ok] Cleaned up.\n");

  if (failed > 0) process.exit(1);
}

verify().catch(console.error);
