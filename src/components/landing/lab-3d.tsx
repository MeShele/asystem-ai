"use client";

import { motion } from "framer-motion";
import {
  Calculator,
  BadgePercent,
  ScanSearch,
  Send,
  Activity,
  RefreshCw,
  Terminal,
  ArrowDownUp,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type LabShape = string;

const SHAPE_TO_ICON: Record<string, LucideIcon> = {
  "partner-calc": Calculator,
  "mvp-no-prepay": BadgePercent,
  "ai-audit": ScanSearch,
  "tg-bot": Send,
  realtime: Activity,
  "crm-sync": RefreshCw,
  "ascii-easter": Terminal,
  inversion: ArrowDownUp,
};

function pickIcon(path: string): LucideIcon {
  const m = path.match(/\/lab(?:-v2)?\/([^./]+)/);
  if (!m) return Sparkles;
  return SHAPE_TO_ICON[m[1]] ?? Sparkles;
}

export function LabCanvas({ shape }: { shape: LabShape; color?: string }) {
  const Icon = pickIcon(shape);
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
            width: "clamp(48px, 6vw, 72px)",
            height: "clamp(48px, 6vw, 72px)",
            color: "#0a0a0a",
            opacity: 0.92,
          }}
        />
      </motion.div>
    </div>
  );
}
