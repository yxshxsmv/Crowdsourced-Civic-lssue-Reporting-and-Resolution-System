"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin, Phone, Shield, CheckCircle2, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toggleWorkerAvailability } from "@/hooks/useWorkers";

export default function WorkerProfile() {
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/workers?id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setWorker(Array.isArray(data) ? data[0] : data);
        }
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchProfile();
  }, [user]);

  const handleToggle = async () => {
    if (!worker) return;
    setToggling(true);
    try {
      await toggleWorkerAvailability(worker.id, !worker.is_available);
      setWorker({ ...worker, is_available: !worker.is_available });
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const initial = (worker?.profile?.full_name || user?.fullName || "W").charAt(0).toUpperCase();
  const fullName = worker?.profile?.full_name || user?.fullName || "Worker";
  const email = worker?.profile?.email || user?.email;

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Field Ops</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Profile</h1>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl font-black text-amber-400 ring-2 ring-amber-500/30">
            {initial}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{fullName}</h2>
            <p className="text-sm text-slate-400">{email}</p>
            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20">
              Field Worker
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Active Tasks", value: worker?.active_task_count ?? 0, icon: ClipboardList, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Completed", value: worker?.total_completed ?? 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-slate-700 bg-slate-800 p-4">
            <div className={`mb-2 inline-flex rounded-xl p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800 p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-300">Details</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Zone</p>
              <p className="font-medium text-white">{worker?.zone || "Not assigned"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Phone</p>
              <p className="font-medium text-white">{worker?.profile?.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p className="font-medium text-white">Field Worker</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 transition-colors ${worker?.is_available ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-700 bg-slate-800"}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Availability</p>
            <p className="mt-0.5 text-sm text-slate-400">
              {worker?.is_available ? "Accepting new task assignments" : "Not accepting new tasks"}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative h-7 w-12 rounded-full transition-all duration-200 disabled:opacity-60 cursor-pointer ${worker?.is_available ? "bg-emerald-500" : "bg-slate-600"}`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${worker?.is_available ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
