"use client";

import { useTranslations } from "next-intl";
import { timelines } from "@/lib/validations/request";

const icons = ["🔥", "📅", "🗓️", "🌿"];

interface Props {
  value?: string;
  onChange: (v: typeof timelines[number]) => void;
}

export function StepTimeline({ value, onChange }: Props) {
  const t = useTranslations("quiz.step3");

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">{t("title")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {timelines.map((tl, i) => (
          <button
            key={tl}
            onClick={() => onChange(tl)}
            aria-label={t(tl)}
            className={`p-5 rounded-xl border text-left transition-all duration-200 ${
              value === tl
                ? "border-brand-500 bg-brand-500/[0.08]"
                : "border-border-faint bg-surface hover:border-border-muted hover:bg-surface-raised"
            }`}
          >
            <span className="text-2xl block mb-2">{icons[i]}</span>
            <span className="font-semibold">{t(tl)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
