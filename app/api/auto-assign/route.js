import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reportId, reportLat, reportLng } = await request.json();
  if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 });

  try {
    const { data: report } = await supabase.from("reports").select("*").eq("id", reportId).single();
    if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

    const lat = reportLat || report.lat;
    const lng = reportLng || report.lng;

    const { data: workers } = await supabase
      .from("workers")
      .select("*, profile:profiles(*)")
      .eq("is_available", true);

    if (!workers || workers.length === 0) {
      return NextResponse.json({ success: false, message: "No available workers" });
    }

    const scored = workers.map((w) => {
      let distance = 999;
      if (w.current_lat && w.current_lng) {
        distance = haversineDistance(lat, lng, w.current_lat, w.current_lng);
      }
      const proximityScore = distance < 999 ? 1 / (1 + distance) : 0;
      const workloadScore = 1 / (1 + (w.active_task_count || 0));
      return { worker: w, score: 0.5 * proximityScore + 0.3 * workloadScore, distance };
    });

    scored.sort((a, b) => {
      if (Math.abs(a.score - b.score) < 0.01) {
        return (a.worker.total_completed || 0) - (b.worker.total_completed || 0);
      }
      return b.score - a.score;
    });

    const best = scored[0].worker;

    const { data: task } = await supabase.from("tasks").insert({
      report_id: reportId,
      worker_id: best.id,
      assigned_by: user.id,
      status: "assigned",
    }).select().single();

    await supabase.from("reports").update({ status: "assigned" }).eq("id", reportId);

    await supabase.from("workers").update({
      active_task_count: (best.active_task_count || 0) + 1,
    }).eq("id", best.id);

    await supabase.from("notifications").insert({
      user_id: best.id,
      title: "New Task Assigned",
      message: `You've been assigned: ${report.title}`,
      type: "task_assigned",
      metadata: { taskId: task.id, reportId },
    });

    return NextResponse.json({
      success: true,
      workerId: best.id,
      workerName: best.profile?.full_name || best.profile?.email,
      taskId: task.id,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
