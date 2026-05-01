"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { DollarSign, Trophy, FolderKanban, ChevronRight, TrendingUp, Wallet, Target } from "lucide-react";
import { LevelIcon } from "@/components/shared/level-icon";
import { LiveProgressBar } from "@/components/shared/live-progress-bar";
import { EarningsCalculator } from "@/components/partner/earnings-calculator";

interface MeData {
  partner: { partner_id: string; name: string; is_founding: boolean };
  stats: { totalEarned: number; totalClients: number; completedClients?: number };
  tierSystem: {
    levels: { level: number; title: string; icon: string; base_pct: number }[];
    currentLevel: number;
    currentMeta: { title: string; base_pct: number };
    nextMeta: { level: number; title: string; base_pct: number } | null;
    progress: { percent: number; hint: string };
    baseCommission: { total: number };
    acceptanceStats: { totalDeals: number; totalRevenue: number; dealsLast60Days: number };
  };
  pendingPayouts: number;
  network?: { totalSubs: number; activeSubs: number; overrideTotal: number };
}

interface ProjectLite {
  project_id: string;
  name: string;
  status: string;
  progress_percent: number;
  total_price: number | string;
  partner_commission_percent: number;
}

export default function TgDashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeData | null>(null);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/partner/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/partner/projects").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([d, p]) => {
        setMe(d);
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

  const { partner, stats, tierSystem, pendingPayouts, network } = me;
  const activeProjects = projects.filter((p) => p.status !== "completed" && p.status !== "cancelled").slice(0, 4);

  return (
    <div className="p-4 space-y-4">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-xs text-text-muted">Привет,</div>
        <div className="text-xl font-bold tracking-tight truncate">{partner.name}</div>
      </motion.div>

      {/* Big earnings card */}
      <motion.div
        className="rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-5 text-white relative overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="text-xs uppercase tracking-wider opacity-85 mb-1">Всего заработано</div>
          <div className="text-3xl font-extrabold font-mono tabular-nums">
            ${stats.totalEarned.toLocaleString("ru-RU")}
          </div>
          {pendingPayouts > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/15">
              <Wallet className="w-3 h-3" /> ${pendingPayouts.toLocaleString("ru-RU")} в обработке
            </div>
          )}
        </div>
      </motion.div>

      {/* Level */}
      <motion.button
        onClick={() => router.push("/tg/achievements")}
        className="w-full rounded-2xl border border-border-faint bg-surface p-4 flex items-center gap-3 text-left active:bg-bg-secondary transition-colors"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
      >
        <LevelIcon level={tierSystem.currentLevel} size="lg" active />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">L{tierSystem.currentLevel} · {tierSystem.baseCommission.total}% комиссия</div>
          <div className="text-base font-bold mb-1">{tierSystem.currentMeta.title}</div>
          {tierSystem.nextMeta && (
            <>
              <LiveProgressBar value={tierSystem.progress.percent} tone="brand" height="h-1.5" />
              <div className="text-[10px] text-text-muted mt-1 truncate">До L{tierSystem.nextMeta.level}: {Math.round(tierSystem.progress.percent)}%</div>
            </>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
      </motion.button>

      {/* 3 mini KPIs */}
      <motion.div
        className="grid grid-cols-3 gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <MiniKpi icon={Target} label="Сделок" value={String(tierSystem.acceptanceStats.totalDeals)} tone="brand" />
        <MiniKpi icon={TrendingUp} label="Выручка" value={`$${(tierSystem.acceptanceStats.totalRevenue / 1000).toFixed(0)}K`} tone="purple" />
        <MiniKpi icon={DollarSign} label="60 дней" value={`${tierSystem.acceptanceStats.dealsLast60Days}/3`} tone="amber" hint="retention" />
      </motion.div>

      {/* Калькулятор заработка — главная мотивационная плашка */}
      {tierSystem.levels && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
          <EarningsCalculator
            levels={tierSystem.levels}
            currentLevel={tierSystem.currentLevel}
            isFounding={Boolean(partner.is_founding)}
            retentionQualified={tierSystem.acceptanceStats.dealsLast60Days >= 3}
            partnerId={partner.partner_id}
          />
        </motion.div>
      )}

      {/* Network — если есть subs */}
      {network && network.totalSubs > 0 && (
        <motion.button
          onClick={() => router.push("/tg/network")}
          className="w-full rounded-2xl border border-purple-500/25 bg-purple-500/[0.04] p-4 flex items-center gap-3 text-left active:bg-purple-500/[0.08] transition-colors"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-text-muted">Override доход</div>
            <div className="text-base font-bold text-purple-600 font-mono tabular-nums">
              ${network.overrideTotal.toLocaleString("ru-RU")}
            </div>
            <div className="text-[11px] text-text-muted">{network.activeSubs}/{network.totalSubs} активных партнёров</div>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-500 flex-shrink-0" />
        </motion.button>
      )}

      {/* Active projects */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">Проекты в работе</h3>
          {projects.length > activeProjects.length && (
            <button onClick={() => router.push("/tg/projects")} className="text-[11px] text-brand-500">
              все ({projects.length})
            </button>
          )}
        </div>
        {activeProjects.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-border-faint text-center">
            <FolderKanban className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-xs text-text-muted">Нет активных проектов</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeProjects.map((p) => {
              const total = Number(p.total_price || 0);
              const potential = Math.round((total * Number(p.partner_commission_percent || 0)) / 100);
              return (
                <button
                  key={p.project_id}
                  onClick={() => router.push(`/tg/projects/${p.project_id}` as never)}
                  className="w-full text-left p-3 rounded-xl border border-border-faint bg-surface active:bg-bg-secondary transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold truncate flex-1">{p.name}</span>
                    <span className="text-xs font-mono text-green-500/80 ml-2 flex-shrink-0">
                      ~${potential.toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <LiveProgressBar value={p.progress_percent} tone="brand" height="h-1" live={p.status !== "completed"} />
                    </div>
                    <span className="text-[10px] font-mono text-text-muted w-9 text-right">{p.progress_percent}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Founding badge — если есть */}
      {partner.is_founding && (
        <motion.div
          className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3 flex items-center gap-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
        >
          <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-xs text-amber-700 leading-snug">
            <strong>Founding partner</strong> · +5% к комиссии всех проектов навсегда
          </span>
        </motion.div>
      )}
    </div>
  );
}

function MiniKpi({
  icon: Icon,
  label,
  value,
  tone,
  hint,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  tone: "brand" | "purple" | "amber";
  hint?: string;
}) {
  const toneText: Record<string, string> = {
    brand: "text-brand-500",
    purple: "text-purple-500",
    amber: "text-amber-500",
  };
  const toneBg: Record<string, string> = {
    brand: "bg-brand-500/10",
    purple: "bg-purple-500/10",
    amber: "bg-amber-500/10",
  };
  return (
    <div className="rounded-xl border border-border-faint bg-surface p-3">
      <div className={`w-6 h-6 rounded-md ${toneBg[tone]} flex items-center justify-center mb-1.5`}>
        <Icon className={`w-3.5 h-3.5 ${toneText[tone]}`} strokeWidth={2.4} />
      </div>
      <div className="text-base font-bold font-mono tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-text-muted mt-0.5 leading-tight">
        {hint || label}
      </div>
    </div>
  );
}
