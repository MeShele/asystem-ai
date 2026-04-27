"use client";

import { useTranslations } from "next-intl";
import { serviceTypes } from "@/lib/validations/request";
import { Globe, Bot, Smartphone, Cog, Lightbulb } from "lucide-react";

type LucideIconProps = { size?: number; strokeWidth?: number; className?: string; style?: React.CSSProperties };

const icons: Record<string, React.ComponentType<LucideIconProps>> = {
  website: Globe,
  bot: Bot,
  app: Smartphone,
  automation: Cog,
  custom: Lightbulb,
};

interface Props {
  value?: string;
  onChange: (v: (typeof serviceTypes)[number]) => void;
}

export function StepServiceType({ value, onChange }: Props) {
  const t = useTranslations("quiz.step1");

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ background: "#e5e5e5" }}>
        {serviceTypes.map((type, i) => {
          const Icon = icons[type];
          const selected = value === type;
          return (
            <button
              key={type}
              onClick={() => onChange(type)}
              className="p-6 text-left transition-all duration-200 flex items-start gap-4 group"
              style={{
                background: selected ? "#0a0a0a" : "#fff",
                color: selected ? "#fff" : "#0a0a0a",
              }}
            >
              <span
                className="font-mono text-[11px] mt-[6px] shrink-0"
                style={{
                  color: selected ? "#2563EB" : "#9ca3af",
                  letterSpacing: "0.15em",
                }}
              >
                0{i + 1}
              </span>
              <div className="flex-1 flex items-center gap-4">
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  style={{ color: selected ? "#2563EB" : "#525252" }}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontSize: "15px",
                    color: selected ? "#fff" : "#0a0a0a",
                  }}
                >
                  {t(type)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
