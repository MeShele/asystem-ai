"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Award,
  Lock,
  DollarSign,
  Target,
  ArrowUpRight,
  Flame,
  Repeat,
  Sparkles,
  Network,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { LevelIcon, MilestoneIcon } from "@/components/shared/level-icon";
import { LiveProgressBar } from "@/components/shared/live-progress-bar";

interface TierLevel {
  level: number;
  title: string;
  base_pct: number;
  requirement: string;
}

interface AcceptanceStats {
  totalDeals: number;
  dealsLast60Days: number;
  dealsLast90Days: number;
  dealsLast6Months: number;
  totalRevenue: number;
  hasT2Project: boolean;
  totalEarned: number;
}

interface MilestoneClaim {
  milestone_key: string;
  status: "requested" | "paid" | "rejected";
  amount: number | string;
  rejection_comment: string | null;
}

interface NetworkSummary {
  totalSubs: number;
  activeSubs: number;
  overrideTotal: number;
  overridePaid: number;
  subRevenue: number;
}

interface ApiData {
  partner: { name: string; partner_id: string; is_founding: boolean };
  stats: { totalEarned: number; totalClients: number; completedClients?: number };
  tierSystem: {
    levels: TierLevel[];
    currentLevel: number;
    currentMeta: TierLevel;
    nextMeta: TierLevel | null;
    progress: { percent: number; hint: string };
    baseCommission: { base: number; bonuses: { label: string; pct: number }[]; total: number };
    acceptanceStats: AcceptanceStats;
  };
  milestoneClaims?: MilestoneClaim[];
  network?: NetworkSummary;
}

const MINI_REWARDS = [
  { key: "5k" as const, threshold: 5000, reward: 500, title: "Первая пятёрка" },
  { key: "10k" as const, threshold: 10000, reward: 1000, title: "Десятка" },
  { key: "20k" as const, threshold: 20000, reward: 2000, title: "Двадцатка" },
];

/**
 * Мотивационная подсказка «что сделать чтобы вырасти».
 * Возвращает action + остаток / null если на максимуме.
 */
function nextStepHint(stats: AcceptanceStats, currentLevel: number): { action: string; emphasis: string } | null {
  if (currentLevel >= 5) return null;
  if (currentLevel === 1) {
    const need = Math.max(0, 2 - stats.dealsLast90Days);
    return need > 0
      ? {
          emphasis: `${need} ${need === 1 ? "сделка" : need < 5 ? "сделки" : "сделок"} за 90 дней`,
          action: "до уровня L2 «Активный» — 20% базы вместо 15%",
        }
      : { emphasis: "Условие выполнено", action: "уровень обновится при следующем входе" };
  }
  if (currentLevel === 2) {
    if (!stats.hasT2Project && stats.totalDeals < 5) {
      const need = 5 - stats.totalDeals;
      return {
        emphasis: `${need} ${need === 1 ? "сделка" : "сделок"} или 1 проект $30K+`,
        action: "до L3 «Эксклюзив» — 25% базы + ниша становится твоей",
      };
    }
    return { emphasis: "Условие выполнено", action: "L3 откроется при следующем входе" };
  }
  if (currentLevel === 3) {
    const dealsRemain = Math.max(0, 10 - stats.dealsLast6Months);
    const revRemain = Math.max(0, 50_000 - stats.totalRevenue);
    if (dealsRemain > 0 && revRemain > 0) {
      return {
        emphasis: `${dealsRemain} ${dealsRemain === 1 ? "сделка" : "сделок"} за полгода или ещё $${revRemain.toLocaleString("ru-RU")} выручки`,
        action: "до L4 «Лидер ниши» — 30% базы",
      };
    }
    return { emphasis: "Условие выполнено", action: "L4 откроется при следующем входе" };
  }
  if (currentLevel === 4) {
    const dealsRemain = Math.max(0, 20 - stats.totalDeals);
    const revRemain = Math.max(0, 200_000 - stats.totalRevenue);
    return {
      emphasis: `${dealsRemain} ${dealsRemain === 1 ? "сделка" : "сделок"} или ещё $${revRemain.toLocaleString("ru-RU")} выручки`,
      action: "до L5 «Стратегический» — 40% базы и приватные апдейты",
    };
  }
  return null;
}

export default function PartnerAchievementsPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const { tierSystem, milestoneClaims = [] } = data;
  const { levels, currentLevel, currentMeta, nextMeta, progress, acceptanceStats } = tierSystem;
  const earned = acceptanceStats.totalEarned;
  const next = nextStepHint(acceptanceStats, currentLevel);

  const claimMilestone = async (key: string) => {
    if (!confirm("Запросить награду? Админ получит уведомление и оплатит.")) return;
    const res = await fetch("/api/partner/milestones/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestone_key: key }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Не удалось запросить награду");
    }
  };

  // Sales за 60 дней — для retention-condition
  const retentionRemain = Math.max(0, 3 - acceptanceStats.dealsLast60Days);

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header — компактный */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight">Достижения</h1>
        </div>
        <p className="text-sm text-text-muted">Уровни, награды и ваш путь по партнёрской программе</p>
      </motion.div>

      {/* ─── 4 KPI на самом верху ─── */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <KpiCell
          label="Заработано"
          value={`$${earned.toLocaleString("ru-RU")}`}
          icon={DollarSign}
          tone="green"
          big
        />
        <KpiCell
          label="Сделок всего"
          value={String(acceptanceStats.totalDeals)}
          icon={Target}
          tone="brand"
        />
        <KpiCell
          label="Выручка"
          value={`$${acceptanceStats.totalRevenue.toLocaleString("ru-RU")}`}
          icon={TrendingUp}
          tone="purple"
        />
        <KpiCell
          label={`Уровень ${currentMeta.title}`}
          value={`${currentMeta.base_pct}%`}
          icon={Trophy}
          tone="amber"
          subtitle={`L${currentMeta.level} · база`}
        />
      </motion.div>

      {/* ─── Мотивационный CTA «Сделайте ещё X» ─── */}
      {next && nextMeta && (
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-r from-brand-500/[0.06] via-brand-500/[0.03] to-transparent p-5 mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
          <div className="relative flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-500/25">
              <ArrowUpRight className="w-5 h-5 text-white" strokeWidth={2.4} />
            </div>
            <div className="flex-1 min-w-[260px]">
              <div className="text-[10px] font-semibold text-brand-500 uppercase tracking-[0.12em] mb-1">
                Следующий шаг
              </div>
              <div className="text-base lg:text-lg font-semibold mb-1 leading-snug">
                Сделайте <span className="text-brand-500">{next.emphasis}</span>
              </div>
              <p className="text-sm text-text-secondary mb-3">{next.action}</p>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span className="text-[11px] text-text-muted">
                  Прогресс L{currentMeta.level} → L{nextMeta.level}
                </span>
                <span className="font-mono text-xs font-bold text-brand-500">{Math.round(progress.percent)}%</span>
              </div>
              <LiveProgressBar value={progress.percent} tone="brand" height="h-1.5" />
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Retention-условие и founding-бейдж (если применимо) ─── */}
      {(acceptanceStats.dealsLast60Days < 3 || data.partner.is_founding) && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          {retentionRemain > 0 ? (
            <HintCard
              icon={Repeat}
              tone="green"
              title={`Ещё ${retentionRemain} ${retentionRemain === 1 ? "сделка" : "сделки"} за 60 дней`}
              hint={`Откроет +5% retention-бонус и продлит эксклюзив на 12 месяцев. Сейчас: ${acceptanceStats.dealsLast60Days}/3.`}
            />
          ) : (
            <HintCard
              icon={Repeat}
              tone="green"
              title="Retention-бонус активен"
              hint="3 сделки за 60 дней — комиссия +5%, эксклюзив продлевается автоматически."
              done
            />
          )}
          {data.partner.is_founding && (
            <HintCard
              icon={Sparkles}
              tone="amber"
              title="Founding partner навсегда"
              hint="Один из первых 5 партнёров. +5% к комиссии на все будущие проекты, навсегда."
              done
            />
          )}
        </motion.div>
      )}

      {/* ─── Лестница уровней — горизонтально, 5 в ряд ─── */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Лестница уровней</h3>
          <span className="text-[11px] text-text-muted font-mono">L1 → L5 · больше сделок = выше %</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {levels.map((lvl) => {
            const isCurrent = lvl.level === currentLevel;
            const isPassed = lvl.level < currentLevel;
            const isFuture = lvl.level > currentLevel;
            return (
              <div
                key={lvl.level}
                className={`relative p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? "border-brand-500 bg-brand-500/[0.06] shadow-md shadow-brand-500/10"
                    : isPassed
                    ? "border-green-500/30 bg-green-500/[0.04]"
                    : "border-border-faint bg-surface"
                }`}
              >
                {isPassed && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/40">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
                <div className="flex justify-center mb-2">
                  <LevelIcon level={lvl.level} size="md" active={isCurrent} passed={isPassed} />
                </div>
                <div className="text-[9px] font-mono text-text-muted">L{lvl.level}</div>
                <div className={`text-xs font-semibold leading-tight mt-0.5 ${isFuture ? "text-text-secondary" : ""}`}>
                  {lvl.title}
                </div>
                <div className={`text-base font-bold mt-1 ${isCurrent ? "text-brand-500" : isPassed ? "text-green-500" : "text-text-muted"}`}>
                  {lvl.base_pct}%
                </div>
              </div>
            );
          })}
        </div>
        {/* Краткое требование текущего уровня */}
        <div className="mt-3 flex items-start gap-2 px-1">
          <span className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">Сейчас:</span>
          <p className="text-xs text-text-secondary leading-relaxed">{currentMeta.requirement}</p>
        </div>
      </motion.section>

      {/* ─── Мини-награды ─── */}
      <motion.section
        className="mb-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Мини-награды</h3>
          </div>
          <span className="text-[11px] text-text-muted">10% бонус при достижении порога</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MINI_REWARDS.map((m, i) => {
            const claim = milestoneClaims.find((c) => c.milestone_key === m.key);
            const eligible = earned >= m.threshold;
            const status = claim?.status;
            const remaining = Math.max(0, m.threshold - earned);
            const progressPct = Math.min(100, (earned / m.threshold) * 100);

            const StatusIcon: LucideIcon | null =
              status === "paid" ? CheckCircle2 : status === "requested" ? Clock : status === "rejected" ? XCircle : null;
            const cardClass =
              status === "paid"
                ? "border-green-500/40 bg-green-500/[0.04]"
                : status === "requested"
                ? "border-orange-500/40 bg-orange-500/[0.04]"
                : status === "rejected"
                ? "border-red-500/40 bg-red-500/[0.04]"
                : eligible
                ? "border-amber-500/40 bg-amber-500/[0.04]"
                : "border-border-faint bg-surface";

            return (
              <motion.div
                key={m.key}
                className={`relative p-4 rounded-2xl border transition-all ${cardClass}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.22 + i * 0.04 }}
              >
                <div className="flex items-start justify-between mb-3">
                  {eligible || status ? (
                    <MilestoneIcon kind={m.key} size="md" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center">
                      <Lock className="w-4 h-4 text-text-muted" />
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wider text-text-muted">Бонус</div>
                    <div className="text-lg font-bold text-amber-500 font-mono leading-none">+${m.reward}</div>
                  </div>
                </div>
                <div className="text-sm font-bold mb-0.5">{m.title}</div>
                <p className="text-[11px] text-text-muted mb-3">
                  При заработке ${m.threshold.toLocaleString("ru-RU")}
                </p>

                {!eligible && !status && (
                  <>
                    <LiveProgressBar value={progressPct} tone="amber" variant="solid" height="h-1.5" className="mb-2" />
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-muted mb-2">
                      <span>${earned.toLocaleString("ru-RU")}</span>
                      <span>${m.threshold.toLocaleString("ru-RU")}</span>
                    </div>
                    {remaining > 0 && (
                      <div className="text-[11px] text-amber-600 font-medium">
                        Осталось ${remaining.toLocaleString("ru-RU")}
                      </div>
                    )}
                  </>
                )}

                {eligible && !status && (
                  <button
                    onClick={() => claimMilestone(m.key)}
                    className="w-full mt-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5" /> Забрать ${m.reward}
                  </button>
                )}

                {StatusIcon && status && (
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium ${
                      status === "paid"
                        ? "text-green-500"
                        : status === "requested"
                        ? "text-orange-500"
                        : "text-red-500"
                    }`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status === "paid" ? "Выплачено" : status === "requested" ? "На рассмотрении" : "Отклонено"}
                  </div>
                )}

                {status === "rejected" && claim?.rejection_comment && (
                  <p className="mt-2 text-[11px] text-red-500/80 leading-snug">{claim.rejection_comment}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── Network achievements: бейджи Mentor / Network builder ─── */}
      {data.network && <NetworkAchievements network={data.network} />}
    </div>
  );
}

function NetworkAchievements({ network }: { network: NetworkSummary }) {
  const isMentor = network.activeSubs >= 3;
  const isNetworkBuilder = network.subRevenue >= 50_000;
  const hasAnySub = network.totalSubs > 0;

  return (
    <motion.section
      className="mt-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.04] via-surface to-surface p-5 lg:p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-bold tracking-tight">Достижения в сети</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <NetKpi label="Партнёров" value={String(network.totalSubs)} icon={Users} tone="purple" />
        <NetKpi label="Активных" value={`${network.activeSubs}/${network.totalSubs}`} icon={Sparkles} tone="green" hint="за 90 дней" />
        <NetKpi
          label="Override доход"
          value={`$${network.overrideTotal.toLocaleString("ru-RU")}`}
          icon={DollarSign}
          tone="amber"
        />
        <NetKpi
          label="Выручка сети"
          value={`$${network.subRevenue.toLocaleString("ru-RU")}`}
          icon={TrendingUp}
          tone="brand"
        />
      </div>

      {/* Бейджи */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NetBadge
          icon={Users}
          tone="purple"
          title="Mentor"
          requirement="3+ активных sub-partners"
          progressText={`${network.activeSubs}/3`}
          unlocked={isMentor}
        />
        <NetBadge
          icon={Trophy}
          tone="amber"
          title="Network Builder"
          requirement="$50K+ выручки sub-partners"
          progressText={`$${network.subRevenue.toLocaleString("ru-RU")} / $50 000`}
          unlocked={isNetworkBuilder}
        />
      </div>

      {!hasAnySub && (
        <p className="text-[11px] text-text-muted mt-4 leading-relaxed">
          У тебя пока нет sub-partners. Поделись реф-ссылкой со страницы «Мои партнёры» — за каждого приглашённого ты получаешь 3-8% override от его комиссий.
        </p>
      )}
    </motion.section>
  );
}

function NetKpi({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "purple" | "green" | "amber" | "brand";
  hint?: string;
}) {
  const toneText: Record<string, string> = {
    purple: "text-purple-500",
    green: "text-green-500",
    amber: "text-amber-500",
    brand: "text-brand-500",
  };
  const toneBg: Record<string, string> = {
    purple: "bg-purple-500/10",
    green: "bg-green-500/10",
    amber: "bg-amber-500/10",
    brand: "bg-brand-500/10",
  };
  return (
    <div className="p-3 rounded-xl border border-border-faint bg-surface">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-wide text-text-muted truncate">{label}</div>
        <div className={`w-6 h-6 rounded-md ${toneBg[tone]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3 h-3 ${toneText[tone]}`} strokeWidth={2.4} />
        </div>
      </div>
      <div className="text-base font-bold font-mono tabular-nums">{value}</div>
      {hint && <div className="text-[10px] text-text-muted mt-0.5">{hint}</div>}
    </div>
  );
}

function NetBadge({
  icon: Icon,
  tone,
  title,
  requirement,
  progressText,
  unlocked,
}: {
  icon: LucideIcon;
  tone: "purple" | "amber";
  title: string;
  requirement: string;
  progressText: string;
  unlocked: boolean;
}) {
  const toneText: Record<string, string> = {
    purple: "text-purple-500",
    amber: "text-amber-500",
  };
  const toneBg: Record<string, string> = {
    purple: "bg-purple-500/10",
    amber: "bg-amber-500/10",
  };
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
        unlocked ? `${toneBg[tone]} border-current/20 ${toneText[tone]}` : "border-border-faint bg-surface opacity-90"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          unlocked ? toneBg[tone] : "bg-bg-secondary"
        }`}
      >
        {unlocked ? (
          <Icon className={`w-5 h-5 ${toneText[tone]}`} strokeWidth={2.2} />
        ) : (
          <Lock className="w-4 h-4 text-text-muted" strokeWidth={2} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-bold ${unlocked ? toneText[tone] : "text-text-primary"}`}>{title}</span>
          {unlocked && (
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 font-medium">
              <CheckCircle2 className="w-2.5 h-2.5" /> открыт
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-muted leading-snug mt-0.5">{requirement}</p>
        <p className={`text-[11px] font-mono tabular-nums mt-1 ${unlocked ? toneText[tone] : "text-text-muted"}`}>
          {progressText}
        </p>
      </div>
    </div>
  );
}

function KpiCell({
  label,
  value,
  icon: Icon,
  tone,
  subtitle,
  big = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "green" | "brand" | "purple" | "amber";
  subtitle?: string;
  big?: boolean;
}) {
  const toneText: Record<string, string> = {
    green: "text-green-500",
    brand: "text-brand-500",
    purple: "text-purple-500",
    amber: "text-amber-500",
  };
  const toneBg: Record<string, string> = {
    green: "bg-green-500/10",
    brand: "bg-brand-500/10",
    purple: "bg-purple-500/10",
    amber: "bg-amber-500/10",
  };

  return (
    <div className="p-4 rounded-xl border border-border-faint bg-surface">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wide text-text-muted truncate">{label}</div>
        <div className={`w-7 h-7 rounded-lg ${toneBg[tone]} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${toneText[tone]}`} strokeWidth={2.2} />
        </div>
      </div>
      <div className={`font-bold font-mono tabular-nums ${big ? "text-2xl" : "text-xl"} ${tone === "green" ? toneText[tone] : "text-text-primary"}`}>
        {value}
      </div>
      {subtitle && <div className="text-[10px] text-text-muted mt-0.5 font-mono">{subtitle}</div>}
    </div>
  );
}

function HintCard({
  icon: Icon,
  tone,
  title,
  hint,
  done = false,
}: {
  icon: LucideIcon;
  tone: "green" | "amber";
  title: string;
  hint: string;
  done?: boolean;
}) {
  const toneText: Record<string, string> = {
    green: "text-green-500",
    amber: "text-amber-500",
  };
  const toneBorder: Record<string, string> = {
    green: done ? "border-green-500/30 bg-green-500/[0.04]" : "border-green-500/30 bg-green-500/[0.03]",
    amber: "border-amber-500/30 bg-amber-500/[0.04]",
  };
  const toneBg: Record<string, string> = {
    green: "bg-green-500/10",
    amber: "bg-amber-500/10",
  };

  return (
    <div className={`p-4 rounded-xl border ${toneBorder[tone]} flex items-start gap-3`}>
      <div className={`w-9 h-9 rounded-lg ${toneBg[tone]} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${toneText[tone]}`} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold leading-tight">{title}</span>
          {done && (
            <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${toneText[tone]} bg-white/40`}>
              активно
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-secondary leading-snug">{hint}</p>
      </div>
    </div>
  );
}
