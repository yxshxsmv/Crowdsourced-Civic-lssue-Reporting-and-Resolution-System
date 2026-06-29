"use client";

import dynamic from "next/dynamic";
import {
  FileText, Clock, UserCheck, Loader2,
  CheckCircle2, AlertTriangle, Users,
} from "lucide-react";
import { useReports, useReportStats } from "@/hooks/useReports";
import { useWorkers } from "@/hooks/useWorkers";
import { timeAgo, capitalize } from "@/lib/utils";
import CategoryPie from "@/components/charts/CategoryPie";
import PriorityBar from "@/components/charts/PriorityBar";
import Timeline from "@/components/charts/Timeline";
import DepartmentPerf from "@/components/charts/DepartmentPerf";

const ReportMap = dynamic(() => import("@/components/maps/ReportMap"), { ssr: false });

const STATUS_BADGE = {
  pending: "bg-yellow-100 text-yellow-800",
  analyzing: "bg-purple-100 text-purple-800",
  assigned: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
  duplicate: "bg-gray-100 text-gray-700",
};
const STATUS_DOT = {
  pending: "bg-yellow-400", analyzing: "bg-purple-400",
  assigned: "bg-blue-400", in_progress: "bg-amber-400",
  resolved: "bg-emerald-400", duplicate: "bg-gray-400",
};

export default function Dashboard() {
  const { reports, loading } = useReports();
  const stats = useReportStats(reports);
  const { workers } = useWorkers();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const availableWorkers = workers.filter((w) => w.is_available).length;

  const statCards = [
    { label: "Total Reports", value: stats.total, icon: FileText, accent: "text-slate-600", bg: "bg-slate-100" },
    { label: "Pending", value: stats.pending, icon: Clock, accent: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Assigned", value: stats.assigned, icon: UserCheck, accent: "text-blue-600", bg: "bg-blue-50" },
    { label: "In Progress", value: stats.inProgress, icon: AlertTriangle, accent: "text-amber-600", bg: "bg-amber-50" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, accent: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Admin Console</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-700">
            {availableWorkers} worker{availableWorkers !== 1 ? "s" : ""} available
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, accent, bg }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 inline-flex rounded-xl p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${accent}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">By Category</h3>
          <p className="mb-4 text-xs text-gray-400">Issue type breakdown</p>
          <CategoryPie byCategory={stats.byCategory} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">By Priority</h3>
          <p className="mb-4 text-xs text-gray-400">Urgency distribution</p>
          <PriorityBar byPriority={stats.byPriority} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Activity Timeline</h3>
          <p className="mb-4 text-xs text-gray-400">Reports over the last 7 days</p>
          <Timeline data={stats.last7Days} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Resolution by Category</h3>
          <p className="mb-4 text-xs text-gray-400">Completion rate per issue type</p>
          <DepartmentPerf reports={reports} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-sm font-semibold text-gray-900">Reports Map</h3>
        <p className="mb-4 text-xs text-gray-400">Geographic distribution of all issues</p>
        <div className="h-80 overflow-hidden rounded-xl">
          <ReportMap reports={reports} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Recent Activity</h3>
          {stats.recent.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No recent reports</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[r.status] || "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-400">{timeAgo(r.created_at)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status] || "bg-gray-100 text-gray-700"}`}>
                    {capitalize(r.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Field Workers</h3>
          {workers.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">No workers registered</p>
          ) : (
            <div className="space-y-2">
              {workers.slice(0, 6).map((w) => (
                <div key={w.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {(w.profile?.full_name || "W").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{w.profile?.full_name || "—"}</p>
                    <p className="text-xs text-gray-500">{w.zone || "No zone"} &middot; {w.active_task_count} active</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${w.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {w.is_available ? "Free" : "Busy"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
