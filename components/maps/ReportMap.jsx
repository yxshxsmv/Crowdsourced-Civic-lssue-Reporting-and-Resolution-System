"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { capitalize } from "@/lib/utils";
import { STATUS_COLORS, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

const STATUS_HEX = {
  pending: "#9ca3af",
  analyzing: "#a855f7",
  assigned: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#22c55e",
  duplicate: "#64748b",
  escalated: "#ef4444",
};

export default function ReportMap({ reports }) {
  const validReports = (reports || []).filter((r) => r.lat && r.lng);

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validReports.map((report) => (
        <CircleMarker
          key={report.id}
          center={[report.lat, report.lng]}
          radius={7}
          pathOptions={{
            color: STATUS_HEX[report.status] || "#6b7280",
            fillColor: STATUS_HEX[report.status] || "#6b7280",
            fillOpacity: 0.7,
          }}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-medium">{report.title}</p>
              {report.category && <p className="text-xs">{capitalize(report.category)}</p>}
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[report.status]?.bg || ""} ${STATUS_COLORS[report.status]?.text || ""}`}
              >
                {capitalize(report.status)}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
