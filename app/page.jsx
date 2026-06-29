"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import { Camera, HardHat, ShieldCheck, ArrowRight, MapPin, Users, CheckCircle2, Zap } from "lucide-react";
import { useEffect } from "react";

export default function Landing() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && role) {
      const map = {
        [ROLES.ADMIN]: "/admin/dashboard",
        [ROLES.WORKER]: "/worker/dashboard",
        [ROLES.HELPER]: "/helper/home",
      };
      router.replace(map[role] || "/helper/home");
    }
  }, [loading, user, role, router]);

  if (loading || (user && role)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/8 blur-[100px]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-medium text-emerald-400">
            <Zap className="h-3 w-3" />
            Civic issue reporting, reimagined
          </div>

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-2xl font-black text-white shadow-xl shadow-emerald-500/25">
            CS
          </div>

          <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
            Civic<span className="text-emerald-400">Sense</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-slate-400">
            Snap a photo, drop a pin. Your reports reach workers within minutes.
          </p>

          <div className="mt-10 flex items-center justify-center gap-8 text-center">
            {[
              { icon: MapPin, value: "500+", label: "Issues resolved" },
              { icon: Users, value: "3 roles", label: "Full workflow" },
              { icon: CheckCircle2, value: "AI-powered", label: "Auto-assignment" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="text-lg font-bold text-white">{value}</span>
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            Choose your role to continue
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <RoleCard
            href="/login/helper"
            icon={Camera}
            color="emerald"
            title="Citizen"
            subtitle="Sign up or log in"
            description="Report potholes, broken lights, garbage overflow, and other civic issues with geo-tagged photos."
            cta="Report an issue"
            features={["Photo + GPS capture", "Real-time tracking", "AI categorization"]}
          />
          <RoleCard
            href="/login/worker"
            icon={HardHat}
            color="amber"
            title="Field Worker"
            subtitle="Login with provided credentials"
            description="View your assigned tasks on an interactive map, navigate to sites, and mark issues as resolved."
            cta="View my tasks"
            features={["Task map view", "Google Maps nav", "Completion photos"]}
          />
          <RoleCard
            href="/login/admin"
            icon={ShieldCheck}
            color="indigo"
            title="Administrator"
            subtitle="Authorized personnel only"
            description="Monitor all reports, manage field workers, auto-assign tasks, and track city-wide resolution metrics."
            cta="Open dashboard"
            features={["AI auto-assignment", "Analytics dashboard", "Worker management"]}
          />
        </div>

        <p className="mt-12 text-center text-xs text-slate-700">
          CivicSense &mdash; Making cities better, one report at a time.
        </p>
      </div>
    </div>
  );
}

const colorMap = {
  emerald: {
    border: "border-emerald-500/20 hover:border-emerald-400/40",
    bg: "from-emerald-950/60 to-emerald-900/20",
    glow: "group-hover:shadow-emerald-500/10",
    iconBg: "bg-emerald-500/15",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cta: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  amber: {
    border: "border-amber-500/20 hover:border-amber-400/40",
    bg: "from-amber-950/60 to-amber-900/20",
    glow: "group-hover:shadow-amber-500/10",
    iconBg: "bg-amber-500/15",
    icon: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cta: "text-amber-400",
    dot: "bg-amber-500",
  },
  indigo: {
    border: "border-indigo-500/20 hover:border-indigo-400/40",
    bg: "from-indigo-950/60 to-indigo-900/20",
    glow: "group-hover:shadow-indigo-500/10",
    iconBg: "bg-indigo-500/15",
    icon: "text-indigo-400",
    badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    cta: "text-indigo-400",
    dot: "bg-indigo-500",
  },
};

function RoleCard({ href, icon: Icon, color, title, subtitle, description, cta, features }) {
  const c = colorMap[color];
  return (
    <Link
      href={href}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${c.border} ${c.bg} ${c.glow} cursor-pointer`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className={`inline-flex rounded-xl p-3 ${c.iconBg}`}>
          <Icon className={`h-6 w-6 ${c.icon}`} />
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${c.badge}`}>
          {subtitle}
        </span>
      </div>

      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>

      <ul className="mt-5 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-slate-500">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
            {f}
          </li>
        ))}
      </ul>

      <div className={`mt-6 flex items-center gap-1.5 text-sm font-semibold ${c.cta}`}>
        {cta}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
      </div>
    </Link>
  );
}
