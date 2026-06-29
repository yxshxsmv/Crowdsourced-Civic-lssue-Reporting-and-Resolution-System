"use client";

import Link from "next/link";
import { FileText, ArrowRight, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useReports } from "@/hooks/useReports";
import { timeAgo, capitalize } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";

const STATUS_STYLE = {
  pending: { dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200" },
  analyzing: { dot: "bg-purple-400", badge: "bg-purple-50 text-purple-700 ring-1 ring-purple-200" },
  assigned: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  in_progress: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  resolved: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  duplicate: { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 ring-1 ring-gray-200" },
};

export default function MyReports() {
  const { user } = useAuth();
  const { reports, loading } = useReports({ reporterId: user?.id });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Citizen Portal</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">My Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Track the status of all your submitted issues.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
          <FileText className="mx-auto mb-3 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No reports submitted yet</p>
          <Link
            href="/helper/submit"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
          >
            Submit your first report <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const s = STATUS_STYLE[report.status] || STATUS_STYLE.pending;
            return (
              <div key={report.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="flex gap-4 p-4">
                  {report.image_url ? (
                    <img src={report.image_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <MapPin className="h-7 w-7 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-semibold text-gray-900">{report.title}</h3>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.badge}`}>
                          {capitalize(report.status)}
                        </span>
                      </div>
                    </div>
                    {report.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{report.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {report.category && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[report.category]?.bg || "bg-gray-100"} ${CATEGORY_COLORS[report.category]?.text || "text-gray-700"}`}>
                          {capitalize(report.category)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{timeAgo(report.created_at)}</span>
                    </div>
                  </div>
                </div>

                {report.ai_summary && (
                  <div className="border-t border-purple-100 bg-purple-50 px-4 py-3">
                    <p className="mb-0.5 text-xs font-semibold text-purple-700">AI Analysis</p>
                    <p className="text-sm text-purple-900">{report.ai_summary}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
