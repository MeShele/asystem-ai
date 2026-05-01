"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { LiveProgressBar } from "@/components/shared/live-progress-bar";
import {
  Inbox,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  FolderKanban,
  Wallet,
  Handshake,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface RequestRow {
  id: number;
  request_id: string;
  name: string;
  phone: string;
  services: string[];
  status?: string;
  created_at: string;
}

interface PartnerRow {
  partner_id: string;
  name: string;
  email: string;
  company: string;
  ref_code: string;
  total_clients: number;
  total_earned: number;
  status: string;
  created_at: string;
}

interface ProjectRow {
  id: number;
  project_id: string;
  name: string;
  partner_id: string | null;
  partner_name?: string | null;
  total_price: number | string;
  paid_amount: number | string;
  partner_commission_percent: number;
  progress_percent: number;
  status: string;
  created_at: string;
}

interface DeveloperRow {
  id: number;
  name: string;
  role: string | null;
  avatar_url: string | null;
  status: string;
  projects_count: number;
}

const projectStatusMeta: Record<string, { label: string; color: string; bar: string }> = {
  planning: { label: "Планирование", color: "text-blue-400", bar: "bg-blue-500" },
  active: { label: "В работе", color: "text-brand-500", bar: "bg-brand-500" },
  review: { label: "На проверке", color: "text-orange-500", bar: "bg-orange-500" },
  completed: { label: "Завершён", color: "text-green-500", bar: "bg-green-500" },
  paused: { label: "На паузе", color: "text-yellow-500", bar: "bg-yellow-500" },
  cancelled: { label: "Отменён", color: "text-red-500", bar: "bg-red-500" },
};

const requestStatusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/10 text-blue-500" },
  review: { label: "На рассмотрении", color: "bg-yellow-500/10 text-yellow-500" },
  estimate: { label: "Оценка отправлена", color: "bg-purple-500/10 text-purple-500" },
  progress: { label: "В работе", color: "bg-brand-500/10 text-brand-500" },
  in_progress: { label: "В работе", color: "bg-brand-500/10 text-brand-500" },
  completed: { label: "Завершена", color: "bg-green-500/10 text-green-500" },
  won: { label: "Закрыта (won)", color: "bg-green-500/10 text-green-500" },
  lost: { label: "Потеряна", color: "bg-red-500/10 text-red-500" },
  closed: { label: "Закрыта", color: "bg-text-muted/10 text-text-muted" },
};
const FALLBACK_STATUS = { label: "—", color: "bg-text-muted/10 text-text-muted" };

export default function AdminDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [developers, setDevelopers] = useState<DeveloperRow[]>([]);

  useEffect(() => {
    fetch("/api/requests").then((r) => r.json()).then((d) => setRequests(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/partners").then((r) => r.json()).then((d) => setPartners(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/admin/projects").then((r) => r.json()).then((d) => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/admin/developers").then((r) => r.json()).then((d) => setDevelopers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Aggregations
  const newRequests = requests.filter((r) => !r.status || r.status === "new");
  const activeProjects = projects.filter((p) => p.status === "active" || p.status === "review");
  const totalProjectsValue = projects.reduce((s, p) => s + Number(p.total_price || 0), 0);
  const totalPaid = projects.reduce((s, p) => s + Number(p.paid_amount || 0), 0);
  const totalRemaining = Math.max(0, totalProjectsValue - totalPaid);
  const totalCommission = projects.reduce((s, p) => {
    const total = Number(p.total_price || 0);
    const pct = Number(p.partner_commission_percent || 0);
    return s + Math.round((total * pct) / 100);
  }, 0);

  const statusCounts = Object.keys(projectStatusMeta).map((k) => ({
    key: k,
    ...projectStatusMeta[k],
    count: projects.filter((p) => p.status === k).length,
  }));

  // Top partners by actual payouts
  const partnerProjectCounts = projects.reduce<Record<string, number>>((acc, p) => {
    if (p.partner_id) acc[p.partner_id] = (acc[p.partner_id] || 0) + 1;
    return acc;
  }, {});
  const topPartners = [...partners]
    .filter((p) => Number(p.total_earned || 0) > 0 || (partnerProjectCounts[p.partner_id] || 0) > 0)
    .sort((a, b) => Number(b.total_earned || 0) - Number(a.total_earned || 0))
    .slice(0, 5)
    .map((p) => ({
      partner_id: p.partner_id,
      partner_name: p.name,
      earned: Number(p.total_earned || 0),
      projects: partnerProjectCounts[p.partner_id] || 0,
    }));

  // Top developers by project count
  const topDevs = [...developers]
    .filter((d) => d.status === "active")
    .sort((a, b) => Number(b.projects_count) - Number(a.projects_count))
    .slice(0, 6);

  const stats = [
    {
      label: "Новых заявок",
      value: newRequests.length,
      icon: Inbox,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      onClick: () => router.push("/admin/requests"),
    },
    {
      label: "Активных проектов",
      value: activeProjects.length,
      sub: `${projects.length} всего`,
      icon: FolderKanban,
      color: "text-brand-500",
      bg: "bg-brand-500/10",
      onClick: () => router.push("/admin/projects"),
    },
    {
      label: "Партнёров",
      value: partners.length,
      sub: `${partners.filter((p) => p.status === "active").length} активных`,
      icon: Handshake,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      onClick: () => router.push("/admin/partners"),
    },
    {
      label: "Разработчиков",
      value: developers.length,
      sub: `${developers.filter((d) => d.status === "active").length} активных`,
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      onClick: () => router.push("/admin/developers"),
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Дашборд</h1>
        <p className="text-text-secondary text-sm">Полная сводка по бизнесу</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.button
              key={stat.label}
              onClick={stat.onClick}
              className="p-5 rounded-xl border border-border-faint bg-surface hover:bg-surface-raised transition-all text-left"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-[18px] h-[18px] ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
              {stat.sub && <div className="text-[10px] text-text-muted mt-0.5">{stat.sub}</div>}
            </motion.button>
          );
        })}
      </div>

      {/* Financial summary */}
      <motion.div
        className="rounded-xl border border-border-faint bg-gradient-to-r from-green-500/[0.04] to-brand-500/[0.04] p-5 lg:p-6 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-4 h-4 text-green-500" />
          <h2 className="text-sm font-semibold">Финансовая сводка</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <FinanceCell label="Объём проектов" value={`$${totalProjectsValue.toLocaleString("ru-RU")}`} color="text-text-primary" />
          <FinanceCell label="Оплачено" value={`$${totalPaid.toLocaleString("ru-RU")}`} color="text-green-500" />
          <FinanceCell label="Остаток" value={`$${totalRemaining.toLocaleString("ru-RU")}`} color="text-orange-500" />
          <FinanceCell label="Комиссия партнёрам" value={`$${totalCommission.toLocaleString("ru-RU")}`} color="text-purple-500" sub="по полным суммам" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Project status breakdown */}
        <div className="lg:col-span-2 rounded-xl border border-border-faint bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Проекты по статусам</h3>
            <Link href="/admin/projects" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              Все <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">Проектов пока нет</p>
          ) : (
            <div className="space-y-2">
              {statusCounts.filter((s) => s.count > 0).map((s) => {
                const pct = projects.length > 0 ? (s.count / projects.length) * 100 : 0;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className={`text-xs ${s.color} font-medium w-32 truncate`}>{s.label}</div>
                    <div className="flex-1">
                      <LiveProgressBar
                        value={pct}
                        tone={s.key === "completed" ? "green" : s.key === "active" || s.key === "review" ? "brand" : s.key === "cancelled" ? "red" : s.key === "paused" ? "yellow" : "purple"}
                        variant="solid"
                        live={s.key !== "completed" && s.key !== "cancelled"}
                      />
                    </div>
                    <div className="text-xs font-mono text-text-secondary w-10 text-right">{s.count}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top partners */}
        <div className="rounded-xl border border-border-faint bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Топ партнёров</h3>
            <Link href="/admin/partners" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              Все <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {topPartners.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {topPartners.map((p) => (
                <button
                  key={p.partner_id}
                  onClick={() => router.push(`/admin/partners/${p.partner_id}`)}
                  className="w-full flex items-center gap-3 text-left hover:bg-surface-raised rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-400">{p.partner_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.partner_name}</div>
                    <div className="text-[11px] text-text-muted">{p.projects} {p.projects === 1 ? "проект" : "проектов"}</div>
                  </div>
                  <div className="text-sm font-mono font-semibold text-green-500">${p.earned.toLocaleString("ru-RU")}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Recent requests */}
        <div className="lg:col-span-2 rounded-xl border border-border-faint bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Последние заявки</h3>
            <Link href="/admin/requests" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              Все <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {requests.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">Заявок пока нет</p>
          ) : (
            <div className="space-y-2">
              {requests.slice(0, 5).map((req) => {
                const status = requestStatusLabels[req.status || "new"] || FALLBACK_STATUS;
                return (
                  <div
                    key={req.request_id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-raised transition-colors cursor-pointer"
                    onClick={() => router.push("/admin/requests")}
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <Inbox className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{req.name || "Без имени"}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {Array.isArray(req.services) ? req.services.join(", ") : "—"} · {req.request_id}
                      </div>
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {new Date(req.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active projects */}
        <div className="rounded-xl border border-border-faint bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Активные проекты</h3>
            <Link href="/admin/projects" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
              Все <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <p className="text-text-muted text-sm py-4 text-center">Активных проектов нет</p>
          ) : (
            <div className="space-y-3">
              {activeProjects.slice(0, 5).map((p) => (
                <button
                  key={p.project_id}
                  onClick={() => router.push(`/admin/projects/${p.project_id}`)}
                  className="w-full text-left hover:bg-surface-raised rounded-lg p-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    <span className="text-[11px] font-mono text-brand-500 flex-shrink-0">{p.progress_percent}%</span>
                  </div>
                  <LiveProgressBar
                    value={p.progress_percent}
                    tone={p.status === "completed" ? "green" : "brand"}
                    live={p.status !== "completed" && p.status !== "cancelled"}
                    height="h-1.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Developers load */}
      <div className="rounded-xl border border-border-faint bg-surface p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Загрузка разработчиков</h3>
          <Link href="/admin/developers" className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1">
            Все <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {topDevs.length === 0 ? (
          <p className="text-text-muted text-sm py-4 text-center">Разработчиков пока нет</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topDevs.map((d) => (
              <button
                key={d.id}
                onClick={() => router.push(`/admin/developers/${d.id}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border-faint hover:bg-surface-raised transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center overflow-hidden">
                  {d.avatar_url ? (
                    <Image src={d.avatar_url} alt={d.name} width={48} height={48} unoptimized className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-base font-bold text-purple-400">{d.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-xs font-medium truncate w-full text-center">{d.name}</div>
                {d.role && <div className="text-[10px] text-text-muted truncate w-full text-center">{d.role}</div>}
                <div className="text-[10px] font-mono text-brand-500">
                  {d.projects_count} {Number(d.projects_count) === 1 ? "проект" : "проектов"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Alerts */}
      {newRequests.length > 0 && (
        <motion.div
          className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium">У вас {newRequests.length} новых заявок</div>
            <div className="text-xs text-text-muted">Проверьте в разделе «Заявки»</div>
          </div>
          <Link
            href="/admin/requests"
            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-medium transition-colors"
          >
            Перейти
          </Link>
        </motion.div>
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
