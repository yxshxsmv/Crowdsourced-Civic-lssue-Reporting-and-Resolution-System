"use client";

import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const PORTAL_META = {
  helper: {
    label: "Citizen Portal",
    dot: "bg-emerald-500",
    wrapper: "bg-white border-gray-200",
    text: "text-gray-900",
    sub: "text-gray-500",
    menuBtn: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
  },
  admin: {
    label: "Admin Console",
    dot: "bg-indigo-500",
    wrapper: "bg-white border-gray-200",
    text: "text-gray-900",
    sub: "text-gray-500",
    menuBtn: "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
  },
  worker: {
    label: "Field Ops",
    dot: "bg-amber-500",
    wrapper: "bg-slate-900 border-slate-800",
    text: "text-white",
    sub: "text-slate-400",
    menuBtn: "text-slate-400 hover:bg-white/5 hover:text-white",
  },
};

export default function Navbar({ onToggleSidebar, portal = "helper" }) {
  const { user, signOut } = useAuth();
  const meta = PORTAL_META[portal] || PORTAL_META.helper;

  const displayName = user?.fullName || user?.email?.split("@")[0] || "";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 md:px-5",
        meta.wrapper
      )}
    >
      <button
        onClick={onToggleSidebar}
        className={cn(
          "rounded-lg p-1.5 transition-colors md:hidden cursor-pointer",
          meta.menuBtn
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 md:hidden">
        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
        <span className={cn("text-sm font-semibold", meta.text)}>{meta.label}</span>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
        <span className={cn("text-sm font-medium", meta.sub)}>{meta.label}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {displayName && (
          <span className={cn("hidden text-sm md:block", meta.sub)}>
            {displayName}
          </span>
        )}
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
            portal === "worker"
              ? "text-slate-400 hover:bg-white/5 hover:text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          )}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </header>
  );
}
