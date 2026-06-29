"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PRIORITY_COLORS } from "@/lib/constants";
import { capitalize } from "@/lib/utils";

export default function PriorityBar({ byPriority }) {
  const data = Object.entries(byPriority || {}).map(([name, value]) => ({
    name: capitalize(name),
    value,
    fill: PRIORITY_COLORS[name]?.hex || "#6b7280",
  }));

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
