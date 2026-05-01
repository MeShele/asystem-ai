"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Building, Percent, MessageCircle, Send, ExternalLink, CheckCircle2, Copy, CheckCheck, Bell, Sparkles, RefreshCw, KeyRound } from "lucide-react";
import type { Partner } from "@/types/partner";

export default function PartnerSettingsPage() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  // Pairing state
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [pairUrl, setPairUrl] = useState<string | null>(null);
  const [pairExpiresAt, setPairExpiresAt] = useState<number | null>(null);
  const [pairLoading, setPairLoading] = useState(false);
  const [pairError, setPairError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const loadMe = useCallback(() => {
    return fetch("/api/partner/me")
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((data) => setPartner(data.partner))
      .catch(() => {
        const locale = window.location.pathname.split("/")[1] || "ru";
        window.location.href = `/${locale}/partner/login`;
      });
  }, []);

  useEffect(() => {
    loadMe().finally(() => setLoading(false));
  }, [loadMe]);

  // Polling статуса привязки — пока pair-код активен, проверяем раз в 3 сек
  useEffect(() => {
    if (!pairCode) return;
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/partner/telegram/status");
        if (!res.ok) return;
        const data = await res.json();
        if (data.linked) {
          // Привязано! Перезагружаем профиль
          if (pollRef.current) clearInterval(pollRef.current);
          setPairCode(null);
          setPairUrl(null);
          setPairExpiresAt(null);
          await loadMe();
        }
      } catch {
        /* ignore */
      }
    }, 3000);

    // Также чистим pair если истёк
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pairCode, loadMe]);

  // Авто-сброс кода если истёк
  useEffect(() => {
    if (!pairExpiresAt) return;
    const ms = pairExpiresAt - Date.now();
    if (ms <= 0) {
      setPairCode(null);
      setPairUrl(null);
      setPairExpiresAt(null);
      return;
    }
    const t = setTimeout(() => {
      setPairCode(null);
      setPairUrl(null);
      setPairExpiresAt(null);
    }, ms);
    return () => clearTimeout(t);
  }, [pairExpiresAt]);

  const startPair = async () => {
    setPairLoading(true);
    setPairError(null);
    try {
      const res = await fetch("/api/partner/telegram/start-pair", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setPairError(data.error || "Ошибка генерации кода");
        return;
      }
      setPairCode(data.code);
      setPairUrl(data.url);
      setPairExpiresAt(Date.now() + Number(data.expires_in || 600) * 1000);
      // Автооткрытие в новой вкладке (для desktop) — на mobile пользователь жмёт кнопку
    } finally {
      setPairLoading(false);
    }
  };

  const unlink = async () => {
    if (!confirm("Отвязать Telegram? Уведомления больше не будут приходить.")) return;
    setUnlinking(true);
    try {
      await fetch("/api/partner/telegram/unlink", { method: "POST" });
      await loadMe();
    } finally {
      setUnlinking(false);
    }
  };

  const copy = async () => {
    if (!pairUrl) return;
    await navigator.clipboard.writeText(pairUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const isLinked = Boolean(partner.telegram_id);

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Настройки</h1>
        <p className="text-text-secondary text-sm">Ваш профиль и интеграции</p>
      </div>

      {/* Profile card */}
      <motion.div
        className="rounded-xl border border-border-faint bg-surface p-5 lg:p-6 mb-6"
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
                <div className="min-w-0">
                  <div className="text-xs text-text-muted">{field.label}</div>
                  <div className="text-sm font-medium truncate">{field.value}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-text-muted mt-4">
          ID: {partner.partner_id} · Ref: {partner.ref_code}
        </p>
      </motion.div>

      {/* Смена пароля */}
      <motion.div
        className="rounded-xl border border-border-faint bg-surface p-5 lg:p-6 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-brand-500" />
          <h2 className="text-base font-semibold">Сменить пароль</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-text-muted mb-1 block">Текущий пароль</label>
            <input
              type={showPwd ? "text" : "password"}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              autoComplete="current-password"
              className="w-full px-3 py-2 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1 block">Новый пароль (минимум 6 символов)</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-20 text-sm bg-bg-secondary border border-border-faint rounded-lg focus:border-brand-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-text-muted hover:text-text-primary px-2"
              >
                {showPwd ? "Скрыть" : "Показать"}
              </button>
            </div>
          </div>
          {pwdMessage && (
            <div className={`text-xs px-3 py-2 rounded-lg ${pwdMessage.type === "success" ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"}`}>
              {pwdMessage.text}
            </div>
          )}
          <button
            type="button"
            onClick={async () => {
              setPwdMessage(null);
              if (newPwd.length < 6) {
                setPwdMessage({ type: "error", text: "Новый пароль не короче 6 символов" });
                return;
              }
              if (currentPwd === newPwd) {
                setPwdMessage({ type: "error", text: "Новый пароль должен отличаться от старого" });
                return;
              }
              setPwdLoading(true);
              const res = await fetch("/api/partner/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
              });
              setPwdLoading(false);
              if (res.ok) {
                setPwdMessage({ type: "success", text: "Пароль обновлён" });
                setCurrentPwd("");
                setNewPwd("");
              } else {
                const e = await res.json().catch(() => ({}));
                setPwdMessage({ type: "error", text: e.error || "Не удалось обновить пароль" });
              }
            }}
            disabled={pwdLoading || !currentPwd || newPwd.length < 6}
            className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {pwdLoading ? "Сохранение..." : "Обновить пароль"}
          </button>
        </div>
      </motion.div>

      {/* Telegram integration */}
      <motion.div
        className="rounded-2xl border border-border-faint bg-surface overflow-hidden mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-border-faint flex items-start gap-3 bg-gradient-to-r from-blue-500/[0.04] to-transparent">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-blue-500" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold">Telegram</h2>
              {isLinked ? (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> подключён
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                  не привязан
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Mini App + уведомления в личку
            </p>
          </div>
        </div>

        <div className="p-5 lg:p-6">
          {isLinked ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">Аккаунт привязан</div>
                    <div className="text-xs text-text-muted">
                      {partner.telegram_username ? `@${partner.telegram_username}` : `Telegram ID ${partner.telegram_id}`}
                    </div>
                  </div>
                  <button
                    onClick={unlink}
                    disabled={unlinking}
                    className="text-[11px] text-text-muted hover:text-red-500 transition-colors disabled:opacity-50 px-2 py-1"
                  >
                    {unlinking ? "..." : "Отвязать"}
                  </button>
                </div>
              </div>

              {/* Что приходит в Telegram */}
              <NotificationKindsBlock />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Описание зачем */}
              <div className="text-sm text-text-secondary leading-relaxed">
                Получай <strong>мгновенные уведомления</strong> в личку:
                новый проект, выплата, комментарий клиента, повышение уровня — всё прямо в Telegram.
                Плюс открывай весь кабинет одной кнопкой через Mini App.
              </div>

              <NotificationKindsBlock compact />

              {/* Pairing flow */}
              <AnimatePresence mode="wait">
                {!pairUrl ? (
                  <motion.button
                    key="start-btn"
                    onClick={startPair}
                    disabled={pairLoading}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-md shadow-brand-500/20"
                  >
                    <Send className="w-4 h-4" />
                    {pairLoading ? "Генерация ссылки..." : "Привязать через Telegram-бота"}
                  </motion.button>
                ) : (
                  <motion.div
                    key="pair-flow"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {/* Step 1 */}
                    <a
                      href={pairUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                        <Send className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold">Открыть бота в Telegram</div>
                        <div className="text-[11px] opacity-90 truncate">{pairUrl}</div>
                      </div>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>

                    {/* Step 2 — fallback */}
                    <div className="p-3 rounded-xl border border-border-faint bg-bg-secondary/30">
                      <div className="text-[11px] text-text-muted mb-2 uppercase tracking-wider font-semibold">Если ссылка не открывается</div>
                      <div className="flex items-center gap-2">
                        <input
                          value={pairUrl}
                          readOnly
                          className="flex-1 px-3 py-2 rounded-lg bg-surface border border-border-faint text-xs font-mono text-text-secondary"
                        />
                        <button
                          onClick={copy}
                          className="px-3 py-2 rounded-lg bg-surface border border-border-faint hover:border-brand-500/40 text-xs flex items-center gap-1 transition-colors"
                        >
                          {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "" : "копир."}
                        </button>
                      </div>
                    </div>

                    {/* Polling indicator */}
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="font-semibold text-amber-700">Ждём подтверждения от бота...</div>
                        <div className="text-[10px] text-text-muted">
                          Перейди по ссылке выше и нажми START в Telegram. Эта страница обновится автоматически.
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPairUrl(null);
                          setPairCode(null);
                          setPairExpiresAt(null);
                        }}
                        className="text-[11px] text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
                      >
                        отменить
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {pairError && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/[0.04] text-xs text-red-600">
                  {pairError}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Список того что присылает бот в Telegram (для мотивации привязать).
 */
function NotificationKindsBlock({ compact = false }: { compact?: boolean }) {
  const items = [
    { icon: Bell, label: "Новые проекты", desc: "С указанной комиссией и потенциальным доходом" },
    { icon: CheckCircle2, label: "Выплаты", desc: "Когда админ одобряет твою выплату" },
    { icon: MessageCircle, label: "Комментарии", desc: "Клиент или админ написал по проекту" },
    { icon: Sparkles, label: "Повышение уровня", desc: "Когда переходишь L2 → L3 → L4 → L5" },
  ];
  return (
    <div className={`rounded-xl border border-border-faint bg-bg-secondary/30 ${compact ? "p-3" : "p-4"}`}>
      <div className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-2.5">
        Что приходит в Telegram
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-2">
              <Icon className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" strokeWidth={2.4} />
              <div className="min-w-0">
                <div className="text-xs font-medium leading-tight">{item.label}</div>
                <div className="text-[10px] text-text-muted leading-snug">{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
