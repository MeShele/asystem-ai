"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building, Percent, MessageCircle } from "lucide-react";
import type { Partner } from "@/types/partner";
import { TelegramLoginButton } from "@/components/partner/telegram-login-button";

export default function PartnerSettingsPage() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [tgId, setTgId] = useState("");
  const [tgLinking, setTgLinking] = useState(false);

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((data) => setPartner(data.partner))
      .catch(() => {
        window.location.href = "/partner/login";
      })
      .finally(() => setLoading(false));
  }, []);

  async function linkTelegram() {
    if (!tgId.trim()) return;
    setTgLinking(true);
    try {
      await fetch("/api/partner/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegramId: tgId.trim() }),
      });
      window.location.reload();
    } catch {
      // ignore
    } finally {
      setTgLinking(false);
    }
  }

  if (loading || !partner) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const fields = [
    { icon: User, label: "Имя", value: partner.name },
    { icon: Mail, label: "Email", value: partner.email },
    { icon: Phone, label: "Телефон", value: partner.phone || "—" },
    { icon: Building, label: "Компания", value: partner.company || "—" },
    { icon: Percent, label: "Комиссия", value: `${Math.round(Number(partner.commission_rate) * 100)}%` },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Настройки</h1>
        <p className="text-text-secondary text-sm">Ваш профиль и интеграции</p>
      </div>

      {/* Profile card */}
      <motion.div
        className="rounded-xl border border-border-faint bg-surface p-6 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-base font-semibold mb-4">Профиль</h2>
        <div className="space-y-4">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-[18px] h-[18px] text-brand-500" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">{field.label}</div>
                  <div className="text-sm font-medium">{field.value}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-text-muted mt-4">
          ID: {partner.partner_id} · Ref: {partner.ref_code}
        </p>
      </motion.div>

      {/* Telegram integration */}
      <motion.div
        className="rounded-xl border border-border-faint bg-surface p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-[18px] h-[18px] text-blue-500" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Telegram</h2>
            <p className="text-xs text-text-muted">Уведомления о новых клиентах и статусах</p>
          </div>
        </div>

        {partner.telegram_id ? (
          <div className="p-4 rounded-lg bg-green-500/[0.04] border border-green-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                Подключён {partner.telegram_username ? `(@${partner.telegram_username})` : ""}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <TelegramLoginButton />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border-faint" />
              <span className="text-xs text-text-muted">или введите Telegram ID</span>
              <div className="flex-1 h-px bg-border-faint" />
            </div>

            <div className="flex gap-2">
              <input
                value={tgId}
                onChange={(e) => setTgId(e.target.value)}
                placeholder="Ваш Telegram ID"
                className="flex-1 px-3 py-2 rounded-lg bg-bg-primary border border-border-faint text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none"
              />
              <button
                onClick={linkTelegram}
                disabled={tgLinking}
                className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                {tgLinking ? "..." : "Привязать"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
