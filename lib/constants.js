export const ROLES = {
  HELPER: "helper",
  ADMIN: "admin",
  WORKER: "worker",
};

export const REPORT_STATUS = {
  PENDING: "pending",
  ANALYZING: "analyzing",
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  DUPLICATE: "duplicate",
  ESCALATED: "escalated",
};

export const TASK_STATUS = {
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ESCALATED: "escalated",
};

export const CATEGORIES = [
  { value: "pothole", label: "Pothole" },
  { value: "garbage", label: "Garbage" },
  { value: "streetlight", label: "Streetlight" },
  { value: "flooding", label: "Flooding" },
  { value: "vandalism", label: "Vandalism" },
  { value: "other", label: "Other" },
];

export const PRIORITIES = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const CATEGORY_COLORS = {
  pothole: { bg: "bg-amber-100", text: "text-amber-800", hex: "#f59e0b" },
  garbage: { bg: "bg-green-100", text: "text-green-800", hex: "#22c55e" },
  streetlight: { bg: "bg-yellow-100", text: "text-yellow-800", hex: "#eab308" },
  flooding: { bg: "bg-blue-100", text: "text-blue-800", hex: "#3b82f6" },
  vandalism: { bg: "bg-red-100", text: "text-red-800", hex: "#ef4444" },
  other: { bg: "bg-gray-100", text: "text-gray-800", hex: "#6b7280" },
};

export const PRIORITY_COLORS = {
  critical: { bg: "bg-red-100", text: "text-red-800", hex: "#ef4444" },
  high: { bg: "bg-orange-100", text: "text-orange-800", hex: "#f97316" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-800", hex: "#eab308" },
  low: { bg: "bg-green-100", text: "text-green-800", hex: "#22c55e" },
};

export const STATUS_COLORS = {
  pending: { bg: "bg-gray-100", text: "text-gray-800" },
  analyzing: { bg: "bg-purple-100", text: "text-purple-800" },
  assigned: { bg: "bg-blue-100", text: "text-blue-800" },
  in_progress: { bg: "bg-amber-100", text: "text-amber-800" },
  resolved: { bg: "bg-green-100", text: "text-green-800" },
  duplicate: { bg: "bg-slate-100", text: "text-slate-800" },
  escalated: { bg: "bg-red-100", text: "text-red-800" },
};

export const DEFAULT_CENTER = [28.6139, 77.209];
export const DEFAULT_ZOOM = 12;
export const MAX_REPORTS_PER_DAY = 10;
export const DUPLICATE_RADIUS_METERS = 100;
