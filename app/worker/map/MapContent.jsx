"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Navigation } from "lucide-react";
import { capitalize } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

const TASK_COLORS = {
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  escalated: "#ef4444",
};

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14);
    }
  }, [position, map]);
  return null;
}

export default function MapContent({ center, zoom, tasks, position }) {
  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo position={position} />

      {position && (
        <CircleMarker
          center={[position.lat, position.lng]}
          radius={10}
          pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.8 }}
        >
          <Popup>Your location</Popup>
        </CircleMarker>
      )}

      {tasks
        .filter((t) => t.report?.lat && t.report?.lng)
        .map((task) => (
          <CircleMarker
            key={task.id}
            center={[task.report.lat, task.report.lng]}
            radius={8}
            pathOptions={{
              color: TASK_COLORS[task.status] || "#6b7280",
              fillColor: TASK_COLORS[task.status] || "#6b7280",
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-medium">{task.report.title}</p>
                {task.report.description && (
                  <p className="text-xs text-gray-600">{task.report.description}</p>
                )}
                <p className="text-xs">Status: {capitalize(task.status)}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${task.report.lat},${task.report.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <Navigation className="h-3 w-3" />
                  Navigate
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}
