import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const RADIUS_DEGREES = 0.001; // ~111m

export async function POST(request) {
  const supabase = await createClient();

  const { reportId, lat, lng, category } = await request.json();
  if (!reportId || !lat || !lng || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const { data: nearby } = await supabase
      .from("reports")
      .select("id")
      .neq("id", reportId)
      .eq("category", category)
      .not("status", "in", '("resolved","duplicate")')
      .gte("lat", lat - RADIUS_DEGREES)
      .lte("lat", lat + RADIUS_DEGREES)
      .gte("lng", lng - RADIUS_DEGREES)
      .lte("lng", lng + RADIUS_DEGREES)
      .order("created_at", { ascending: true })
      .limit(1);

    if (nearby && nearby.length > 0) {
      await supabase.from("reports").update({
        status: "duplicate",
        duplicate_of: nearby[0].id,
      }).eq("id", reportId);

      return NextResponse.json({ isDuplicate: true, duplicateOf: nearby[0].id });
    }

    return NextResponse.json({ isDuplicate: false });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
