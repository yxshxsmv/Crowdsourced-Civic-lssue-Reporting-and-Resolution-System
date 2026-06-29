import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");
  if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const user_id = searchParams.get("user_id");
  const mark_all = searchParams.get("mark_all");

  const { is_read } = await request.json();

  if (mark_all === "true" && user_id) {
    await supabase.from("notifications").update({ is_read }).eq("user_id", user_id);
    return NextResponse.json({ success: true });
  }

  if (id) {
    await supabase.from("notifications").update({ is_read }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Missing id or user_id" }, { status: 400 });
}
