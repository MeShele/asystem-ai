"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import {
  Inbox,
  Clock,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

interface Request {
  id: number;
  request_id: string;
  name: string;
  phone: string;
  services: string[];
  budget?: string;
  timeline?: string;
  status?: string;
  created_at: string;
}

interface Partner {
  id: number;
  partner_id: string;
  name: string;
  specialization: string;
  created_at: string;
}

const serviceLabels: Record<string, string> = {
  website: "Сайт",
  bot: "Бот",
  app: "Приложение",
  automation: "Автоматизация",
  custom: "Другое",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-blue-500/10 text-blue-500" },
  review: { label: "На рассмотрении", color: "bg-yellow-500/10 text-yellow-500" },
  estimate: { label: "Оценка отправлена", color: "bg-purple-500/10 text-purple-500" },
  progress: { label: "В работе", color: "bg-brand-500/10 text-brand-500" },
  completed: { label: "Завершена", color: "bg-green-500/10 text-green-500" },
  closed: { label: "Закрыта", color: "bg-text-muted/10 text-text-muted" },
};

export default function AdminDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch("/api/requests")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch(() => setRequests([]));
    fetch("/api/partners")
      .then((res) => res.json())
      .then((data) => setPartners(data))
      .catch(() => setPartners([]));
  }, []);

  const newRequests = requests.filter((r) => !r.status || r.status === "new");
  const activeRequests = requests.filter((r) => r.status === "progress");

  const stats = [
    {
      label: "Новых заявок",
      value: newRequests.length,
      icon: Inbox,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "+100%",
    },
    {
      label: "В работе",
      value: activeRequests.length,
      icon: Clock,
      color: "text-brand-500",
      bg: "bg-brand-500/10",
      trend: null,
    },
    {
      label: "Всего заявок",
      value: requests.length,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
      trend: null,
    },
    {
      label: "Партнёров",
      value: partners.length,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: null,
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Дашборд</h1>
        <p className="text-text-secondary text-sm">Обзор вашего бизнеса</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="p-5 rounded-xl border border-border-faint bg-surface hover:bg-surface-raised transition-all"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-[18px] h-[18px] ${stat.color}`} />
                </div>
                {stat.trend && (
                  <span className="text-[11px] font-medium text-green-500 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Recent requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests table */}
        <div className="lg:col-span-2 rounded-xl border border-border-faint bg-surface overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border-faint">
            <h2 className="font-semibold">Последние заявки</h2>
            <Link
              href="/admin/requests"
              className="text-xs text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors"
            >
              Все заявки <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-text-muted text-sm">Заявок пока нет</p>
              <p className="text-text-muted text-xs mt-1">Они появятся здесь после заполнения квиз-формы</p>
            </div>
          ) : (
            <div className="divide-y divide-border-faint">
              {requests.slice(0, 5).map((req, i) => {
                const firstService = Array.isArray(req.services) ? req.services[0] : "";
                const status = statusLabels[req.status || "new"];
                return (
                  <motion.div
                    key={req.request_id || i}
                    className="flex items-center gap-4 p-4 hover:bg-surface-raised transition-colors cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {/* Service icon */}
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">
                        {firstService === "website" ? "🌐" : firstService === "bot" ? "🤖" : firstService === "app" ? "📱" : firstService === "automation" ? "⚙️" : "📋"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm truncate">{req.name || "Без имени"}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted flex items-center gap-2">
                        <span>{Array.isArray(req.services) ? req.services.map((s) => serviceLabels[s] || s).join(", ") : "—"}</span>
                        <span>·</span>
                        <span>{req.request_id}</span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-xs text-text-muted flex-shrink-0">
                      {new Date(req.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick info panel */}
        <div className="space-y-4">
          {/* Pipeline */}
          <div className="rounded-xl border border-border-faint bg-surface p-5">
            <h3 className="font-semibold text-sm mb-4">Воронка заявок</h3>
            {Object.entries(statusLabels).map(([key, { label, color }]) => {
              const count = requests.filter((r) => (r.status || "new") === key).length;
              const pct = requests.length > 0 ? (count / requests.length) * 100 : 0;
              return (
                <div key={key} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color.includes("blue") ? "bg-blue-500" : color.includes("yellow") ? "bg-yellow-500" : color.includes("purple") ? "bg-purple-500" : color.includes("brand") ? "bg-brand-500" : color.includes("green") ? "bg-green-500" : "bg-text-muted"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Partners */}
          <div className="rounded-xl border border-border-faint bg-surface p-5">
            <h3 className="font-semibold text-sm mb-3">Новые партнёры</h3>
            {partners.length === 0 ? (
              <p className="text-text-muted text-xs">Партнёров пока нет</p>
            ) : (
              <div className="space-y-2">
                {partners.slice(0, 3).map((p, i) => (
                  <div key={p.partner_id || i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-purple-500">{p.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-text-muted">{p.specialization}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
