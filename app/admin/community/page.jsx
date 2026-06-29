"use client";

import { useState, useEffect } from "react";
import {
  Megaphone, MessageSquare, CalendarDays, Users, CheckCircle2,
  Clock, Wifi, Plus, AlertTriangle, Info, Sparkles, Loader2, Send
} from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { useReports } from "@/hooks/useReports";
import { useWorkers } from "@/hooks/useWorkers";

const TYPE_CONFIG = {
  alert:   { label: "Alert",   icon: AlertTriangle, badge: "bg-red-100 text-red-700 ring-1 ring-red-200" },
  update:  { label: "Update",  icon: Info,          badge: "bg-blue-100 text-blue-700 ring-1 ring-blue-200" },
  feature: { label: "Feature", icon: Sparkles,      badge: "bg-purple-100 text-purple-700 ring-1 ring-purple-200" },
};

const TOWN_HALLS = [
  { id: 1, title: "Q2 Infrastructure Review",        date: "April 20, 2026", time: "6:00 PM", location: "Town Hall, Zone A",   attendees: 34, status: "upcoming" },
  { id: 2, title: "Monsoon Preparedness Briefing",   date: "May 5, 2026",   time: "5:30 PM", location: "Community Centre, Zone B", attendees: 52, status: "upcoming" },
  { id: 3, title: "Streetlight Drive – Q1 Results",  date: "March 15, 2026", time: "6:00 PM", location: "Virtual (Google Meet)", attendees: 68, status: "completed" },
];

const TABS = [
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "feedback",      label: "Feedback",      icon: MessageSquare },
  { id: "townhalls",     label: "Town Halls",    icon: CalendarDays },
];

function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "update" });
  const [posting, setPosting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const post = async () => {
    if (!form.title.trim()) return;
    setPosting(true);
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", message: "", type: "update" });
    setShowForm(false);
    load();
    setPosting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{announcements.length} announcement{announcements.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
          <h3 className="font-semibold text-indigo-900 text-sm">Publish Announcement</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Title *"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="update">Update</option>
              <option value="alert">Alert</option>
              <option value="feature">Feature</option>
            </select>
          </div>
          <textarea
            placeholder="Message (optional)"
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
            >Cancel</button>
            <button
              onClick={post}
              disabled={posting || !form.title.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Publish
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <Megaphone className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-500">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => {
            const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.update;
            const Icon = cfg.icon;
            return (
              <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{a.title}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    {a.message && <p className="mt-1 text-sm text-gray-600">{a.message}</p>}
                    <p className="mt-1.5 text-xs text-gray-400">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FeedbackTab() {
  const feedbackItems = [
    { id: 1, author: "Priya M.", message: "Response times have improved a lot this month. Thank you!", rating: 5, date: "2 days ago" },
    { id: 2, author: "Rahul K.", message: "The pothole on MG Road was fixed within 3 days. Very impressed!", rating: 5, date: "4 days ago" },
    { id: 3, author: "Anita S.", message: "Would be great to get more frequent status updates via SMS too.", rating: 4, date: "1 week ago" },
    { id: 4, author: "Vikram P.", message: "The new tracking feature is excellent. I can see my report progress in real time.", rating: 5, date: "1 week ago" },
    { id: 5, author: "Deepa N.", message: "Garbage collection has improved but streetlights in Zone C still need attention.", rating: 3, date: "2 weeks ago" },
  ];

  const avgRating = (feedbackItems.reduce((s, f) => s + f.rating, 0) / feedbackItems.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="text-center">
          <p className="text-3xl font-bold text-amber-500">{avgRating}</p>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1,2,3,4,5].map((s) => (
              <span key={s} className={`text-lg ${s <= Math.round(avgRating) ? "text-amber-400" : "text-gray-200"}`}>★</span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Average Rating</p>
        </div>
        <div className="h-12 w-px bg-gray-200" />
        <div>
          <p className="text-2xl font-bold text-gray-900">{feedbackItems.length}</p>
          <p className="text-sm text-gray-500">Feedback entries</p>
        </div>
      </div>

      <div className="space-y-3">
        {feedbackItems.map((f) => (
          <div key={f.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">{f.author}</p>
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={`text-sm ${s <= f.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{f.date}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{f.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TownHallsTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Upcoming and past community town halls and meetings.</p>
      <div className="space-y-3">
        {TOWN_HALLS.map((t) => (
          <div key={t.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.status === "upcoming" ? "bg-indigo-100" : "bg-gray-100"}`}>
                  <CalendarDays className={`h-4 w-4 ${t.status === "upcoming" ? "text-indigo-600" : "text-gray-400"}`} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.date} at {t.time}</p>
                  <p className="text-xs text-gray-400">{t.location}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.status === "upcoming" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                  {t.status === "upcoming" ? "Upcoming" : "Completed"}
                </span>
                <p className="mt-1 text-xs text-gray-400">{t.attendees} attendees</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("announcements");
  const { reports } = useReports();
  const { workers } = useWorkers();

  const resolvedThisWeek = reports.filter((r) => {
    if (r.status !== "resolved") return false;
    const d = new Date(r.updated_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    return d > weekAgo;
  }).length;

  const workersOnline = workers.filter((w) => w.is_available).length;
  const activeReporters = [...new Set(reports.map((r) => r.reporter_id).filter(Boolean))].length;

  const summary = [
    { label: "Active Reporters",     value: activeReporters, icon: Users,         color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Resolved This Week",   value: resolvedThisWeek, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Avg Resolution",        value: "2.4 days",      icon: Clock,         color: "text-blue-600",   bg: "bg-blue-50" },
    { label: "Workers Online",        value: workersOnline,   icon: Wifi,          color: "text-amber-600",  bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-indigo-500" /> Community Engagement
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Keep citizens informed, collect feedback, and manage town halls.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summary.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className={`mb-2 inline-flex rounded-xl p-2 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
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
          {activeTab === "announcements" && <AnnouncementsTab />}
          {activeTab === "feedback" && <FeedbackTab />}
          {activeTab === "townhalls" && <TownHallsTab />}
        </div>
      </div>
    </div>
  );
}
