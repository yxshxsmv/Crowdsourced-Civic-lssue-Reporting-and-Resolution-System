"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useWorkerTasks } from "@/hooks/useWorkerTasks";
import useGeolocation from "@/hooks/useGeolocation";
import { capitalize } from "@/lib/utils";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/constants";

const MapContent = dynamic(() => import("./MapContent"), { ssr: false });

export default function WorkerMapView() {
  const { user } = useAuth();
  const { tasks } = useWorkerTasks(user?.id);
  const { position } = useGeolocation();

  const center = position ? [position.lat, position.lng] : DEFAULT_CENTER;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Map View</h1>

      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
        {[
          { status: "assigned", color: "#3b82f6" },
          { status: "in_progress", color: "#f59e0b" },
          { status: "completed", color: "#22c55e" },
          { status: "escalated", color: "#ef4444" },
        ].map(({ status, color }) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-slate-300">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            {capitalize(status)}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <div className="h-3 w-3 rounded-full bg-amber-500 ring-2 ring-amber-200" />
          You
        </div>
      </div>

      <div className="h-[calc(100vh-250px)] rounded-xl border border-slate-700 overflow-hidden">
        <MapContent center={center} zoom={DEFAULT_ZOOM} tasks={tasks} position={position} />
      </div>
    </div>
  );
}
