"use client";

import { useState } from "react";
import { Loader2, Brain, UserPlus, ChevronDown, ChevronUp, FileText, SlidersHorizontal } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { timeAgo, capitalize } from "@/lib/utils";
import { CATEGORIES, CATEGORY_COLORS, PRIORITY_COLORS } from "@/lib/constants";

const STATUS_DOT = {
  pending: "bg-yellow-400", analyzing: "bg-purple-400",
  assigned: "bg-blue-400", in_progress: "bg-amber-400",
  resolved: "bg-emerald-400", duplicate: "bg-gray-400",
};

export default function Reports() {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const { reports, loading, refetch } = useReports({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  });

  const handleAnalyze = async (report) => {
    setActionLoading(`analyze-${report.id}`);
    try {
      await fetch("/api/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, imageUrl: report.image_url, description: report.description || report.title }),
      });
      refetch();
    } catch { } finally { setActionLoading(null); }
  };

  const handleAutoAssign = async (report) => {
    setActionLoading(`assign-${report.id}`);
    try {
      await fetch("/api/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, reportLat: report.lat, reportLng: report.lng }),
      });
      refetch();
    } catch { } finally { setActionLoading(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Admin Console</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Reports</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {Object.keys(STATUS_DOT).map((s) => (
              <option key={s} value={s}>{capitalize(s)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        {(statusFilter || categoryFilter) && (
          <button
            onClick={() => { setStatusFilter(""); setCategoryFilter(""); }}
            className="text-xs text-indigo-600 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
          <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">No reports match the current filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            return (
              <div key={report.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div
                  className="flex cursor-pointer items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                >
                  {report.image_url ? (
                    <img src={report.image_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">{report.title}</h3>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                      )}
                    </div>
                    {report.description && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-1">{report.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[report.status] || "bg-gray-400"}`} />
                        {capitalize(report.status)}
                      </span>
                      {report.priority && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[report.priority]?.bg || ""} ${PRIORITY_COLORS[report.priority]?.text || ""}`}>
                          {capitalize(report.priority)}
                        </span>
                      )}
                      {report.category && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[report.category]?.bg || ""} ${CATEGORY_COLORS[report.category]?.text || ""}`}>
                          {capitalize(report.category)}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{timeAgo(report.created_at)}</span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-100 bg-slate-50 p-4 space-y-4">
                    <div className="grid gap-2 text-sm md:grid-cols-2">
                      <div className="text-gray-500">
                        <span className="font-medium text-gray-700">Location:</span>{" "}
                        {report.lat?.toFixed(5)}, {report.lng?.toFixed(5)}
                      </div>
                      {report.duplicate_of && (
                        <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 ring-1 ring-amber-200">
                          Duplicate of {report.duplicate_of.slice(0, 8)}...
                        </div>
                      )}
                    </div>

                    {report.ai_summary && (
                      <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-purple-700">AI Analysis</p>
                        <p className="text-sm text-purple-900">{report.ai_summary}</p>
                        {report.ai_confidence && (
                          <p className="mt-1 text-xs text-purple-600">
                            Confidence: {(report.ai_confidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {!report.ai_summary && report.status !== "duplicate" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAnalyze(report); }}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {actionLoading === `analyze-${report.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Brain className="h-3.5 w-3.5" />
                          )}
                          Run AI Analysis
                        </button>
                      )}
                      {(report.status === "pending" || report.status === "analyzing") && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAutoAssign(report); }}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer transition-colors"
                        >
                          {actionLoading === `assign-${report.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="h-3.5 w-3.5" />
                          )}
                          Auto-Assign Worker
                        </button>
                      )}
                    </div>
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
