"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Plus, Zap } from "lucide-react";
import type { DashboardData } from "@/types/partner";
import { CreateProjectModal } from "@/components/partner/create-project-modal";

export default function PartnerDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
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
        window.location.href = "/partner/login";
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const { partner, stats } = data;
  const currentLocale = typeof window !== "undefined" ? window.location.pathname.split("/")[1] || "ru" : "ru";
  const refLink = `${typeof window !== "undefined" ? window.location.origin : ""}/${currentLocale}/client/request?ref=${partner.ref_code}`;

  async function copyRef() {
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-1">Дашборд</h1>
        <p className="text-text-secondary text-sm">Добро пожаловать, {partner.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Всего клиентов", value: stats.totalClients, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Активных", value: stats.activeClients, icon: TrendingUp, color: "text-brand-500", bg: "bg-brand-500/10" },
          { label: "Заработано", value: `$${stats.totalEarned.toLocaleString()}`, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
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
              <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Ref link */}
      <motion.div
        className="p-5 rounded-xl border border-border-faint bg-surface mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-xs text-text-muted mb-2">Ваша реферальная ссылка</div>
        <div className="flex gap-2">
          <input
            value={refLink}
            readOnly
            className="flex-1 px-3 py-2 rounded-lg bg-bg-secondary border border-border-faint text-sm font-mono text-text-secondary"
          />
          <button onClick={copyRef} className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">
            {copied ? "Скопировано!" : "Копировать"}
          </button>
        </div>
      </motion.div>

      {/* Telegram status */}
      <motion.div
        className={`p-4 rounded-xl border mb-6 flex items-center gap-3 ${
          partner.telegram_id
            ? "border-green-500/20 bg-green-500/[0.04]"
            : "border-accent-500/20 bg-accent-500/[0.04]"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <span className={`w-2 h-2 rounded-full ${partner.telegram_id ? "bg-green-500" : "bg-accent-500"}`} />
        <span className={`text-sm ${partner.telegram_id ? "text-green-600 dark:text-green-400" : "text-accent-500"}`}>
          {partner.telegram_id
            ? `Telegram подключён ${partner.telegram_username ? `(@${partner.telegram_username})` : ""}`
            : "Telegram не подключён — перейдите в Настройки для подключения"
          }
        </span>
      </motion.div>

      {/* Create project CTA */}
      <motion.div className="mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
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

      {/* Coming soon */}
      <motion.div
        className="p-5 rounded-xl border border-border-faint bg-surface"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-accent-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1">Скоро: Авто-запуск проектов</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Для шаблонных продуктов — партнёр сможет запускать проекты автоматически. White-label — ваш бренд, наша инженерия.
            </p>
            <div className="flex gap-2 mt-3">
              <span className="text-[10px] px-2 py-0.5 rounded bg-accent-500/10 text-accent-500 font-medium">Q2 2026</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-medium">API для агентств</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
