import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reportId, imageUrl, description } = await request.json();
  if (!reportId) return NextResponse.json({ error: "Missing reportId" }, { status: 400 });

  try {
    await supabase.from("reports").update({ status: "analyzing" }).eq("id", reportId);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const parts = [];

    if (imageUrl) {
      try {
        const imgRes = await fetch(imageUrl);
        const buffer = await imgRes.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        const mimeType = imgRes.headers.get("content-type") || "image/jpeg";
        parts.push({ inlineData: { data: base64, mimeType } });
      } catch {
        // Continue without image
      }
    }

    parts.push({
      text: `Analyze this civic issue report and provide a JSON response.
Description: ${description || "No description provided"}

Respond with ONLY valid JSON in this format:
{
  "category": "pothole|garbage|streetlight|flooding|vandalism|other",
  "priority": "critical|high|medium|low",
  "confidence": 0.0 to 1.0,
  "summary": "Brief analysis of the issue",
  "suggestedAction": "Recommended action to resolve"
}`,
    });

    const result = await model.generateContent(parts);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");

    const analysis = JSON.parse(jsonMatch[0]);

    await supabase.from("reports").update({
      ai_category: analysis.category,
      ai_priority: analysis.priority,
      ai_confidence: analysis.confidence,
      ai_summary: analysis.summary,
      ai_suggested_action: analysis.suggestedAction,
      category: analysis.category,
      priority: analysis.priority,
      status: "pending",
    }).eq("id", reportId);

    if (analysis.priority === "critical") {
      await supabase.from("alerts").insert({
        report_id: reportId,
        severity: "critical",
        message: `Critical issue detected: ${analysis.summary}`,
      });
    }

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    await supabase.from("reports").update({ status: "pending" }).eq("id", reportId).then(() => {});
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
