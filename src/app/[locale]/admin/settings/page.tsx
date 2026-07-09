"use client";

import { useState, useEffect } from "react";
import { Bell, Globe, Palette, Shield, Bot, CheckCircle2, AlertCircle } from "lucide-react";

type AiProvider = "openrouter" | "anthropic";

interface Settings {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  telegram_bot_token?: string;
  telegram_bot_username?: string;
  telegram_chat_id?: string;
  telegram_group_id?: string;
  resend_api_key?: string;
  ai_provider?: AiProvider;
  ai_api_key?: string;
  ai_model?: string;
}

const DEFAULT_MODELS: Record<AiProvider, string> = {
  openrouter: "anthropic/claude-sonnet-4",
  anthropic: "claude-sonnet-4-20250514",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* Fetch settings on mount */
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load settings");
        return r.json();
      })
      .then((data: Settings) => {
        setSettings(data);
      })
      .catch(() => {
        /* settings may not exist yet, start with defaults */
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  /* Helpers */
  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
  }

  function handleProviderChange(provider: AiProvider) {
    setSettings((prev) => ({
      ...prev,
      ai_provider: provider,
      ai_model: prev.ai_model || DEFAULT_MODELS[provider],
    }));
    setFeedback(null);
  }

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Ошибка сохранения");
      }
      setFeedback({ type: "success", text: "Настройки сохранены" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка сохранения";
      setFeedback({ type: "error", text: message });
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full p-3 bg-bg-primary border border-border-faint rounded-lg text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted text-sm">Загрузка...</div>
      </div>
    );
  }

  const aiProvider: AiProvider = settings.ai_provider ?? "openrouter";

  const generalSection = {
    icon: Globe,
    title: "Основные",
    desc: "Название компании, контакты, адрес",
    fields: [
      { key: "company_name" as const, label: "Название компании", placeholder: "asystem.ai", type: "text" },
      { key: "company_email" as const, label: "Email для уведомлений", placeholder: "asystem.teamwork@gmail.com", type: "email" },
      { key: "company_phone" as const, label: "Телефон", placeholder: "+996 XXX XXX XXX", type: "tel" },
    ],
  };

  const notificationSection = {
    icon: Bell,
    title: "Уведомления",
    desc: "Telegram-бот и email-уведомления",
    fields: [
      { key: "telegram_bot_token" as const, label: "Telegram Bot Token", placeholder: "bot123456:ABC...", type: "password" },
      { key: "telegram_bot_username" as const, label: "Telegram Bot Username (без @)", placeholder: "asystem_bot", type: "text" },
      { key: "telegram_chat_id" as const, label: "Telegram Chat ID (уведомления админу)", placeholder: "-1001234567890", type: "text" },
      { key: "telegram_group_id" as const, label: "Telegram Group ID (топики проектов)", placeholder: "-1001234567890", type: "text" },
      { key: "resend_api_key" as const, label: "Resend API Key", placeholder: "re_...", type: "password" },
    ],
  };

  const standardSections = [generalSection, notificationSection];

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Настройки</h1>
        <p className="text-text-secondary text-sm">Конфигурация платформы</p>
      </div>

      <div className="space-y-8">
        {/* Standard sections (General, Notifications) */}
        {standardSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="rounded-xl border border-border-faint bg-surface p-6">
              <div className="flex items-center gap-3 mb-1">
                <Icon className="w-5 h-5 text-brand-500" />
                <h2 className="font-semibold">{section.title}</h2>
              </div>
              <p className="text-text-muted text-xs mb-5">{section.desc}</p>
              {section.title === "Уведомления" && (
                <div className="bg-blue-500/[0.04] border border-blue-500/10 rounded-xl p-4 text-xs text-text-secondary mb-5">
                  <p className="font-medium mb-2">Как настроить Telegram-уведомления:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Откройте @BotFather → /newbot → создайте бота</li>
                    <li>Скопируйте токен бота и вставьте в поле ниже</li>
                    <li>Напишите @userinfobot чтобы узнать ваш Chat ID</li>
                    <li>Для топиков проектов: создайте группу с Topics → добавьте бота → получите Group ID</li>
                  </ol>
                </div>
              )}
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs text-text-secondary block mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={(settings[field.key] as string) ?? ""}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Telegram Webhook */}
        <TelegramWebhookBlock />

        {/* AI Settings */}
        <div className="rounded-xl border border-border-faint bg-surface p-6">
          <div className="flex items-center gap-3 mb-1">
            <Bot className="w-5 h-5 text-brand-500" />
            <h2 className="font-semibold">AI Провайдер</h2>
          </div>
          <p className="text-text-muted text-xs mb-5">Настройки AI для генерации КП</p>

          <div className="space-y-5">
            {/* Provider selection */}
            <div>
              <label className="text-xs text-text-secondary block mb-2">Провайдер</label>
              <div className="flex gap-3">
                {(["openrouter", "anthropic"] as const).map((provider) => (
                  <button
                    key={provider}
                    onClick={() => handleProviderChange(provider)}
                    className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                      aiProvider === provider
                        ? "border-brand-500 bg-brand-500/10 text-brand-500"
                        : "border-border-faint bg-bg-primary text-text-secondary hover:border-border-faint/80"
                    }`}
                  >
                    {provider === "openrouter" ? "OpenRouter" : "Anthropic"}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">API Ключ</label>
              <input
                type="password"
                placeholder={aiProvider === "openrouter" ? "sk-or-v1-..." : "sk-ant-..."}
                value={settings.ai_api_key ?? ""}
                onChange={(e) => updateField("ai_api_key", e.target.value)}
                className={inputClass}
              />
              <p className="text-[10px] text-text-muted mt-1">
                {settings.ai_api_key ? "Ключ задан (введите новый для замены)" : "Ключ не задан"}
              </p>
            </div>

            {/* Model */}
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">Модель</label>
              <input
                type="text"
                placeholder={DEFAULT_MODELS[aiProvider]}
                value={settings.ai_model ?? ""}
                onChange={(e) => updateField("ai_model", e.target.value)}
                className={inputClass}
              />
              <p className="text-[10px] text-text-muted mt-1">
                По умолчанию: {DEFAULT_MODELS[aiProvider]}
              </p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border-faint bg-surface p-6">
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-5 h-5 text-brand-500" />
            <h2 className="font-semibold">Безопасность</h2>
          </div>
          <p className="text-text-muted text-xs mb-5">Пароль администратора</p>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">Текущий пароль</label>
              <input type="password" placeholder="........" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-text-secondary block mb-1.5">Новый пароль</label>
              <input type="password" placeholder="........" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
              feedback.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="fc-button-primary h-11 px-8 disabled:opacity-50"
        >
          <span>{saving ? "Сохранение..." : "Сохранить настройки"}</span>
        </button>
      </div>
    </div>
  );
}

interface WebhookInfo {
  url?: string;
  pending_update_count?: number;
  last_error_message?: string;
  last_error_date?: number;
}

interface BotInfo {
  username?: string;
  first_name?: string;
}

function TelegramWebhookBlock() {
  const [info, setInfo] = useState<{ webhook: WebhookInfo | null; bot: BotInfo | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/telegram/webhook");
      if (res.ok) {
        const d = await res.json();
        setInfo(d);
      } else {
        setInfo(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const register = async () => {
    setActing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/telegram/webhook", { method: "POST" });
      const data = await res.json();
      if (data.result?.ok) {
        setMsg({ type: "success", text: `Webhook зарегистрирован: ${data.webhookUrl}` });
        await load();
      } else {
        setMsg({ type: "error", text: data.result?.description || data.error || "Ошибка регистрации" });
      }
    } finally {
      setActing(false);
    }
  };

  const remove = async () => {
    if (!confirm("Удалить webhook? Бот перестанет получать сообщения.")) return;
    setActing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/telegram/webhook", { method: "DELETE" });
      const data = await res.json();
      if (data.result?.ok) {
        setMsg({ type: "success", text: "Webhook удалён" });
        await load();
      } else {
        setMsg({ type: "error", text: data.result?.description || "Ошибка удаления" });
      }
    } finally {
      setActing(false);
    }
  };

  const webhook = info?.webhook;
  const bot = info?.bot;
  const isRegistered = Boolean(webhook?.url);

  return (
    <div className="rounded-xl border border-border-faint bg-surface p-5 lg:p-6">
      <div className="flex items-center gap-3 mb-1">
        <Bot className="w-5 h-5 text-brand-500" />
        <h2 className="font-semibold">Telegram Webhook</h2>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Без webhook бот не будет реагировать на команды (включая /start CODE для привязки партнёров).
      </p>

      {loading ? (
        <div className="text-text-muted text-sm">Проверка...</div>
      ) : !info || !info.bot ? (
        <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.04] text-xs text-amber-700">
          Bot token не задан или невалидный. Сохраните токен выше и перезагрузите страницу.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bot info */}
          <div className="p-3 rounded-lg border border-border-faint bg-bg-secondary/30">
            <div className="text-[10px] uppercase tracking-wider text-text-muted">Текущий бот</div>
            <div className="text-sm font-semibold">
              {bot?.first_name} <span className="text-text-muted font-mono text-xs">@{bot?.username}</span>
            </div>
          </div>

          {/* Webhook status */}
          <div className={`p-3 rounded-lg border ${isRegistered ? "border-green-500/30 bg-green-500/[0.04]" : "border-amber-500/30 bg-amber-500/[0.04]"}`}>
            <div className="flex items-center gap-2 mb-1">
              {isRegistered ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
              <span className={`text-sm font-semibold ${isRegistered ? "text-green-700" : "text-amber-700"}`}>
                {isRegistered ? "Webhook зарегистрирован" : "Webhook не установлен"}
              </span>
            </div>
            {webhook?.url && (
              <div className="text-[11px] text-text-muted font-mono truncate">{webhook.url}</div>
            )}
            {webhook?.last_error_message && (
              <div className="text-[11px] text-red-500 mt-1">
                Последняя ошибка: {webhook.last_error_message}
              </div>
            )}
            {(webhook?.pending_update_count ?? 0) > 0 && (
              <div className="text-[11px] text-text-muted mt-1">
                Pending updates: {webhook?.pending_update_count}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={register}
              disabled={acting}
              className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {acting ? "..." : isRegistered ? "Перерегистрировать" : "Зарегистрировать webhook"}
            </button>
            {isRegistered && (
              <button
                onClick={remove}
                disabled={acting}
                className="px-4 py-2 rounded-lg border border-border-faint hover:border-red-500/40 text-red-500 text-sm transition-colors disabled:opacity-50"
              >
                Удалить
              </button>
            )}
          </div>

          {msg && (
            <div className={`p-2.5 rounded-lg text-xs ${
              msg.type === "success" ? "border border-green-500/30 bg-green-500/[0.04] text-green-700" : "border border-red-500/30 bg-red-500/[0.04] text-red-700"
            }`}>
              {msg.text}
            </div>
          )}

          {/* Quick guide */}
          <details className="text-xs text-text-muted">
            <summary className="cursor-pointer hover:text-text-primary py-1 select-none">📖 Подсказка по @BotFather</summary>
            <div className="mt-2 p-3 rounded-lg bg-bg-secondary/30 leading-relaxed space-y-1.5">
              <div><strong>1. Mini App:</strong> @BotFather → <code>/newapp</code> → выбери бота → Web App URL: <code className="font-mono text-[10px]">{typeof window !== "undefined" ? window.location.origin : ""}/ru/tg</code></div>
              <div><strong>2. Кнопка меню:</strong> @BotFather → <code>/setmenubutton</code> → текст: «🚀 Кабинет» → URL тот же что выше</div>
              <div><strong>3. Webhook:</strong> жми кнопку выше — он будет указывать на <code className="font-mono text-[10px]">{typeof window !== "undefined" ? window.location.origin : ""}/api/tg/webhook</code></div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
