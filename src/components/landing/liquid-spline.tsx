"use client";

import { motion } from "framer-motion";
import { Globe2, Bot, Workflow, Smartphone, type LucideIcon } from "lucide-react";

const ICONS: Record<string, { Icon: LucideIcon; alt: string }> = {
  globe: { Icon: Globe2, alt: "Веб-платформы" },
  robot: { Icon: Bot, alt: "AI-боты" },
  gear: { Icon: Workflow, alt: "Автоматизация" },
  phone: { Icon: Smartphone, alt: "Мобильные приложения" },
};

export type SplineKind = keyof typeof ICONS;
export const SPLINE_SCENES = ICONS;

export function LiquidSpline({ kind }: { kind: SplineKind }) {
  const { Icon } = ICONS[kind];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <Icon
          aria-hidden
          strokeWidth={1}
          style={{
            width: "clamp(56px, 7vw, 88px)",
            height: "clamp(56px, 7vw, 88px)",
            color: "#0a0a0a",
            opacity: 0.92,
          }}
        />
      </motion.div>
    </div>
  );
}
