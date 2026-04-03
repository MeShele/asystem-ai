"use client";

import { useTranslations } from "next-intl";
import { budgets } from "@/lib/validations/request";

const icons = ["💰", "💎", "🏆", "👑", "🤷"];

interface Props {
  value?: string;
  onChange: (v: typeof budgets[number]) => void;
}

export function StepBudget({ value, onChange }: Props) {
  const t = useTranslations("quiz.step4");

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t("title")}</h2>
      <div className="grid grid-cols-1 gap-3">
        {budgets.map((b, i) => (
          <button
            key={b}
            onClick={() => onChange(b)}
            aria-label={t(b)}
            className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-center gap-4 ${
              value === b
                ? "border-brand-500 bg-brand-500/[0.08]"
                : "border-border-faint bg-surface hover:border-border-muted hover:bg-surface-raised"
            }`}
          >
            <span className="text-2xl">{icons[i]}</span>
            <span className="font-semibold">{t(b)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
