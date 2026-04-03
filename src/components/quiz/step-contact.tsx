"use client";

import { useTranslations } from "next-intl";
import { contactMethods } from "@/lib/validations/request";
import type { RequestFormData } from "@/lib/validations/request";

interface Props {
  data: Partial<RequestFormData>;
  onChange: (v: Partial<RequestFormData>) => void;
}

const contactIcons: Record<string, string> = {
  phoneCall: "📞",
  whatsapp: "💬",
  telegramContact: "✈️",
  emailContact: "📧",
};

export function StepContact({ data, onChange }: Props) {
  const t = useTranslations("quiz.step5");

  const inputClass =
    "w-full p-3 bg-bg-primary border border-border-faint rounded-lg text-text-primary text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 outline-none transition-all placeholder:text-text-muted";

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t("title")}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            {t("name")} <span className="text-red-400">*</span>
          </label>
          <input
            className={inputClass}
            type="text"
            value={data.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">{t("company")}</label>
          <input
            className={inputClass}
            type="text"
            value={data.company || ""}
            onChange={(e) => onChange({ company: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            {t("phone")} <span className="text-red-400">*</span>
          </label>
          <input
            className={inputClass}
            type="tel"
            value={data.phone || ""}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">{t("email")}</label>
          <input
            className={inputClass}
            type="email"
            value={data.email || ""}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-2">
            {t("preferredContact")} <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {contactMethods.map((method) => (
              <button
                key={method}
                onClick={() => onChange({ preferredContact: method })}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  data.preferredContact === method
                    ? "border-brand-500 bg-brand-500/[0.08] text-brand-400"
                    : "border-border-faint bg-surface text-text-secondary hover:border-border-muted hover:bg-surface-raised"
                }`}
              >
                <span>{contactIcons[method]}</span>
                {t(method)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
