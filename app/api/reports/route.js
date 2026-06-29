import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const reporter_id = searchParams.get("reporter_id");

  let query = supabase.from("reports").select("*").order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (reporter_id) query = query.eq("reporter_id", reporter_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, category, image_url, lat, lng, reporter_id } = body;

  const { data, error } = await supabase
    .from("reports")
    .insert({
      title,
      description,
      category,
      image_url,
      lat,
      lng,
      reporter_id: reporter_id || user.id,
      status: "pending",
      priority: "medium",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing report ID" }, { status: 400 });

  const body = await request.json();
  const updateData = {};
  if (body.status) updateData.status = body.status;
  if (body.priority) updateData.priority = body.priority;
  if (body.category) updateData.category = body.category;
  if (body.ai_summary) updateData.ai_summary = body.ai_summary;
  if (body.ai_category) updateData.ai_category = body.ai_category;
  if (body.ai_priority) updateData.ai_priority = body.ai_priority;
  if (body.ai_confidence !== undefined) updateData.ai_confidence = body.ai_confidence;
  if (body.ai_suggested_action) updateData.ai_suggested_action = body.ai_suggested_action;
  if (body.duplicate_of) updateData.duplicate_of = body.duplicate_of;

  const { data, error } = await supabase
    .from("reports")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
