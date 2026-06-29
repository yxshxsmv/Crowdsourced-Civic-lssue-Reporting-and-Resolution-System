import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const { data: worker, error } = await supabase
      .from("workers")
      .select("*, profile:profiles(*)")
      .eq("id", id)
      .single();

    if (error || !worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

    return NextResponse.json({
      ...worker,
      profile: worker.profile ? {
        full_name: worker.profile.full_name,
        email: worker.profile.email,
        phone: worker.profile.phone,
        avatar_url: worker.profile.avatar_url,
      } : null,
    });
  }

  const { data: workers, error } = await supabase
    .from("workers")
    .select("*, profile:profiles(*)");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const mapped = workers.map((w) => ({
    id: w.id,
    zone: w.zone,
    is_available: w.is_available,
    current_lat: w.current_lat,
    current_lng: w.current_lng,
    last_location_update: w.last_location_update,
    active_task_count: w.active_task_count,
    total_completed: w.total_completed,
    profile: w.profile ? {
      full_name: w.profile.full_name,
      email: w.profile.email,
      phone: w.profile.phone,
      avatar_url: w.profile.avatar_url,
    } : null,
  }));

  return NextResponse.json(mapped);
}

export async function PATCH(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing worker ID" }, { status: 400 });

  const body = await request.json();
  const updateData = {};
  if (body.is_available !== undefined) updateData.is_available = body.is_available;
  if (body.current_lat !== undefined) updateData.current_lat = body.current_lat;
  if (body.current_lng !== undefined) updateData.current_lng = body.current_lng;
  if (body.current_lat !== undefined || body.current_lng !== undefined) {
    updateData.last_location_update = new Date().toISOString();
  }
  if (body.zone) updateData.zone = body.zone;

  const { data, error } = await supabase
    .from("workers")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
