"use client";

import { useState } from "react";
import { Home, Camera, FileText, Trophy } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

const links = [
  { to: "/helper/home",        label: "Home",        icon: Home },
  { to: "/helper/submit",      label: "Report Issue", icon: Camera },
  { to: "/helper/my-reports",  label: "My Reports",  icon: FileText },
  { to: "/helper/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function HelperLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={links}
        portal="helper"
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          portal="helper"
        />
        <main className="flex-1 overflow-y-auto p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}
