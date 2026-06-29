import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    { data: inspections },
    { data: assetHistory },
    { data: recurringTasks },
  ] = await Promise.all([
    supabase.from("inspections").select("*").order("next_due", { ascending: true }),
    supabase.from("asset_history").select("*").order("repaired_at", { ascending: false }),
    supabase.from("recurring_tasks").select("*").order("next_run", { ascending: true }),
  ]);

  const overdue = (inspections || []).filter((i) => i.status === "overdue").length;
  const dueSoon = (inspections || []).filter((i) => i.status === "due_soon").length;
  const activeSchedules = (recurringTasks || []).filter((t) => t.status === "active").length;
  const monthlySpend = (assetHistory || []).reduce((sum, a) => sum + (Number(a.cost) || 0), 0);

  return NextResponse.json({
    summary: { overdue, dueSoon, activeSchedules, monthlySpend },
    inspections: inspections || [],
    assetHistory: assetHistory || [],
    recurringTasks: recurringTasks || [],
  });
}
