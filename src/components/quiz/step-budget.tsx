"use client";

import { useTranslations } from "next-intl";
import { budgets } from "@/lib/validations/request";

interface Props {
  value?: string;
  onChange: (v: (typeof budgets)[number]) => void;
}

export function StepBudget({ value, onChange }: Props) {
  const t = useTranslations("quiz.step4");

  return (
    <div>
      <div className="flex flex-col gap-px" style={{ background: "#e5e5e5" }}>
        {budgets.map((b, i) => {
          const selected = value === b;
          return (
            <button
              key={b}
              onClick={() => onChange(b)}
              aria-label={t(b)}
              className="p-5 text-left transition-all duration-200 flex items-center gap-5"
              style={{
                background: selected ? "#0a0a0a" : "#fff",
                color: selected ? "#fff" : "#0a0a0a",
              }}
            >
              <span
                className="font-mono text-[11px] shrink-0"
                style={{
                  color: selected ? "#2563EB" : "#9ca3af",
                  letterSpacing: "0.15em",
                }}
              >
                0{i + 1}
              </span>
              <span
                className="font-semibold flex-1"
                style={{ fontSize: "15px", color: selected ? "#fff" : "#0a0a0a" }}
              >
                {t(b)}
              </span>
              {selected && (
                <span
                  className="font-mono text-[10px]"
                  style={{ color: "#2563EB", letterSpacing: "0.15em" }}
                >
                  SELECTED →
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
