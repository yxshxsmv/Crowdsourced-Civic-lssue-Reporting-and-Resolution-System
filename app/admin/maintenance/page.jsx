"use client";

import { useState, useEffect } from "react";
import {
  Wrench, ClipboardList, Archive, RefreshCw, AlertTriangle,
  Clock, CalendarCheck, DollarSign, CheckCircle2, Loader2, Play, Pause
} from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";

const STATUS_INSPECTION = {
  overdue:   { badge: "bg-red-100 text-red-700 ring-1 ring-red-200",     dot: "bg-red-500",    label: "Overdue" },
  due_soon:  { badge: "bg-amber-100 text-amber-700 ring-1 ring-amber-200", dot: "bg-amber-500", label: "Due Soon" },
  pending:   { badge: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",  dot: "bg-blue-400",   label: "Pending" },
  completed: { badge: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500", label: "Completed" },
};

const FREQ_LABEL = { weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly", annual: "Annual" };

const TABS = [
  { id: "inspections",    label: "Inspections",    icon: ClipboardList },
  { id: "assethistory",   label: "Asset History",  icon: Archive },
  { id: "recurring",      label: "Recurring Tasks", icon: RefreshCw },
];

function InspectionsTab({ inspections }) {
  return inspections.length === 0 ? (
    <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
      <ClipboardList className="mx-auto mb-2 h-8 w-8 text-gray-300" />
      <p className="text-sm text-gray-500">No inspections scheduled</p>
    </div>
  ) : (
    <div className="space-y-3">
      {inspections.map((item) => {
        const s = STATUS_INSPECTION[item.status] || STATUS_INSPECTION.pending;
        return (
          <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>{s.label}</span>
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                    {FREQ_LABEL[item.frequency] || item.frequency}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-gray-500">
                  {item.zone && <span>Zone: <span className="font-medium text-gray-700">{item.zone}</span></span>}
                  {item.inspector && <span>Inspector: <span className="font-medium text-gray-700">{item.inspector}</span></span>}
                  {item.last_inspected && <span>Last: {formatDate(item.last_inspected, "MMM d, yyyy")}</span>}
                  {item.next_due && <span>Next due: {formatDate(item.next_due, "MMM d, yyyy")}</span>}
                </div>
                {item.notes && <p className="mt-1.5 text-xs text-gray-400 italic">{item.notes}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssetHistoryTab({ assetHistory }) {
  const totalSpend = assetHistory.reduce((s, a) => s + (Number(a.cost) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
        <DollarSign className="h-5 w-5 text-emerald-600" />
        <div>
          <p className="text-xs text-gray-500">Total Spend (all records)</p>
          <p className="text-lg font-bold text-gray-900">
            ₹{totalSpend.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {assetHistory.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <Archive className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">No asset history records</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {["Asset", "Zone", "Repair Type", "Cost", "Date", "Technician"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assetHistory.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{a.asset_name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.zone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{a.repair_type || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {a.cost > 0 ? `₹${Number(a.cost).toLocaleString("en-IN")}` : "No cost"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.repaired_at ? formatDate(a.repaired_at, "MMM d, yyyy") : "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{a.technician || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RecurringTasksTab({ recurringTasks }) {
  return recurringTasks.length === 0 ? (
    <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
      <RefreshCw className="mx-auto mb-2 h-8 w-8 text-gray-300" />
      <p className="text-sm text-gray-500">No recurring tasks configured</p>
    </div>
  ) : (
    <div className="space-y-3">
      {recurringTasks.map((task) => (
        <div key={task.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${task.status === "active" ? "bg-emerald-100" : "bg-gray-100"}`}>
                {task.status === "active"
                  ? <Play className="h-3.5 w-3.5 text-emerald-600" />
                  : <Pause className="h-3.5 w-3.5 text-gray-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm">{task.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${task.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {task.status === "active" ? "Active" : "Paused"}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                    {FREQ_LABEL[task.frequency] || task.frequency}
                  </span>
                </div>
                {task.description && <p className="text-xs text-gray-500 mb-1.5">{task.description}</p>}
                <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-gray-400">
                  {task.zone && <span>Zone: <span className="text-gray-600">{task.zone}</span></span>}
                  {task.last_run && <span>Last run: {formatDate(task.last_run, "MMM d, yyyy")}</span>}
                  {task.next_run && <span>Next run: {formatDate(task.next_run, "MMM d, yyyy")}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState("inspections");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/maintenance")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const { summary = {}, inspections = [], assetHistory = [], recurringTasks = [] } = data || {};

  const summaryCards = [
    { label: "Overdue Inspections",  value: summary.overdue ?? 0,          icon: AlertTriangle, color: "text-red-600",     bg: "bg-red-50" },
    { label: "Due Soon",             value: summary.dueSoon ?? 0,           icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50" },
    { label: "Monthly Spend",        value: `₹${(summary.monthlySpend ?? 0).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Schedules",     value: summary.activeSchedules ?? 0,   icon: CalendarCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wrench className="h-6 w-6 text-indigo-500" /> Maintenance
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Proactive infrastructure management — inspections, assets, and recurring schedules.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex rounded-xl p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Resolved by category (pulled from reports via maintenance context) */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold text-gray-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Asset History Summary
        </h3>
        <div className="space-y-2">
          {assetHistory.slice(0, 3).map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{a.asset_name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">{timeAgo(a.repaired_at || a.created_at)}</span>
                <span className="font-medium text-gray-900">
                  {a.cost > 0 ? `₹${Number(a.cost).toLocaleString("en-IN")}` : "No cost"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === id
                  ? "border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === "inspections" && <InspectionsTab inspections={inspections} />}
          {activeTab === "assethistory" && <AssetHistoryTab assetHistory={assetHistory} />}
          {activeTab === "recurring" && <RecurringTasksTab recurringTasks={recurringTasks} />}
        </div>
      </div>
    </div>
  );
}
