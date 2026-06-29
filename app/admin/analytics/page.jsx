"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useReports, useReportStats } from "@/hooks/useReports";
import CategoryPie from "@/components/charts/CategoryPie";
import PriorityBar from "@/components/charts/PriorityBar";
import Timeline from "@/components/charts/Timeline";
import DepartmentPerf from "@/components/charts/DepartmentPerf";

const ReportMap = dynamic(() => import("@/components/maps/ReportMap"), { ssr: false });

export default function Analytics() {
  const { reports, loading } = useReports();
  const stats = useReportStats(reports);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const resolutionRate = stats.total > 0
    ? ((stats.resolved / stats.total) * 100).toFixed(1)
    : 0;

  const resolvedReports = reports.filter(
    (r) => r.status === "resolved" && r.created_at && r.updated_at
  );
  const avgResolutionHrs = resolvedReports.length > 0
    ? (
        resolvedReports.reduce((sum, r) => {
          return sum + (new Date(r.updated_at) - new Date(r.created_at)) / 3600000;
        }, 0) / resolvedReports.length
      ).toFixed(1)
    : "—";

  const aiAnalyzed = reports.filter((r) => r.ai_summary).length;
  const duplicates = reports.filter((r) => r.status === "duplicate").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Resolution Rate", value: `${resolutionRate}%`, color: "text-green-700" },
          { label: "Avg Resolution Time", value: `${avgResolutionHrs}h`, color: "text-blue-700" },
          { label: "AI Analyzed", value: aiAnalyzed, color: "text-purple-700" },
          { label: "Duplicates Detected", value: duplicates, color: "text-amber-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border bg-white p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">7-Day Trend</h3>
          <Timeline data={stats.last7Days} />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">By Category</h3>
          <CategoryPie byCategory={stats.byCategory} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">By Priority</h3>
          <PriorityBar byPriority={stats.byPriority} />
        </div>
        <div className="rounded-xl border bg-white p-4">
          <h3 className="mb-4 font-semibold text-gray-900">Resolution by Category</h3>
          <DepartmentPerf reports={reports} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-4 font-semibold text-gray-900">All Reports</h3>
        <div className="h-96 rounded-lg overflow-hidden">
          <ReportMap reports={reports} />
        </div>
      </div>
    </div>
  );
}
