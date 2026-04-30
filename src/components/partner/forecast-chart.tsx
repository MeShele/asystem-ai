"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MonthBucket {
  month: string;
  forecast: number;
  breakdown: { projectId: string; projectName: string; amount: number }[];
}

interface ForecastData {
  months: MonthBucket[];
  totals: {
    sum: number;
    activeProjectsWithCommission: number;
  };
}

const MONTH_NAMES_RU = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];

function fmtMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_NAMES_RU[m - 1] || ""} ${String(y).slice(-2)}`;
}

export function ForecastChart() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/forecast")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-5 rounded-xl border border-border-faint bg-surface mb-6 h-[280px] flex items-center justify-center">
        <div className="text-text-muted text-sm">Расчёт прогноза...</div>
      </div>
    );
  }

  if (!data || data.months.length === 0 || data.totals.sum === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl border border-dashed border-border-faint bg-surface mb-6 text-center"
      >
        <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-sm text-text-muted">
          Прогноз появится когда у вас будет хотя бы один активный проект с непогашенной комиссией.
        </p>
      </motion.div>
    );
  }

  const chartData = data.months.map((m) => ({
    name: fmtMonth(m.month),
    forecast: m.forecast,
    breakdown: m.breakdown,
  }));

  const max = Math.max(...chartData.map((d) => d.forecast), 1);
  const peakIndex = chartData.findIndex((d) => d.forecast === max);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 lg:p-6 rounded-xl border border-border-faint bg-surface mb-6"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-purple-500" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Прогноз дохода</h3>
            <p className="text-[11px] text-text-muted">
              Ожидаемые выплаты по проектам в работе. Это оценка — реальные сроки зависят от темпа сдачи.
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Всего ожидается</div>
          <div className="text-lg font-bold text-purple-500 font-mono tabular-nums">
            ${data.totals.sum.toLocaleString("ru-RU")}
          </div>
        </div>
      </div>

      <div className="h-[200px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v))}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(168, 85, 247, 0.06)" }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as { name: string; forecast: number; breakdown: { projectId: string; projectName: string; amount: number }[] };
                return (
                  <div className="rounded-lg border border-border-faint bg-surface shadow-lg p-3 min-w-[200px]">
                    <div className="text-xs font-semibold mb-1.5">{d.name}</div>
                    <div className="text-base font-bold text-purple-500 font-mono tabular-nums mb-2">
                      ${d.forecast.toLocaleString("ru-RU")}
                    </div>
                    {d.breakdown && d.breakdown.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-border-faint">
                        {d.breakdown.slice(0, 3).map((b) => (
                          <div key={b.projectId} className="flex items-center justify-between text-[11px] gap-2">
                            <span className="truncate text-text-secondary">{b.projectName}</span>
                            <span className="font-mono text-text-muted flex-shrink-0">
                              ${b.amount.toLocaleString("ru-RU")}
                            </span>
                          </div>
                        ))}
                        {d.breakdown.length > 3 && (
                          <div className="text-[10px] text-text-muted">+{d.breakdown.length - 3} проект(ов)</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="forecast" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={
                    idx === 0
                      ? "rgba(168, 85, 247, 0.95)"
                      : idx === peakIndex
                      ? "rgba(168, 85, 247, 0.7)"
                      : "rgba(168, 85, 247, 0.45)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-muted mt-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-purple-500" />
          текущий месяц
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          {data.totals.activeProjectsWithCommission} активных проект(ов)
        </span>
      </div>
    </motion.div>
  );
}
