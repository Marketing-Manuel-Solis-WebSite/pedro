import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("wa_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("Templates fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await request.json();

    const { data, error } = await supabase
      .from("wa_templates")
      .insert({
        template_name: body.template_name,
        display_name: body.display_name || body.template_name,
        language: body.language || "es",
        category: body.category,
        body_text: body.body_text,
        header_text: body.header_text || null,
        header_type: body.header_type || null,
        footer_text: body.footer_text || null,
        buttons: body.buttons || [],
        variables: body.variables || [],
        sample_values: body.sample_values || [],
        use_case: body.use_case,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("Template create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
