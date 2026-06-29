"use client";

import { useState } from "react";
import { Plus, Loader2, MapPin, X, Users, CheckCircle2, Clock } from "lucide-react";
import { useWorkers, createWorker } from "@/hooks/useWorkers";

export default function Workers() {
  const { workers, loading, refetch } = useWorkers();
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "", zone: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createWorker(form);
      setShowModal(false);
      setForm({ fullName: "", email: "", password: "", phone: "", zone: "" });
      refetch();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const available = workers.filter((w) => w.is_available).length;
  const busy = workers.filter((w) => !w.is_available).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Admin Console</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Workers</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 transition-colors hover:bg-indigo-500 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Worker
        </button>
      </div>

      {workers.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Workers", value: workers.length, icon: Users, color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Available", value: available, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "On Task", value: busy, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 inline-flex rounded-xl p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : workers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
          <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No workers yet</p>
          <p className="mt-1 text-xs text-gray-400">Add your first field worker to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => (
            <div key={worker.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                    {(worker.profile?.full_name || "W").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">
                      {worker.profile?.full_name || "Unknown"}
                    </h3>
                    <p className="text-xs text-gray-500 truncate max-w-[140px]">{worker.profile?.email}</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${worker.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {worker.is_available ? "Available" : "Busy"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Zone</p>
                  <p className="mt-0.5 flex items-center gap-1 font-medium text-gray-700">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {worker.zone || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Active Tasks</p>
                  <p className="mt-0.5 font-medium text-gray-700">{worker.active_task_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Completed</p>
                  <p className="mt-0.5 font-medium text-gray-700">{worker.total_completed}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="mt-0.5 font-medium text-gray-700">{worker.profile?.phone || "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Field Worker</h2>
                <p className="text-sm text-gray-500">Creates a Supabase account with worker role</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { field: "fullName", label: "Full Name", type: "text", required: true, placeholder: "John Doe" },
                { field: "email", label: "Email", type: "email", required: true, placeholder: "worker@example.com" },
                { field: "password", label: "Password", type: "password", required: true, placeholder: "Min. 8 characters", minLength: 8 },
                { field: "phone", label: "Phone", type: "tel", required: false, placeholder: "+91 98765 43210" },
                { field: "zone", label: "Zone", type: "text", required: false, placeholder: "e.g. North Delhi" },
              ].map(({ field, label, type, required, placeholder, minLength }) => (
                <div key={field}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={type}
                    required={required}
                    minLength={minLength}
                    value={form[field]}
                    placeholder={placeholder}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? "Creating account..." : "Create Worker"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
