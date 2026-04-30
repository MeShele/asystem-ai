"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  data: { month: string; earned: number }[];
}

const MONTH_NAMES = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

function formatMonth(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1]} ${String(year).slice(2)}`;
}

/**
 * Заполняет последние 6 месяцев нулями, чтобы график всегда выглядел как "ряд столбиков",
 * даже если данных одна-две точки.
 */
function buildLast6MonthsSeries(raw: { month: string; earned: number }[]) {
  const map = new Map<string, number>();
  raw.forEach((d) => map.set(d.month, Number(d.earned || 0)));

  const series: { key: string; name: string; earned: number; isCurrent: boolean }[] = [];
  const now = new Date();
  const currentY = now.getFullYear();
  const currentM = now.getMonth() + 1;

  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentY, currentM - 1 - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    series.push({
      key,
      name: formatMonth(y, m),
      earned: map.get(key) || 0,
      isCurrent: i === 0,
    });
  }
  return series;
}

export function EarningsChart({ data }: Props) {
  const series = useMemo(() => buildLast6MonthsSeries(data), [data]);
  const total = series.reduce((s, m) => s + m.earned, 0);
  const current = series[series.length - 1].earned;
  const previous = series[series.length - 2]?.earned || 0;
  const trend = current - previous;
  const avg = total / series.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-3xl mb-2">📊</div>
        <div className="text-sm font-medium mb-1">Здесь будет график заработка</div>
        <p className="text-xs text-text-muted max-w-xs">
          Данные появятся после первых одобренных выплат — каждая выплата по дате попадёт в свой месяц
        </p>
      </div>
    );
  }

  const trendIcon = trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />;
  const trendColor = trend > 0 ? "text-green-500" : trend < 0 ? "text-red-500" : "text-text-muted";

  return (
    <div className="flex flex-col h-full">
      {/* Mini KPIs above chart */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Этот месяц</div>
          <div className="text-base font-bold text-text-primary">${current.toLocaleString("ru-RU")}</div>
        </div>
        <div className="text-center border-x border-border-faint">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">За 6 мес</div>
          <div className="text-base font-bold text-text-primary">${total.toLocaleString("ru-RU")}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">В среднем</div>
          <div className="text-base font-bold text-text-primary">${Math.round(avg).toLocaleString("ru-RU")}/мес</div>
        </div>
      </div>

      {/* Trend indicator */}
      {previous > 0 && (
        <div className={`text-[11px] flex items-center gap-1 mb-2 ${trendColor}`}>
          {trendIcon}
          {trend > 0 ? "+" : ""}${trend.toLocaleString("ru-RU")} к прошлому месяцу
        </div>
      )}

      {/* Bar chart */}
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-faint)" vertical={false} />
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
              tickFormatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`}
              width={48}
            />
            <Tooltip
              cursor={{ fill: "rgba(51, 129, 255, 0.05)" }}
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-faint)",
                borderRadius: "8px",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "var(--color-text-secondary)", marginBottom: 4 }}
              formatter={(value) => [`$${Number(value).toLocaleString("ru-RU")}`, "Получено"]}
            />
            <Bar dataKey="earned" radius={[6, 6, 0, 0]}>
              {series.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.isCurrent ? "#3381ff" : entry.earned > 0 ? "#3381ff80" : "var(--color-border-faint)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
