"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, FolderKanban, Check, Lock, Users } from "lucide-react";
import { ProjectComments } from "@/components/shared/project-comments";

interface Developer {
  id: number;
  name: string;
  role: string | null;
  avatar_url: string | null;
}

interface ProjectDetail {
  id: number;
  project_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  total_price: number | string;
  paid_amount: number | string;
  progress_percent: number;
  status: string;
  partner_name?: string | null;
  partner_company?: string | null;
}

interface Stage {
  id: number;
  order_index: number;
  title: string;
  percent: number;
  comment: string | null;
  completed: boolean;
}

const statusMeta: Record<string, { label: string; color: string }> = {
  planning: { label: "Планирование", color: "bg-blue-500/10 text-blue-400" },
  active: { label: "В работе", color: "bg-brand-500/10 text-brand-500" },
  review: { label: "На проверке", color: "bg-orange-500/10 text-orange-500" },
  completed: { label: "Завершён", color: "bg-green-500/10 text-green-500" },
  paused: { label: "На паузе", color: "bg-yellow-500/10 text-yellow-500" },
  cancelled: { label: "Отменён", color: "bg-red-500/10 text-red-500" },
};

export default function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/client/projects/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setProject(d.project || null);
        setStages(Array.isArray(d.stages) ? d.stages : []);
        setDevelopers(Array.isArray(d.developers) ? d.developers : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center">
        <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="p-8">
        <button onClick={() => router.push("/client/projects")} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <p className="text-text-muted">Проект не найден</p>
      </div>
    );
  }

  const total = Number(project.total_price || 0);
  const paid = Number(project.paid_amount || 0);
  const remaining = Math.max(0, total - paid);
  const paidPct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const status = statusMeta[project.status] || statusMeta.planning;

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <button
        onClick={() => router.push("/client/projects")}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> К проектам
      </button>

      <div className="rounded-2xl border border-border-faint bg-surface p-6 lg:p-8 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {project.logo_url ? (
              <Image src={project.logo_url} alt={project.name} width={64} height={64} unoptimized className="object-cover w-full h-full" />
            ) : (
              <FolderKanban className="w-7 h-7 text-text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
            </div>
            <div className="font-mono text-xs text-text-muted">{project.project_id}</div>
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="text-xs text-text-muted mb-1">Стоимость</div>
          <div className="text-xl font-semibold">${total.toLocaleString("ru-RU")}</div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="text-xs text-text-muted mb-1">Оплачено</div>
          <div className="text-xl font-semibold text-green-500">${paid.toLocaleString("ru-RU")}</div>
          <div className="mt-2 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${paidPct}%` }} />
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border-faint bg-surface">
          <div className="text-xs text-text-muted mb-1">Остаток</div>
          <div className="text-xl font-semibold text-orange-500">${remaining.toLocaleString("ru-RU")}</div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="p-5 rounded-xl border border-border-faint bg-surface mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Общий прогресс</h3>
          <span className="font-mono text-xl font-bold text-brand-500">{project.progress_percent}%</span>
        </div>
        <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${project.progress_percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stages */}
      {stages.length > 0 && (
        <div className="rounded-xl border border-border-faint bg-surface p-5 lg:p-6 mb-6">
          <h3 className="text-sm font-semibold mb-4">Этапы проекта</h3>
          <div className="space-y-3">
            {stages.map((s, i) => {
              const isActive = activeStage === s.id;
              return (
                <motion.div
                  key={s.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive ? "border-brand-500/40 bg-brand-500/5" : "border-border-faint hover:bg-bg-secondary/40"
                  }`}
                  onClick={() => setActiveStage(isActive ? null : s.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        s.completed ? "bg-green-500/20 text-green-500" : "bg-bg-secondary text-text-muted"
                      }`}
                    >
                      {s.completed ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        <span className="text-text-muted mr-2">{i + 1}.</span>
                        {s.title}
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold text-text-secondary flex-shrink-0">{s.percent}%</span>
                  </div>
                  <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.completed ? "bg-gradient-to-r from-green-500 to-green-400" : "bg-gradient-to-r from-brand-500 to-brand-400"
                      }`}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                  {isActive && s.comment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 pt-3 border-t border-border-faint text-xs text-text-secondary leading-relaxed whitespace-pre-line"
                    >
                      {s.comment}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team */}
      {developers.length > 0 && (
        <div className="rounded-xl border border-border-faint bg-surface p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold">Команда проекта</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {developers.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-faint">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {d.avatar_url ? (
                    <Image src={d.avatar_url} alt={d.name} width={40} height={40} unoptimized className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-sm font-bold text-purple-400">{d.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  {d.role && <div className="text-[11px] text-text-muted truncate">{d.role}</div>}
                </div>
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
