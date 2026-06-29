"use client";

import { capitalize } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";

export default function DepartmentPerf({ reports }) {
  const categories = {};
  (reports || []).forEach((r) => {
    if (!r.category) return;
    if (!categories[r.category]) categories[r.category] = { total: 0, resolved: 0 };
    categories[r.category].total++;
    if (r.status === "resolved") categories[r.category].resolved++;
  });

  const data = Object.entries(categories)
    .filter(([, v]) => v.total > 0)
    .map(([cat, v]) => ({
      category: cat,
      total: v.total,
      resolved: v.resolved,
      rate: Math.round((v.resolved / v.total) * 100),
    }));

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No data</p>;
  }

  return (
    <div className="space-y-3">
      {data.map(({ category, total, resolved, rate }) => (
        <div key={category}>
          <div className="flex justify-between text-sm">
            <span className="font-medium">{capitalize(category)}</span>
            <span className="text-gray-500">
              {resolved}/{total} ({rate}%)
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${rate}%`, backgroundColor: CATEGORY_COLORS[category]?.hex || "#6b7280" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
