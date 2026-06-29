"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Star, Users, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const RANK_STYLES = [
  { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-400", text: "text-amber-700", label: "🥇" },
  { bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-400", text: "text-slate-700", label: "🥈" },
  { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-400", text: "text-orange-700", label: "🥉" },
];

function Avatar({ name, avatarUrl, size = "h-10 w-10" }) {
  const initials = name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name} className={`${size} rounded-full object-cover ring-2 ring-white`} />
    );
  }
  return (
    <div className={`${size} flex items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 ring-2 ring-white`}>
      {initials}
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const { leaderboard = [], totals = {} } = data || {};
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const myRank = leaderboard.findIndex((u) => u.id === user?.id) + 1;

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Community</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Community Leaderboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Top contributors who are making the city a better place
        </p>
      </div>

      {/* Platform totals */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Contributors", value: totals.contributors ?? 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Total Reports", value: totals.totalReports ?? 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Issues Resolved", value: totals.resolved ?? 0, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-center">
            <div className={`mx-auto mb-2 inline-flex rounded-xl p-2 ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Your rank */}
      {myRank > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3">
          <Star className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium text-emerald-800">
            You are ranked <span className="font-bold">#{myRank}</span> on the leaderboard
          </p>
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No contributors yet</p>
          <p className="mt-1 text-sm text-gray-400">Be the first to report a civic issue!</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Top Contributors</h2>
              {top3.map((entry, i) => {
                const style = RANK_STYLES[i];
                const isMe = entry.id === user?.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 rounded-2xl border-2 p-4 shadow-sm transition-shadow hover:shadow-md ${style.bg} ${style.border} ${isMe ? "ring-2 ring-emerald-400" : ""}`}
                  >
                    <span className="text-2xl w-8 text-center shrink-0">{style.label}</span>
                    <Avatar name={entry.fullName} avatarUrl={entry.avatarUrl} size="h-12 w-12" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {entry.fullName} {isMe && <span className="text-xs text-emerald-600 font-medium">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{entry.total} reports · {entry.resolved} resolved</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-lg font-bold ${style.text}`}>{entry.score}</p>
                      <p className="text-xs text-gray-400">pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Rankings</h2>
              {rest.map((entry, i) => {
                const rank = i + 4;
                const isMe = entry.id === user?.id;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md ${isMe ? "ring-2 ring-emerald-400 border-emerald-200" : "border-gray-200"}`}
                  >
                    <span className="w-7 text-center text-sm font-bold text-gray-400 shrink-0">#{rank}</span>
                    <Avatar name={entry.fullName} avatarUrl={entry.avatarUrl} size="h-9 w-9" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {entry.fullName} {isMe && <span className="text-xs text-emerald-600">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-400">{entry.total} reports · {entry.resolved} resolved</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700 shrink-0">{entry.score} pts</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* How scoring works */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Medal className="h-4 w-4 text-amber-500" /> How Points Work
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Submit a report</span>
            <span className="font-semibold text-emerald-600">+10 pts</span>
          </div>
          <div className="flex justify-between">
            <span>Report gets resolved</span>
            <span className="font-semibold text-emerald-600">+20 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
