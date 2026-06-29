import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const supabase = await createClient();

  const { taskId } = await request.json();
  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

  try {
    const { data: task } = await supabase
      .from("tasks")
      .select("*, report:reports(*, reporter:profiles!reporter_id(*)), worker:workers(*, profile:profiles(*))")
      .eq("id", taskId)
      .single();

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const report = task.report;
    const worker = task.worker;
    const workerName = worker?.profile?.full_name || worker?.profile?.email || "Field worker";

    // Email admins
    const { data: admins } = await supabase.from("profiles").select("email").eq("role", "admin");
    const adminEmails = (admins || []).map((a) => a.email).filter(Boolean);

    if (adminEmails.length > 0) {
      await resend.emails.send({
        from: "CivicSense <notifications@civicsense.app>",
        to: adminEmails,
        subject: `Task Completed: ${report.title}`,
        html: `
          <h2>Task Completed</h2>
          <p><strong>${workerName}</strong> resolved "<em>${report.title}</em>"</p>
          <ul>
            <li><strong>Category:</strong> ${report.category || "—"}</li>
            <li><strong>Priority:</strong> ${report.priority || "—"}</li>
            <li><strong>Zone:</strong> ${worker?.zone || "—"}</li>
          </ul>
          ${task.after_image ? `<p><strong>Completion photo:</strong><br/><img src="${task.after_image}" width="400" /></p>` : ""}
          <hr />
          <p style="color: #888; font-size: 12px;">CivicSense Notification System</p>
        `,
      });
    }

    // Email reporter
    if (report?.reporter?.email) {
      await resend.emails.send({
        from: "CivicSense <notifications@civicsense.app>",
        to: report.reporter.email,
        subject: "Your reported issue has been resolved!",
        html: `
          <h2>Issue Resolved!</h2>
          <p>Great news! The issue you reported — "<em>${report.title}</em>" — has been resolved by our field team.</p>
          ${task.after_image ? `<p><strong>Resolution photo:</strong><br/><img src="${task.after_image}" width="400" /></p>` : ""}
          <p>Thank you for helping improve your community!</p>
          <hr />
          <p style="color: #888; font-size: 12px;">CivicSense — Building better communities together</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
