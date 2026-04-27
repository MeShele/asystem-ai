"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { Users, DollarSign, Plus, Trophy, Lock, CheckCircle2, TrendingUp, FolderKanban, Wallet, ArrowRight } from "lucide-react";
import type { DashboardData } from "@/types/partner";
import { CreateProjectModal } from "@/components/partner/create-project-modal";
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

interface ExtendedDashboardData extends DashboardData {
  achievements: AchievementData[];
  milestones: MilestoneData[];
  currentLevel: MilestoneData | null;
  nextLevel: MilestoneData | null;
  progressPercent: number;
  monthlyEarnings: { month: string; earned: number }[];
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

  const { partner, stats, currentLevel, nextLevel, progressPercent, milestones, achievements, monthlyEarnings } = data;
  const currentLocale = typeof window !== "undefined" ? window.location.pathname.split("/")[1] || "ru" : "ru";
  const refLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${currentLocale}/client/request?ref=${partner.ref_code}`;
  const achievedKeys = new Set(achievements.map((a) => a.milestone_key));

  async function copyRef() {
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* ─── Premium Welcome ─── */}
      <motion.div
        className="mb-8 relative overflow-hidden rounded-2xl border border-brand-500/20 bg-gradient-to-r from-brand-500/[0.06] to-brand-700/[0.04] p-6 lg:p-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-brand-500/[0.06] blur-[100px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            {currentLevel && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/20 text-brand-500 text-xs font-semibold">
                <span>{currentLevel.icon}</span>
                {currentLevel.title}
              </span>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">
            Добро пожаловать, {partner.name}
          </h1>
          <p className="text-text-secondary text-sm">
            {nextLevel
              ? `До уровня ${nextLevel.title} ${nextLevel.icon} осталось $${(nextLevel.amount - stats.totalEarned).toLocaleString()}`
              : "Вы достигли максимального уровня — Legend 🔥"
            }
          </p>
        </div>
      </motion.div>

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
            label: "Текущий уровень",
            value: currentLevel ? currentLevel.title : "Новичок",
            icon: Trophy,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            sub: currentLevel ? `бонус +$${currentLevel.bonus.toLocaleString()}` : "заработайте $1,000",
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

      {/* ─── Progress to Next Level ─── */}
      {nextLevel && (
        <motion.div
          className="p-5 rounded-xl border border-border-faint bg-surface mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold">Прогресс до {nextLevel.title} {nextLevel.icon}</span>
            </div>
            <span className="text-sm font-bold text-brand-500">{progressPercent}%</span>
          </div>
          <div className="relative h-3 rounded-full bg-bg-secondary overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
            {/* Shimmer */}
            <div
              className="absolute inset-y-0 left-0 rounded-full opacity-30"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                animation: "shimmer-sweep 2s ease-in-out infinite",
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-muted">
            <span>${stats.totalEarned.toLocaleString()}</span>
            <span>Бонус: +${nextLevel.bonus.toLocaleString()}</span>
            <span>${nextLevel.amount.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

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
                    <div className="flex-1 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full" style={{ width: `${p.progress_percent}%` }} />
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
        <div className="text-sm font-semibold mb-4">Заработок по месяцам</div>
        <div className="h-[250px]">
          <EarningsChart data={monthlyEarnings} />
        </div>
      </motion.div>

      {/* ─── Achievements Grid ─── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold">Достижения</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {milestones.map((milestone, i) => {
            const achieved = achievedKeys.has(milestone.key);
            const achievement = achievements.find((a) => a.milestone_key === milestone.key);
            return (
              <motion.div
                key={milestone.key}
                className={`relative p-4 rounded-xl border transition-all duration-300 ${
                  achieved
                    ? "border-amber-500/30 bg-amber-500/[0.04] hover:border-amber-500/50"
                    : "border-border-faint bg-surface opacity-60 hover:opacity-80"
                }`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: achieved ? 1 : 0.6, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.04 }}
              >
                {/* Icon */}
                <div className="text-2xl mb-2">
                  {achieved ? milestone.icon : "🔒"}
                </div>

                {/* Title */}
                <div className="text-sm font-semibold mb-0.5">{milestone.title}</div>

                {/* Amount */}
                <div className={`text-xs ${achieved ? "text-amber-600 dark:text-amber-400" : "text-text-muted"}`}>
                  ${milestone.amount.toLocaleString()}
                </div>

                {/* Bonus badge */}
                <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  achieved
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-bg-secondary text-text-muted"
                }`}>
                  {achieved ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      +${milestone.bonus.toLocaleString()}
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      Бонус +${milestone.bonus.toLocaleString()}
                    </>
                  )}
                </div>

                {/* Date achieved */}
                {achieved && achievement?.achieved_at && (
                  <div className="text-[10px] text-text-muted mt-1">
                    {new Date(achievement.achieved_at).toLocaleDateString("ru-RU")}
                  </div>
                )}

                {/* Glow effect for achieved */}
                {achieved && (
                  <div className="absolute inset-0 rounded-xl border border-amber-500/20 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Ref link ─── */}
      <motion.div
        className="p-5 rounded-xl border border-border-faint bg-surface mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="text-xs text-text-muted mb-2">Ваша реферальная ссылка</div>
        <div className="flex gap-2">
          <input
            value={refLink}
            readOnly
            className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary border border-border-faint text-sm font-mono text-text-secondary"
          />
          <button onClick={copyRef} className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
            {copied ? "✓" : "Копировать"}
          </button>
        </div>
      </motion.div>

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
