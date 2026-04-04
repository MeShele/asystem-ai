"use client";

import { useState, useEffect } from "react";
import { Bell, Globe, Palette, Shield, Bot, CheckCircle2, AlertCircle } from "lucide-react";

type AiProvider = "openrouter" | "anthropic";

interface Settings {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  telegram_bot_token?: string;
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
      { key: "company_email" as const, label: "Email для уведомлений", placeholder: "admin@asystem.ai", type: "email" },
      { key: "company_phone" as const, label: "Телефон", placeholder: "+996 XXX XXX XXX", type: "tel" },
    ],
  };

  const notificationSection = {
    icon: Bell,
    title: "Уведомления",
    desc: "Telegram-бот и email-уведомления",
    fields: [
      { key: "telegram_bot_token" as const, label: "Telegram Bot Token", placeholder: "bot123456:ABC...", type: "password" },
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
