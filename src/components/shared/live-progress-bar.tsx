"use client";

import { motion } from "framer-motion";

type Tone = "brand" | "green" | "amber" | "red" | "purple" | "yellow";
type Variant = "solid" | "gradient";

interface Props {
  /** 0-100 */
  value: number;
  /** When `true` (default for active work), shimmer + diagonal stripes flow inside the bar. */
  live?: boolean;
  tone?: Tone;
  variant?: Variant;
  /** Height in tailwind (default `h-2`). Pass any tailwind h-* class. */
  height?: string;
  className?: string;
  /** Animate from 0 to value on mount */
  animateOnMount?: boolean;
}

const toneFill: Record<Tone, string> = {
  brand: "bg-brand-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  yellow: "bg-yellow-500",
};

const toneGradient: Record<Tone, string> = {
  brand: "bg-gradient-to-r from-brand-500 to-green-500",
  green: "bg-gradient-to-r from-green-500 to-emerald-400",
  amber: "bg-gradient-to-r from-amber-500 to-orange-400",
  red: "bg-gradient-to-r from-red-500 to-rose-400",
  purple: "bg-gradient-to-r from-purple-500 to-fuchsia-400",
  yellow: "bg-gradient-to-r from-yellow-500 to-amber-400",
};

export function LiveProgressBar({
  value,
  live = true,
  tone = "brand",
  variant = "gradient",
  height = "h-2",
  className = "",
  animateOnMount = true,
}: Props) {
  const safeValue = Math.max(0, Math.min(100, value));
  const fill = variant === "gradient" ? toneGradient[tone] : toneFill[tone];

  return (
    <div className={`relative ${height} bg-bg-secondary rounded-full overflow-hidden ${className}`}>
      <motion.div
        className={`absolute inset-y-0 left-0 ${fill} rounded-full`}
        initial={animateOnMount ? { width: 0 } : false}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        {/* live shimmer + stripes overlay (только если live=true и есть хоть какое значение) */}
        {live && safeValue > 0 && (
          <>
            <span className="live-bar-stripes rounded-full" />
            <span className="live-bar-shimmer rounded-full" />
          </>
        )}
      </motion.div>
    </div>
  );
}
