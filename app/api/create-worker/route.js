import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fullName, email, password, phone, zone } = await request.json();
  if (!fullName || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const adminClient = createAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUserId = authData.user.id;

    // Create profile
    await adminClient.from("profiles").upsert({
      id: newUserId,
      full_name: fullName,
      email,
      phone: phone || null,
      role: "worker",
    });

    // Create worker record
    await adminClient.from("workers").insert({
      id: newUserId,
      zone: zone || null,
    });

    return NextResponse.json({ success: true, workerId: newUserId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
