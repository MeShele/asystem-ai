"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { FolderKanban, ChevronRight } from "lucide-react";
import { LiveProgressBar } from "@/components/shared/live-progress-bar";

interface ProjectLite {
  project_id: string;
  name: string;
  status: string;
  progress_percent: number;
  total_price: number | string;
  partner_commission_percent: number;
}

const STATUS_LABEL: Record<string, { label: string; tone: string; bg: string }> = {
  planning: { label: "План", tone: "text-blue-500", bg: "bg-blue-500/10" },
  active: { label: "В работе", tone: "text-brand-500", bg: "bg-brand-500/10" },
  review: { label: "Проверка", tone: "text-orange-500", bg: "bg-orange-500/10" },
  completed: { label: "Готов", tone: "text-green-500", bg: "bg-green-500/10" },
  paused: { label: "Пауза", tone: "text-yellow-500", bg: "bg-yellow-500/10" },
  cancelled: { label: "Отмена", tone: "text-red-500", bg: "bg-red-500/10" },
};

export default function TgProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/projects")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Проекты</h1>

      {projects.length === 0 ? (
        <div className="p-10 rounded-xl border border-dashed border-border-faint text-center">
          <FolderKanban className="w-10 h-10 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">Пока нет проектов</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p, i) => {
            const s = STATUS_LABEL[p.status] || STATUS_LABEL.planning;
            const total = Number(p.total_price || 0);
            const potential = Math.round((total * Number(p.partner_commission_percent || 0)) / 100);
            return (
              <motion.button
                key={p.project_id}
                onClick={() => router.push(`/tg/projects/${p.project_id}` as never)}
                className="w-full text-left p-4 rounded-xl border border-border-faint bg-surface active:bg-bg-secondary transition-colors"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.bg} ${s.tone}`}>
                        {s.label}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">{p.project_id}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] uppercase text-text-muted tracking-wider">~доход</div>
                    <div className="text-sm font-mono font-bold text-green-600">${potential.toLocaleString("ru-RU")}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <LiveProgressBar
                      value={p.progress_percent}
                      tone={p.status === "completed" ? "green" : "brand"}
                      live={p.status !== "completed" && p.status !== "cancelled"}
                      height="h-1"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-text-muted w-9 text-right">{p.progress_percent}%</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
