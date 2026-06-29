import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const worker_id = searchParams.get("worker_id");

  let query = supabase
    .from("tasks")
    .select("*, report:reports(*)")
    .order("assigned_at", { ascending: false });

  if (worker_id) query = query.eq("worker_id", worker_id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function PATCH(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing task ID" }, { status: 400 });

  const body = await request.json();
  const updateData = {};
  if (body.status) updateData.status = body.status;
  if (body.started_at) updateData.started_at = body.started_at;
  if (body.completed_at) updateData.completed_at = body.completed_at;
  if (body.after_image) updateData.after_image = body.after_image;
  if (body.notes) updateData.notes = body.notes;

  const { data: task, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If completed, update report + worker stats
  if (body.status === "completed") {
    await supabase.from("reports").update({ status: "resolved" }).eq("id", task.report_id);

    // Get current worker stats, then update
    const { data: worker } = await supabase.from("workers").select("active_task_count, total_completed").eq("id", task.worker_id).single();
    if (worker) {
      await supabase.from("workers").update({
        active_task_count: Math.max(0, (worker.active_task_count || 0) - 1),
        total_completed: (worker.total_completed || 0) + 1,
      }).eq("id", task.worker_id);
    }

    // Trigger completion email (fire and forget)
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SUPABASE_URL ? "http://localhost:3000" : "http://localhost:3000";
      fetch(`${baseUrl}/api/send-completion-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
    } catch {
      // Don't block on email failures
    }
  }

  // If escalated
  if (body.status === "escalated") {
    await supabase.from("reports").update({ status: "escalated" }).eq("id", task.report_id);
    const { data: worker } = await supabase.from("workers").select("active_task_count").eq("id", task.worker_id).single();
    if (worker) {
      await supabase.from("workers").update({
        active_task_count: Math.max(0, (worker.active_task_count || 0) - 1),
      }).eq("id", task.worker_id);
    }
  }

  return NextResponse.json(task);
}
