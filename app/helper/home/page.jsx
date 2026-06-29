"use client";

import Link from "next/link";
import { Camera, FileText, Clock, CheckCircle2, ArrowRight, MapPin, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useReports, useReportStats } from "@/hooks/useReports";
import { timeAgo, capitalize } from "@/lib/utils";

const STATUS_STYLE = {
  pending: { dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200" },
  analyzing: { dot: "bg-purple-400", badge: "bg-purple-50 text-purple-700 ring-1 ring-purple-200" },
  assigned: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  in_progress: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  resolved: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  duplicate: { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-200" },
};

export default function HelperHome() {
  const { user } = useAuth();
  const { reports, loading } = useReports({ reporterId: user?.id });
  const stats = useReportStats(reports);

  const firstName = user?.fullName?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            Citizen Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Help build a better city — one report at a time.
          </p>
        </div>
        <Link
          href="/helper/submit"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 transition-all hover:bg-emerald-500 cursor-pointer"
        >
          <Camera className="h-4 w-4" />
          Report Issue
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total", value: stats.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "In Progress", value: stats.inProgress, icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 inline-flex rounded-xl p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <Link
        href="/helper/submit"
        className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 transition-all hover:border-emerald-400 hover:from-emerald-50 hover:to-emerald-100 cursor-pointer"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-sm shadow-emerald-500/30">
          <Camera className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-emerald-900">Report a New Issue</p>
          <p className="text-sm text-emerald-700">
            Snap a photo, drop a pin &mdash; we&apos;ll handle the rest
          </p>
        </div>
        <ArrowRight className="h-5 w-5 text-emerald-400 transition-transform group-hover:translate-x-1" />
      </Link>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Reports</h2>
          <Link
            href="/helper/my-reports"
            className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : stats.recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No reports yet</p>
            <p className="mt-1 text-xs text-gray-400">Start by reporting an issue near you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recent.map((report) => {
              const s = STATUS_STYLE[report.status] || STATUS_STYLE.pending;
              return (
                <div
                  key={report.id}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  {report.image_url ? (
                    <img
                      src={report.image_url}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-900">{report.title}</p>
                    <p className="text-xs text-gray-400">{timeAgo(report.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.badge}`}>
                      {capitalize(report.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
