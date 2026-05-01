"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { FolderKanban, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { LiveProgressBar } from "@/components/shared/live-progress-bar";

interface ClientMe {
  name: string;
  email: string;
}

interface ClientProject {
  project_id: string;
  name: string;
  status: string;
  progress_percent: number;
  total_price: number | string;
  paid_amount: number | string;
}

const STATUS_LABEL: Record<string, { label: string; tone: string; bg: string }> = {
  planning: { label: "Планирование", tone: "text-blue-500", bg: "bg-blue-500/10" },
  active: { label: "В работе", tone: "text-brand-500", bg: "bg-brand-500/10" },
  review: { label: "Проверка", tone: "text-orange-500", bg: "bg-orange-500/10" },
  completed: { label: "Готов", tone: "text-green-500", bg: "bg-green-500/10" },
  paused: { label: "Пауза", tone: "text-yellow-500", bg: "bg-yellow-500/10" },
  cancelled: { label: "Отмена", tone: "text-red-500", bg: "bg-red-500/10" },
};

export default function TgClientDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<ClientMe | null>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/client/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/client/projects").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([m, p]) => {
        setMe(m?.client || null);
        setProjects(Array.isArray(p) ? p : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !me) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const active = projects.filter((p) => p.status === "active" || p.status === "review");
  const totalPaid = projects.reduce((s, p) => s + Number(p.paid_amount || 0), 0);
  const totalValue = projects.reduce((s, p) => s + Number(p.total_price || 0), 0);

  return (
    <div className="p-4 space-y-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs text-text-muted">Здравствуйте,</div>
        <div className="text-xl font-bold tracking-tight truncate">{me.name}</div>
      </motion.div>

      {/* Hero card */}
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-5 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="text-xs uppercase tracking-wider opacity-85 mb-1">Ваши проекты</div>
          <div className="text-3xl font-extrabold font-mono tabular-nums">{projects.length}</div>
          {totalValue > 0 && (
            <div className="mt-2 text-[12px] opacity-90">
              Стоимость: ${totalValue.toLocaleString("ru-RU")} · оплачено ${totalPaid.toLocaleString("ru-RU")}
            </div>
          )}
        </div>
      </motion.div>

      {/* KPI mini */}
      <motion.div
        className="grid grid-cols-3 gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <MiniKpi icon={FolderKanban} label="Всего" value={String(projects.length)} tone="brand" />
        <MiniKpi icon={Clock} label="В работе" value={String(active.length)} tone="amber" />
        <MiniKpi icon={CheckCircle2} label="Готовых" value={String(projects.filter((p) => p.status === "completed").length)} tone="green" />
      </motion.div>

      {/* Active projects */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Проекты в работе</h3>
          {projects.length > active.length && (
            <button onClick={() => router.push("/tg/client/projects" as never)} className="text-[11px] text-brand-500">
              все ({projects.length})
            </button>
          )}
        </div>
        {projects.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border-faint text-center">
            <FolderKanban className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-xs text-text-muted">
              Пока нет проектов. Они появятся когда команда привяжет вас к проекту.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {(active.length > 0 ? active : projects).slice(0, 6).map((p) => {
              const s = STATUS_LABEL[p.status] || STATUS_LABEL.planning;
              return (
                <button
                  key={p.project_id}
                  onClick={() => router.push(`/tg/client/projects/${p.project_id}` as never)}
                  className="w-full text-left p-3 rounded-xl border border-border-faint bg-surface active:bg-bg-secondary transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold truncate flex-1">{p.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-2 ${s.bg} ${s.tone} flex-shrink-0`}>
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <LiveProgressBar value={p.progress_percent} tone="brand" height="h-1" live={p.status !== "completed"} />
                    </div>
                    <span className="text-[10px] font-mono text-text-muted w-9 text-right">{p.progress_percent}%</span>
                    <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MiniKpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string;
  tone: "brand" | "amber" | "green";
}) {
  const toneText: Record<string, string> = {
    brand: "text-brand-500",
    amber: "text-amber-500",
    green: "text-green-500",
  };
  const toneBg: Record<string, string> = {
    brand: "bg-brand-500/10",
    amber: "bg-amber-500/10",
    green: "bg-green-500/10",
  };
  return (
    <div className="rounded-xl border border-border-faint bg-surface p-3">
      <div className={`w-6 h-6 rounded-md ${toneBg[tone]} flex items-center justify-center mb-1.5`}>
        <Icon className={`w-3.5 h-3.5 ${toneText[tone]}`} strokeWidth={2.4} />
      </div>
      <div className="text-base font-bold font-mono tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-text-muted mt-0.5">{label}</div>
    </div>
  );
}
