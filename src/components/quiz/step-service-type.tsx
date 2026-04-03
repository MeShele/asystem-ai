"use client";

import { useTranslations } from "next-intl";
import { serviceTypes } from "@/lib/validations/request";

const icons: Record<string, string> = {
  website: "🌐",
  bot: "🤖",
  app: "📱",
  automation: "⚙️",
  custom: "💡",
};

interface Props {
  value?: string;
  onChange: (v: typeof serviceTypes[number]) => void;
}

export function StepServiceType({ value, onChange }: Props) {
  const t = useTranslations("quiz.step1");

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t("title")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {serviceTypes.map((type) => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`p-5 rounded-xl border text-left transition-all duration-200 ${
              value === type
                ? "border-brand-500 bg-brand-500/[0.08]"
                : "border-border-faint bg-surface hover:border-border-muted hover:bg-surface-raised"
            }`}
          >
            <span className="text-3xl block mb-2">{icons[type]}</span>
            <span className="font-semibold">{t(type)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
