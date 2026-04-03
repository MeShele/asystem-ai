"use client";

import { useState } from "react";
import { Bell, Globe, Palette, Shield } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const sections = [
    {
      icon: Globe,
      title: "Основные",
      desc: "Название компании, контакты, адрес",
      fields: [
        { label: "Название компании", placeholder: "asystem.ai", type: "text" },
        { label: "Email для уведомлений", placeholder: "admin@asystem.ai", type: "email" },
        { label: "Телефон", placeholder: "+996 XXX XXX XXX", type: "tel" },
      ],
    },
    {
      icon: Bell,
      title: "Уведомления",
      desc: "Telegram-бот и email-уведомления",
      fields: [
        { label: "Telegram Bot Token", placeholder: "bot123456:ABC...", type: "text" },
        { label: "Telegram Chat ID", placeholder: "-1001234567890", type: "text" },
        { label: "Resend API Key", placeholder: "re_...", type: "text" },
      ],
    },
    {
      icon: Shield,
      title: "Безопасность",
      desc: "Пароль администратора",
      fields: [
        { label: "Текущий пароль", placeholder: "••••••••", type: "password" },
        { label: "Новый пароль", placeholder: "••••••••", type: "password" },
      ],
    },
  ];

  const inputClass =
    "w-full p-3 bg-bg-primary border border-border-faint rounded-lg text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Настройки</h1>
        <p className="text-text-secondary text-sm">Конфигурация платформы</p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => {
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
                  <div key={field.label}>
                    <label className="text-xs text-text-secondary block mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <button onClick={handleSave} className="fc-button-primary h-11 px-8">
          <span>{saved ? "✓ Сохранено" : "Сохранить настройки"}</span>
        </button>
      </div>
    </div>
  );
}
