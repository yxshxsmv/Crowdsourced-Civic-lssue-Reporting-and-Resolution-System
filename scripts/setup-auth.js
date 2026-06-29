/**
 * setup-auth.js
 * Creates 3 Supabase Auth users (admin, worker, helper) and syncs the profiles table.
 * Run once: node scripts/setup-auth.js
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === "PASTE_SERVICE_ROLE_KEY_HERE") {
  console.error("❌  Missing env vars. Check .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: "admin@civicsense.com",  password: "Admin@123",  fullName: "Demo Admin",  role: "admin" },
  { email: "worker@civicsense.com", password: "Worker@123", fullName: "Demo Worker", role: "worker" },
  { email: "helper@civicsense.com", password: "Helper@123", fullName: "Demo Helper", role: "helper" },
];

async function setup() {
  console.log("🚀  Setting up CivicSense auth users...\n");

  // 1. Delete old Clerk-based data
  console.log("🗑   Clearing old Clerk-based profiles & workers...");
  await supabase.from("workers").delete().neq("id", "___none___");
  await supabase.from("profiles").delete().neq("id", "___none___");

  const createdUsers = [];

  for (const u of USERS) {
    // 2. Delete existing auth user if present (idempotent)
    const { data: existing } = await supabase.auth.admin.listUsers();
    const match = existing?.users?.find((x) => x.email === u.email);
    if (match) {
      await supabase.auth.admin.deleteUser(match.id);
      console.log(`🔄  Deleted existing auth user: ${u.email}`);
    }

    // 3. Create auth user
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName },
    });

    if (error) {
      console.error(`❌  Failed to create ${u.email}:`, error.message);
      process.exit(1);
    }

    const uid = data.user.id;
    console.log(`✅  Created auth user: ${u.email}  (id: ${uid})`);
    createdUsers.push({ ...u, id: uid });
  }

  // 4. Insert profiles
  const { error: profileErr } = await supabase.from("profiles").insert(
    createdUsers.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.fullName,
      role: u.role,
    }))
  );
  if (profileErr) {
    console.error("❌  profiles insert failed:", profileErr.message);
    process.exit(1);
  }
  console.log("\n✅  Profiles inserted.");

  // 5. Insert worker row for the worker user
  const worker = createdUsers.find((u) => u.role === "worker");
  const { error: workerErr } = await supabase.from("workers").insert({
    id: worker.id,
    zone: "Zone A",
    is_available: true,
    active_task_count: 0,
    total_completed: 0,
  });
  if (workerErr) {
    console.error("❌  workers insert failed:", workerErr.message);
    process.exit(1);
  }
  console.log("✅  Worker record inserted.");

  console.log("\n🎉  Done! Login credentials:");
  console.log("─".repeat(55));
  console.log("  Role    │ Email                    │ Password");
  console.log("─".repeat(55));
  for (const u of createdUsers) {
    console.log(`  ${u.role.padEnd(7)} │ ${u.email.padEnd(24)} │ ${u.password}`);
  }
  console.log("─".repeat(55));
  console.log("\n  Helper  → http://localhost:3000/login/helper");
  console.log("  Admin   → http://localhost:3000/login/admin");
  console.log("  Worker  → http://localhost:3000/login/worker\n");
}

setup().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
