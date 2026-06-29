"use client";

import { useState } from "react";
import { LayoutDashboard, FileText, Users, BarChart3, Megaphone, Wrench } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/workers", label: "Workers", icon: Users },
  { to: "/admin/analytics",   label: "Analytics",   icon: BarChart3 },
  { to: "/admin/community",   label: "Community",   icon: Megaphone },
  { to: "/admin/maintenance", label: "Maintenance", icon: Wrench },
];

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={links}
        portal="admin"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          portal="admin"
        />
        <main className="flex-1 overflow-y-auto p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}
