"use client";

import { useState } from "react";
import { ClipboardList, Map, UserCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

const links = [
  { to: "/worker/dashboard", label: "My Tasks", icon: ClipboardList },
  { to: "/worker/map", label: "Map View", icon: Map },
  { to: "/worker/profile", label: "Profile", icon: UserCircle },
];

export default function WorkerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={links}
        portal="worker"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          portal="worker"
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
