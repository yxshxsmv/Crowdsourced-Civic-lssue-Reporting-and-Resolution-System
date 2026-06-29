"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Timeline({ data }) {
  if (!data || data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No data</p>;
  }

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={formatted}>
        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={2} dot={{ fill: "#059669", r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
