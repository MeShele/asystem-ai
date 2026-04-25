"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  FolderKanban,
  Check,
  Lock,
  Users,
  TrendingUp,
  Wallet,
  Calendar,
} from "lucide-react";

interface Developer {
  id?: number;
  name: string;
  role?: string | null;
  avatar_url?: string | null;
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
  partner_commission_percent: number;
  created_at: string;
}

interface Stage {
  id: number;
  order_index: number;
  title: string;
  percent: number;
  comment: string | null;
  completed: boolean;
}

interface Payout {
  id: number;
  amount: number | string;
  paid_at: string;
  comment: string | null;
}

const statusMeta: Record<string, { label: string; color: string }> = {
  planning: { label: "Планирование", color: "bg-blue-500/10 text-blue-400" },
  active: { label: "В работе", color: "bg-brand-500/10 text-brand-500" },
  review: { label: "На проверке", color: "bg-orange-500/10 text-orange-500" },
  completed: { label: "Завершён", color: "bg-green-500/10 text-green-500" },
  paused: { label: "На паузе", color: "bg-yellow-500/10 text-yellow-500" },
  cancelled: { label: "Отменён", color: "bg-red-500/10 text-red-500" },
};

export default function PartnerProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/partner/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data.project || null);
        setStages(Array.isArray(data.stages) ? data.stages : []);
        setDevelopers(Array.isArray(data.developers) ? data.developers : []);
        setPayouts(Array.isArray(data.payouts) ? data.payouts : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center">
        <Clock className="w-8 h-8 text-text-muted mx-auto mb-3 animate-spin" />
        <p className="text-text-muted text-sm">Загрузка...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push("/partner/projects")}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <p className="text-text-muted">Проект не найден или не привязан к вашему аккаунту</p>
      </div>
    );
  }

  const total = Number(project.total_price || 0);
  const paid = Number(project.paid_amount || 0);
  const remaining = Math.max(0, total - paid);
  const paidPct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const commissionPct = Number(project.partner_commission_percent || 0);
  const commissionAmount = Math.round((total * commissionPct) / 100);
  const totalPaidOut = payouts.reduce((s, p) => s + Number(p.amount || 0), 0);
  const commissionRemaining = Math.max(0, commissionAmount - totalPaidOut);
  const status = statusMeta[project.status] || statusMeta.planning;
  const activeStageData = activeStage != null ? stages.find((s) => s.id === activeStage) : null;

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <button
        onClick={() => router.push("/partner/projects")}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> К проектам
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-border-faint bg-surface p-6 lg:p-8 mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
            {project.logo_url ? (
              <Image
                src={project.logo_url}
                alt={project.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <FolderKanban className="w-7 h-7 text-text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div className="font-mono text-xs text-text-muted">{project.project_id}</div>
          </div>
        </div>
        {project.description && (
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        )}
      </div>

      {/* Money */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

      {/* Partner commission */}
      {commissionPct > 0 && (
        <div className="p-5 rounded-xl border border-green-500/30 bg-green-500/5 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <h3 className="text-sm font-semibold">Ваше вознаграждение по проекту</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 text-xs font-mono font-semibold">
              {commissionPct}%
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">К получению (всего)</div>
              <div className="text-2xl font-bold text-text-primary">
                ${commissionAmount.toLocaleString("ru-RU")}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">от полной стоимости</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">Выплачено вам</div>
              <div className="text-2xl font-bold text-green-500">
                ${totalPaidOut.toLocaleString("ru-RU")}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">{payouts.length} {payouts.length === 1 ? "выплата" : "выплат"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">Ожидается</div>
              <div className="text-2xl font-bold text-orange-500">
                ${commissionRemaining.toLocaleString("ru-RU")}
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">остаток к выплате</div>
            </div>
          </div>
        </div>
      )}

      {/* Payouts history */}
      {payouts.length > 0 && (
        <div className="p-5 rounded-xl border border-border-faint bg-surface mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-semibold">История выплат</h3>
          </div>
          <div className="space-y-2">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-faint">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-green-500">
                    +${Number(p.amount).toLocaleString("ru-RU")}
                  </div>
                  {p.comment && <div className="text-xs text-text-muted truncate">{p.comment}</div>}
                </div>
                <div className="text-xs text-text-muted flex items-center gap-1 flex-shrink-0">
                  <Calendar className="w-3 h-3" />
                  {new Date(p.paid_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall progress */}
      <div className="p-5 rounded-xl border border-border-faint bg-surface mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Общий прогресс</h3>
          <span className="font-mono text-xl font-bold text-brand-500">
            {project.progress_percent}%
          </span>
        </div>
        <div className="relative h-3 bg-bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${project.progress_percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-30"
            style={{
              width: `${project.progress_percent}%`,
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              animation: "shimmer-sweep 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* Stages — interactive timeline */}
      {stages.length > 0 && (
        <div className="rounded-xl border border-border-faint bg-surface p-5 lg:p-6 mb-6">
          <h3 className="text-sm font-semibold mb-5">Этапы проекта</h3>

          {/* Horizontal timeline */}
          <div className="relative mb-5">
            <div className="absolute left-0 right-0 top-4 h-1 bg-bg-secondary rounded-full" />
            <div className="relative flex justify-between">
              {stages.map((s, i) => {
                const isActive = activeStage === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStage(isActive ? null : s.id)}
                    className="flex flex-col items-center group flex-1 min-w-0"
                  >
                    <div
                      className={`relative w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        s.completed
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? "bg-brand-500 border-brand-500 text-white scale-110"
                          : "bg-surface border-border-faint text-text-muted group-hover:border-brand-500/50"
                      }`}
                    >
                      {s.completed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div className="mt-2 text-[10px] text-text-muted text-center px-1 truncate max-w-full">
                      {s.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stage list with progress bars */}
          <div className="space-y-3">
            {stages.map((s, i) => {
              const isActive = activeStage === s.id;
              return (
                <motion.div
                  key={s.id}
                  initial={false}
                  animate={{ backgroundColor: isActive ? "rgba(34,197,94,0.04)" : "transparent" }}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isActive ? "border-brand-500/40" : "border-border-faint hover:border-border-faint/80"
                  }`}
                  onClick={() => setActiveStage(isActive ? null : s.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        s.completed
                          ? "bg-green-500/20 text-green-500"
                          : "bg-bg-secondary text-text-muted"
                      }`}
                    >
                      {s.completed ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.title}</div>
                    </div>
                    <span className="font-mono text-sm font-semibold text-text-secondary flex-shrink-0">
                      {s.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.percent}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        s.completed
                          ? "bg-gradient-to-r from-green-500 to-green-400"
                          : "bg-gradient-to-r from-brand-500 to-brand-400"
                      }`}
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

          {activeStageData?.comment && (
            <p className="text-[11px] text-text-muted mt-4">
              💡 Кликните на этап выше, чтобы увидеть комментарий администратора
            </p>
          )}
        </div>
      )}

      {/* Developers */}
      {developers.length > 0 && (
        <div className="rounded-xl border border-border-faint bg-surface p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold">Команда проекта</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {developers.map((d, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-border-faint"
              >
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {d.avatar_url ? (
                    <Image
                      src={d.avatar_url}
                      alt={d.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-sm font-bold text-purple-400">
                      {(d.name || "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  {d.role && (
                    <div className="text-xs text-text-muted truncate">{d.role}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
