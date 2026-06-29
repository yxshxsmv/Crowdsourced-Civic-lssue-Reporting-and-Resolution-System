"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Camera, HardHat, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const PORTAL_CONFIG = {
  helper: {
    label: "Citizen Portal",
    Icon: Camera,
    badge: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    active: "bg-emerald-500/10 text-emerald-300 border-emerald-500",
    hover: "hover:bg-white/5 hover:text-slate-200",
  },
  admin: {
    label: "Admin Console",
    Icon: ShieldCheck,
    badge: "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20",
    active: "bg-indigo-500/10 text-indigo-300 border-indigo-500",
    hover: "hover:bg-white/5 hover:text-slate-200",
  },
  worker: {
    label: "Field Ops",
    Icon: HardHat,
    badge: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    active: "bg-amber-500/10 text-amber-300 border-amber-500",
    hover: "hover:bg-white/5 hover:text-slate-200",
  },
};

export default function Sidebar({ open, onClose, links, portal = "helper" }) {
  const pathname = usePathname();
  const cfg = PORTAL_CONFIG[portal] || PORTAL_CONFIG.helper;
  const { label, Icon: PortalIcon, badge, active, hover } = cfg;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/[0.06] bg-slate-950 transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-black text-white ring-1 ring-white/10">
              CS
            </div>
            <span className="text-sm font-semibold text-white">CivicSense</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-600 transition-colors hover:bg-white/5 hover:text-slate-300 md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-1">
          <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", badge)}>
            <PortalIcon className="h-3 w-3" />
            {label}
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 pt-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Navigation
          </p>
          {links.map(({ to, label: navLabel, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? active
                    : `border-transparent text-slate-500 ${hover}`
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {navLabel}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-[10px] text-slate-700">CivicSense v1.0</p>
        </div>
      </aside>
    </>
  );
}
