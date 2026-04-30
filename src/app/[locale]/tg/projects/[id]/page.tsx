"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { LiveProgressBar } from "@/components/shared/live-progress-bar";
import { ProjectComments } from "@/components/shared/project-comments";

interface ProjectDetail {
  project_id: string;
  name: string;
  description: string | null;
  total_price: number | string;
  paid_amount: number | string;
  progress_percent: number;
  status: string;
  partner_commission_percent: number;
  contract_signed_at?: string | null;
}

interface Stage {
  id: number;
  order_index: number;
  title: string;
  percent: number;
  comment: string | null;
  completed: boolean;
}

export default function TgProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/partner/projects/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setProject(d.project || null);
          setStages(Array.isArray(d.stages) ? d.stages : []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="p-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-text-muted">
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <p className="text-text-muted text-sm mt-4">Проект не найден</p>
      </div>
    );
  }

  const total = Number(project.total_price || 0);
  const paid = Number(project.paid_amount || 0);
  const myCommission = Math.round((total * project.partner_commission_percent) / 100);

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-text-muted">
        <ArrowLeft className="w-4 h-4" /> Назад
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <FolderKanban className="w-5 h-5 text-brand-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold mb-0.5 truncate">{project.name}</h1>
            <div className="text-[11px] text-text-muted font-mono">{project.project_id}</div>
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-text-secondary leading-relaxed mb-3">{project.description}</p>
        )}
      </motion.div>

      {/* Контракт */}
      <div className={`p-3 rounded-xl border flex items-center gap-2 ${
        project.contract_signed_at ? "border-green-500/30 bg-green-500/[0.04]" : "border-amber-500/30 bg-amber-500/[0.04]"
      }`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          project.contract_signed_at ? "bg-green-500/15" : "bg-amber-500/15"
        }`}>
          {project.contract_signed_at ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-500" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-500" fill="none">
              <path d="M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="text-xs leading-snug">
          <div className={`font-semibold ${project.contract_signed_at ? "text-green-600" : "text-amber-600"}`}>
            {project.contract_signed_at ? "Сделка засчитана" : "Ожидает подтверждения"}
          </div>
          <div className="text-[10px] text-text-muted">
            {project.contract_signed_at
              ? new Date(project.contract_signed_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })
              : "Админ ещё не подтвердил подписание"}
          </div>
        </div>
      </div>

      {/* Money */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl border border-border-faint bg-surface">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Стоимость</div>
          <div className="text-base font-bold font-mono tabular-nums">${total.toLocaleString("ru-RU")}</div>
        </div>
        <div className="p-3 rounded-xl border border-green-500/25 bg-green-500/[0.04]">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">Моя комиссия</div>
          <div className="text-base font-bold font-mono tabular-nums text-green-600">
            ${myCommission.toLocaleString("ru-RU")}
          </div>
          <div className="text-[10px] text-text-muted">{project.partner_commission_percent}%</div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4 rounded-xl border border-border-faint bg-surface">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Общий прогресс</span>
          <span className="text-base font-bold text-brand-500 font-mono">{project.progress_percent}%</span>
        </div>
        <LiveProgressBar
          value={project.progress_percent}
          tone={project.status === "completed" ? "green" : "brand"}
          live={project.status !== "completed" && project.status !== "cancelled"}
          height="h-2"
        />
        <div className="text-[10px] text-text-muted mt-2">
          Оплачено: <span className="font-mono">${paid.toLocaleString("ru-RU")}</span> из ${total.toLocaleString("ru-RU")}
        </div>
      </div>

      {/* Stages */}
      {stages.length > 0 && (
        <div className="rounded-xl border border-border-faint bg-surface p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Этапы</h3>
          <div className="space-y-2">
            {stages.map((s, i) => (
              <div key={s.id} className="p-3 rounded-lg bg-bg-secondary/30 border border-border-faint">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-text-muted">{i + 1}</span>
                  <span className="text-sm font-medium flex-1 truncate">{s.title}</span>
                  <span className="text-xs font-mono font-semibold text-text-secondary">{s.percent}%</span>
                </div>
                <LiveProgressBar value={s.percent} tone={s.completed ? "green" : "brand"} live={!s.completed} height="h-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <ProjectComments projectId={project.project_id} />
    </div>
  );
}
