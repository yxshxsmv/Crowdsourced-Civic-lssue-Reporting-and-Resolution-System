import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Try to find existing profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Check by email
    const { data: emailProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", user.email)
      .single();

    if (emailProfile) {
      // Update with correct auth id
      const { data } = await supabase
        .from("profiles")
        .update({ id: user.id })
        .eq("id", emailProfile.id)
        .select()
        .single();
      profile = data || emailProfile;
    } else {
      // Create new profile as helper
      const { data } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
          role: "helper",
        })
        .select()
        .single();
      profile = data;
    }
  }

  return NextResponse.json({
    id: profile.id,
    role: profile.role,
    fullName: profile.full_name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    phone: profile.phone,
  });
}
