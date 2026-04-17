"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { month: string; earned: number }[];
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
  return `${months[parseInt(m, 10) - 1]} ${year.slice(2)}`;
}

export function EarningsChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: formatMonth(d.month),
    earned: Number(d.earned),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        Данные появятся после первых проектов
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3381ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3381ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-faint)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={{ stroke: "var(--color-border-faint)" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-faint)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => [`$${Number(value).toLocaleString()}`, "Заработок"]}
        />
        <Area
          type="monotone"
          dataKey="earned"
          stroke="#3381ff"
          strokeWidth={2}
          fill="url(#earningsGradient)"
          dot={{ r: 4, fill: "#3381ff", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#3381ff", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
