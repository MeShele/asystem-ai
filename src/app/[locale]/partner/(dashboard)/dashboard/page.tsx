"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { Users, DollarSign, Plus, Trophy, FolderKanban, Wallet, ArrowRight, BookOpen } from "lucide-react";
import type { DashboardData } from "@/types/partner";
import { CreateProjectModal } from "@/components/partner/create-project-modal";
import { EarningsCalculator } from "@/components/partner/earnings-calculator";
import { LiveProgressBar } from "@/components/shared/live-progress-bar";
import dynamic from "next/dynamic";

interface ProjectLite {
  id: number;
  project_id: string;
  name: string;
  status: string;
  total_price: number | string;
  paid_amount: number | string;
  partner_commission_percent: number;
  progress_percent: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string | null;
  avatar_url: string | null;
  projects_count: number;
}

const EarningsChart = dynamic(() => import("@/components/partner/earnings-chart").then((m) => m.EarningsChart), { ssr: false });
const ForecastChart = dynamic(() => import("@/components/partner/forecast-chart").then((m) => m.ForecastChart), { ssr: false });

interface MilestoneData {
  key: string;
  amount: number;
  bonus: number;
  title: string;
  icon: string;
}

interface AchievementData {
  milestone_key: string;
  milestone_amount: number;
  bonus_amount: number;
  achieved_at: string;
  paid: boolean;
}

interface TierLevel {
  level: number;
  title: string;
  icon: string;
  base_pct: number;
  color: string;
  requirement: string;
}

interface TierSystem {
  levels: TierLevel[];
  currentLevel: number;
  currentMeta: TierLevel;
  nextMeta: TierLevel | null;
  progress: { percent: number; hint: string };
  baseCommission: { base: number; bonuses: { label: string; pct: number }[]; total: number };
  acceptanceStats: {
    totalDeals: number;
    dealsLast60Days: number;
    dealsLast90Days: number;
    dealsLast6Months: number;
    totalRevenue: number;
    hasT2Project: boolean;
    totalEarned: number;
  };
  daysSinceActivity: number | null;
}

interface MilestoneClaim {
  milestone_key: string;
  status: "requested" | "paid" | "rejected";
  amount: number | string;
  paid_at: string | null;
  requested_at: string | null;
  rejection_comment: string | null;
}

interface ExtendedDashboardData extends DashboardData {
  achievements: AchievementData[];
  milestones: MilestoneData[];
  currentLevel: MilestoneData | null;
  nextLevel: MilestoneData | null;
  progressPercent: number;
  monthlyEarnings: { month: string; earned: number }[];
  tierSystem: TierSystem;
  pendingPayouts: number;
  milestoneClaims: MilestoneClaim[];
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ExtendedDashboardData | null>(null);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then(setData)
      .catch(() => {
        const locale = window.location.pathname.split("/")[1] || "ru";
        window.location.href = `/${locale}/partner/login`;
      })
      .finally(() => setLoading(false));
    fetch("/api/partner/projects")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]));
    fetch("/api/partner/team")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setTeam(Array.isArray(d) ? d : []))
      .catch(() => setTeam([]));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const { partner, stats, monthlyEarnings, tierSystem } = data;
  const { currentMeta, nextMeta, progress: tierProgress, baseCommission } = tierSystem;

  const currentLocale = typeof window !== "undefined" ? window.location.pathname.split("/")[1] || "ru" : "ru";
  const refLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${currentLocale}/client/request?ref=${partner.ref_code}`;

  async function copyRef() {
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* ─── Activity counter banner (only for L3+ or visible warning) ─── */}
      {tierSystem.daysSinceActivity !== null && tierSystem.daysSinceActivity > 0 && (
        <ActivityBanner days={tierSystem.daysSinceActivity} level={tierSystem.currentLevel} />
      )}

      {/* ─── Premium Welcome with current level badge ─── */}
      <motion.div
        className="mb-6 relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-500/[0.06] to-brand-700/[0.04] p-6 lg:p-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-500/[0.06] blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-500 text-xs font-semibold">
              <span>{currentMeta.icon}</span>
              L{currentMeta.level} · {currentMeta.title}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-500 text-xs font-bold">
              {baseCommission.total}% комиссия
            </span>
            {partner.is_founding && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-semibold">
                ⭐ Founding partner +5%
              </span>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">
            Добро пожаловать, {partner.name}
          </h1>
          <p className="text-text-secondary text-sm">
            {nextMeta
              ? `До уровня ${nextMeta.icon} L${nextMeta.level} «${nextMeta.title}»: ${tierProgress.hint}`
              : "Вы достигли максимального уровня — L5 Стратегический 👑"}
          </p>
        </div>
      </motion.div>

      {/* ─── Earnings Calculator (главное мотивационное место) ─── */}
      <EarningsCalculator
        levels={tierSystem.levels}
        currentLevel={tierSystem.currentLevel}
        isFounding={Boolean(partner.is_founding)}
        retentionQualified={tierSystem.acceptanceStats.dealsLast60Days >= 3}
        partnerId={partner.partner_id}
      />

      {/* Quick links на детальные разделы */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => router.push("/partner/achievements")}
          className="flex items-center gap-3 p-4 rounded-xl border border-border-faint bg-surface hover:border-amber-500/40 hover:bg-amber-500/[0.03] transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Достижения и уровни</div>
            <div className="text-[11px] text-text-muted">Лестница L1–L5, мини-награды, прогресс</div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
        </button>
        <button
          onClick={() => router.push("/partner/knowledge")}
          className="flex items-center gap-3 p-4 rounded-xl border border-border-faint bg-surface hover:border-brand-500/40 hover:bg-brand-500/[0.03] transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">База знаний</div>
            <div className="text-[11px] text-text-muted">Презентации, шаблоны, FAQ программы</div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Общий доход",
            value: `$${stats.totalEarned.toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
            large: true,
          },
          {
            label: "Проектов",
            value: `${stats.completedClients ?? 0} / ${stats.totalClients}`,
            icon: Users,
            color: "text-brand-500",
            bg: "bg-brand-500/10",
            sub: "завершено / всего",
          },
          {
            label: "Уровень",
            value: `${currentMeta.title} · ${baseCommission.total}%`,
            icon: Trophy,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            sub: `L${currentMeta.level} · база ${currentMeta.base_pct}%`,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="p-5 rounded-xl border border-border-faint bg-surface"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-[18px] h-[18px] ${stat.color}`} />
                </div>
              </div>
              <div className={`font-bold mb-0.5 ${stat.large ? "text-3xl" : "text-2xl"}`}>
                {stat.value}
              </div>
              <div className="text-xs text-text-muted">
                {stat.sub ?? stat.label}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Прогресс по уровням и наградам — на странице /partner/achievements */}

      {/* ─── Financial overview ─── */}
      {projects.length > 0 && (
        <motion.div
          className="rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/[0.03] to-brand-500/[0.03] p-5 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-semibold">Финансы по проектам</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const totalValue = projects.reduce((s, p) => s + Number(p.total_price || 0), 0);
              const totalCommission = projects.reduce(
                (s, p) => s + Math.round((Number(p.total_price || 0) * Number(p.partner_commission_percent || 0)) / 100),
                0
              );
              const earned = data.stats.totalEarned; // actual payouts (from /api/partner/me)
              const remaining = Math.max(0, totalCommission - earned);
              return (
                <>
                  <FinanceCell label="Объём проектов" value={`$${totalValue.toLocaleString("ru-RU")}`} color="text-text-primary" />
                  <FinanceCell label="Ваша комиссия (всего)" value={`$${totalCommission.toLocaleString("ru-RU")}`} color="text-purple-500" sub="по полным суммам" />
                  <FinanceCell label="Выплачено вам" value={`$${earned.toLocaleString("ru-RU")}`} color="text-green-500" sub="фактически" />
                  <FinanceCell label="Ожидается" value={`$${remaining.toLocaleString("ru-RU")}`} color="text-orange-500" sub="остаток к выплате" />
                </>
              );
            })()}
          </div>
        </motion.div>
      )}

      {/* ─── Active projects ─── */}
      {projects.length > 0 && (
        <motion.div
          className="rounded-xl border border-border-faint bg-surface p-5 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold">Ваши проекты</h3>
            </div>
            <button
              onClick={() => router.push("/partner/projects")}
              className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1"
            >
              Все <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((p) => {
              const potential = Math.round((Number(p.total_price || 0) * Number(p.partner_commission_percent || 0)) / 100);
              return (
                <button
                  key={p.project_id}
                  onClick={() => router.push(`/partner/projects/${p.project_id}`)}
                  className="w-full text-left p-3 rounded-lg border border-border-faint hover:bg-surface-raised transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    <span className="text-xs font-mono text-green-500/80 flex-shrink-0">
                      ~${potential.toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <LiveProgressBar value={p.progress_percent} tone={p.status === "completed" ? "green" : "brand"} live={p.status !== "completed" && p.status !== "cancelled"} height="h-1.5" />
                    </div>
                    <span className="text-[11px] font-mono text-text-muted w-10 text-right">{p.progress_percent}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ─── Team ─── */}
      {team.length > 0 && (
        <motion.div
          className="rounded-xl border border-border-faint bg-surface p-5 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold">Команда, с которой вы работаете</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {team.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-faint">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {m.avatar_url ? (
                    <Image src={m.avatar_url} alt={m.name} width={40} height={40} unoptimized className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-sm font-bold text-purple-400">{m.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  {m.role && <div className="text-[11px] text-text-muted truncate">{m.role}</div>}
                  <div className="text-[10px] text-brand-500 font-mono">
                    {m.projects_count} {Number(m.projects_count) === 1 ? "проект" : "проектов"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Earnings Chart ─── */}
      <motion.div
        className="p-5 rounded-xl border border-border-faint bg-surface mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Заработок по месяцам</div>
            <p className="text-[11px] text-text-muted mt-0.5">Только фактические выплаты со статусом «Оплачено» — последние 6 месяцев</p>
          </div>
        </div>
        <div className="h-[320px]">
          <EarningsChart data={monthlyEarnings} />
        </div>
      </motion.div>

      {/* ─── Forecast chart ─── */}
      <ForecastChart />

      {/* ─── Create project CTA ─── */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full p-5 rounded-xl border-2 border-dashed border-brand-500/30 bg-brand-500/[0.03] hover:bg-brand-500/[0.06] hover:border-brand-500/50 transition-all text-center group flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 text-brand-500" />
          <span className="text-brand-500 font-semibold text-sm group-hover:underline">Создать проект</span>
        </button>
      </motion.div>

      {showCreateForm && (
        <CreateProjectModal
          onClose={() => setShowCreateForm(false)}
          onCreated={() => { setShowCreateForm(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}

function ActivityBanner({ days, level }: { days: number; level: number }) {
  const max = 60;
  const remaining = Math.max(0, max - days);
  const pct = Math.min(100, (days / max) * 100);

  let tone: "green" | "yellow" | "red" = "green";
  let title = "";
  let subtitle = "";

  if (days < 30) {
    tone = "green";
    title = `Активный ритм — ${days} ${days === 1 ? "день" : "дней"} с последней сделки`;
    subtitle = level > 1
      ? `На уровне L${level}. Продолжайте приводить клиентов — следующий уровень даст больше %.`
      : "Каждая новая сделка приближает вас к L2 (14%). Продолжайте.";
  } else if (days < 50) {
    tone = "yellow";
    title = `${days} дней без новой сделки · ещё ${remaining} ${remaining === 1 ? "день" : "дней"} до штрафа`;
    subtitle = level > 1
      ? `Если 60 дней без сделок — уровень понизится с L${level} до L${level - 1} (−5% к будущим проектам).`
      : "Чем чаще сделки — тем выше уровень и базовая комиссия.";
  } else if (days < 60) {
    tone = "red";
    title = `⚠️ ${days} дней без сделки · только ${remaining} ${remaining === 1 ? "день" : "дней"} до понижения уровня`;
    subtitle = level > 1
      ? `Срочно проведите сделку! Иначе уровень упадёт с L${level} до L${level - 1} и будущие проекты потеряют 5%.`
      : "Без сделок ваш уровень не растёт.";
  } else {
    tone = "red";
    title = `${days} дней без активности — уровень будет понижен`;
    subtitle = level > 1
      ? `При следующем входе уровень автоматически опустится с L${level} до L${level - 1}. Старые проекты остаются на своих %, новые получат пониженную ставку.`
      : "Вы на L1. Дальше понижать некуда — но без сделок не вырасти.";
  }

  const bg = tone === "green" ? "border-green-500/30 bg-green-500/[0.04]" : tone === "yellow" ? "border-yellow-500/40 bg-yellow-500/5" : "border-red-500/40 bg-red-500/5";
  const text = tone === "green" ? "text-green-600" : tone === "yellow" ? "text-yellow-600" : "text-red-500";
  const barTone: "green" | "yellow" | "red" = tone;

  return (
    <motion.div
      className={`mb-4 p-4 rounded-xl border ${bg}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`text-sm font-semibold ${text}`}>{title}</div>
        <div className={`text-[11px] font-mono ${text}`}>
          {days} / {max} дней
        </div>
      </div>
      <LiveProgressBar value={pct} tone={barTone} variant="solid" height="h-1.5" className="mb-2" />
      <p className="text-xs text-text-secondary">{subtitle}</p>
    </motion.div>
  );
}

function FinanceCell({
  label,
  value,
  color,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  sub?: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-text-muted mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>}
    </div>
  );
}
