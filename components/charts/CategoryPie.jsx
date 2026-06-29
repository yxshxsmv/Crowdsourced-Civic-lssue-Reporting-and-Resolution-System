"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CATEGORY_COLORS } from "@/lib/constants";
import { capitalize } from "@/lib/utils";

export default function CategoryPie({ byCategory }) {
  const data = Object.entries(byCategory || {}).map(([name, value]) => ({
    name: capitalize(name),
    value,
    fill: CATEGORY_COLORS[name]?.hex || "#6b7280",
  }));

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No data</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
