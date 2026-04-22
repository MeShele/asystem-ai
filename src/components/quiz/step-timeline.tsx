"use client";

import { useTranslations } from "next-intl";
import { timelines } from "@/lib/validations/request";
import { Zap, CalendarDays, CalendarClock, TreePine } from "lucide-react";

const icons = [Zap, CalendarDays, CalendarClock, TreePine];

interface Props {
  value?: string;
  onChange: (v: (typeof timelines)[number]) => void;
}

export function StepTimeline({ value, onChange }: Props) {
  const t = useTranslations("quiz.step3");

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "#e5e5e5" }}>
        {timelines.map((tl, i) => {
          const Icon = icons[i];
          const selected = value === tl;
          return (
            <button
              key={tl}
              onClick={() => onChange(tl)}
              aria-label={t(tl)}
              className="p-6 text-left transition-all duration-200 flex items-start gap-4"
              style={{
                background: selected ? "#0a0a0a" : "#fff",
                color: selected ? "#fff" : "#0a0a0a",
              }}
            >
              <span
                className="font-mono text-[11px] mt-[6px] shrink-0"
                style={{
                  color: selected ? "#ef4444" : "#9ca3af",
                  letterSpacing: "0.15em",
                }}
              >
                0{i + 1}
              </span>
              <div className="flex-1 flex items-center gap-4">
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  style={{ color: selected ? "#ef4444" : "#525252" }}
                />
                <span
                  className="font-semibold"
                  style={{ fontSize: "15px", color: selected ? "#fff" : "#0a0a0a" }}
                >
                  {t(tl)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
