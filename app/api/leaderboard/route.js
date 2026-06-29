import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all profiles and all reports in parallel
  const [{ data: profiles }, { data: reports }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, avatar_url").eq("role", "helper"),
    supabase.from("reports").select("reporter_id, status"),
  ]);

  if (!profiles || !reports) {
    return NextResponse.json({ leaderboard: [] });
  }

  // Aggregate stats per reporter
  const statsMap = {};
  for (const r of reports) {
    if (!r.reporter_id) continue;
    if (!statsMap[r.reporter_id]) {
      statsMap[r.reporter_id] = { total: 0, resolved: 0 };
    }
    statsMap[r.reporter_id].total++;
    if (r.status === "resolved") statsMap[r.reporter_id].resolved++;
  }

  const leaderboard = profiles
    .map((p) => {
      const s = statsMap[p.id] || { total: 0, resolved: 0 };
      return {
        id: p.id,
        fullName: p.full_name || p.email?.split("@")[0] || "Anonymous",
        avatarUrl: p.avatar_url,
        total: s.total,
        resolved: s.resolved,
        score: s.total * 10 + s.resolved * 20, // weighted score
      };
    })
    .sort((a, b) => b.score - a.score || b.total - a.total)
    .slice(0, 50); // top 50

  const totals = {
    contributors: profiles.length,
    totalReports: reports.length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  return NextResponse.json({ leaderboard, totals });
}
