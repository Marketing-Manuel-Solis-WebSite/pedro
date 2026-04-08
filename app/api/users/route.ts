import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();

    const { data: users, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const active = (users || []).filter((u) => u.is_active !== false);
    const available = active.filter((u) => u.is_available);
    const totalCapacity = active.reduce((s, u) => s + (u.max_concurrent_chats || 5), 0);
    const currentLoad = active.reduce((s, u) => s + (u.current_chat_count || 0), 0);

    return NextResponse.json({
      users: users || [],
      stats: {
        total: (users || []).length,
        active: active.length,
        available: available.length,
        totalCapacity,
        currentLoad,
      },
    });
  } catch (err) {
    console.error("Users fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdmin();
    const body = await request.json();

    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { error: "name, email, and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "attorney", "paralegal", "intake"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("team_members")
      .insert({
        name: body.name,
        email: body.email,
        role: body.role,
        office_location: body.office_location || null,
        specialties: body.specialties || [],
        max_concurrent_chats: body.max_concurrent_chats || 5,
        can_receive_assignments: body.can_receive_assignments ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data }, { status: 201 });
  } catch (err) {
    console.error("User create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
