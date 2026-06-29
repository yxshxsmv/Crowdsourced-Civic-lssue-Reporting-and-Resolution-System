"use client";

import { useState } from "react";
import {
  ClipboardList, Loader2, Play, CheckCircle2,
  AlertTriangle, Navigation, Upload, X, MapPin, Clock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWorkerTasks, updateTaskStatus } from "@/hooks/useWorkerTasks";
import { uploadToSupabase, timeAgo, capitalize } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";

const PRIORITY_BADGE = {
  critical: "bg-red-500/20 text-red-300 ring-1 ring-red-500/30",
  high: "bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/30",
  low: "bg-slate-500/20 text-slate-300 ring-1 ring-slate-500/30",
};

const STATUS_CONFIG = {
  assigned: { dot: "bg-blue-400", label: "Assigned", badge: "bg-blue-500/15 text-blue-300" },
  in_progress: { dot: "bg-amber-400", label: "In Progress", badge: "bg-amber-500/15 text-amber-300" },
};

export default function WorkerDashboard() {
  const { user, supabase } = useAuth();
  const { tasks, loading } = useWorkerTasks(user?.id);
  const [actionLoading, setActionLoading] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(null);
  const [afterFile, setAfterFile] = useState(null);

  const assigned = tasks.filter((t) => t.status === "assigned").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const today = new Date().toISOString().split("T")[0];
  const doneToday = tasks.filter((t) => t.status === "completed" && t.completed_at?.startsWith(today)).length;

  const handleStart = async (taskId) => {
    setActionLoading(`start-${taskId}`);
    try {
      await updateTaskStatus(taskId, "in_progress", { started_at: new Date().toISOString() });
    } finally { setActionLoading(null); }
  };

  const handleEscalate = async (taskId) => {
    setActionLoading(`escalate-${taskId}`);
    try {
      await updateTaskStatus(taskId, "escalated");
    } finally { setActionLoading(null); }
  };

  const handleComplete = async (taskId) => {
    setActionLoading(`complete-${taskId}`);
    try {
      let afterUrl = null;
      if (afterFile) {
        afterUrl = await uploadToSupabase(supabase, afterFile, "completion-images", "after");
      }
      await updateTaskStatus(taskId, "completed", {
        completed_at: new Date().toISOString(),
        after_image: afterUrl,
      });
      setShowUploadModal(null);
      setAfterFile(null);
    } finally { setActionLoading(null); }
  };

  const activeTasks = tasks.filter((t) => t.status === "assigned" || t.status === "in_progress");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Field Operations</p>
        <h1 className="mt-1 text-2xl font-bold text-white">My Tasks</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Assigned", value: assigned, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5" },
          { label: "In Progress", value: inProgress, color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5" },
          { label: "Done Today", value: doneToday, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
        ].map(({ label, value, color, border, bg }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      ) : activeTasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-700 bg-slate-800 p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-slate-600" />
          <p className="mt-3 font-medium text-slate-400">No active tasks right now</p>
          <p className="mt-1 text-sm text-slate-600">New assignments will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTasks.map((task) => {
            const sc = STATUS_CONFIG[task.status] || STATUS_CONFIG.assigned;
            const pri = task.report?.priority;
            return (
              <div key={task.id} className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
                <div className="flex gap-4 p-4">
                  {task.report?.image_url ? (
                    <img src={task.report.image_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-700">
                      <MapPin className="h-8 w-8 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white">{task.report?.title || "Task"}</h3>
                    {task.report?.description && (
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2">{task.report.description}</p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sc.badge}`}>
                        <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      {pri && (
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE[pri] || PRIORITY_BADGE.low}`}>
                          {capitalize(pri)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {timeAgo(task.assigned_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-700 bg-slate-900/60 px-4 py-3">
                  {task.status === "assigned" && (
                    <button
                      onClick={() => handleStart(task.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading === `start-${task.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      Start Task
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <button
                      onClick={() => setShowUploadModal(task.id)}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Complete
                    </button>
                  )}
                  {task.report?.lat && task.report?.lng && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${task.report.lat},${task.report.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-blue-400 transition-colors hover:bg-slate-700 cursor-pointer"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Navigate
                    </a>
                  )}
                  <button
                    onClick={() => handleEscalate(task.id)}
                    disabled={!!actionLoading}
                    className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50 cursor-pointer"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Escalate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Complete Task</h2>
              <button
                onClick={() => { setShowUploadModal(null); setAfterFile(null); }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Upload a photo of the completed work (optional but recommended).
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-600 p-6 transition-colors hover:border-amber-500/50 hover:bg-amber-500/5">
              <Upload className="h-6 w-6 text-slate-500" />
              <span className="text-sm text-slate-400">
                {afterFile ? afterFile.name : "Tap to choose photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAfterFile(e.target.files?.[0])}
              />
            </label>
            <button
              onClick={() => handleComplete(showUploadModal)}
              disabled={!!actionLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading?.startsWith("complete-") ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirm Completion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
