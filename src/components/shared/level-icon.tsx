"use client";

import { Sprout, Rocket, Sparkles, Crown, Gem, Target, Flame, Award, Trophy, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tone = "blue" | "brand" | "purple" | "amber" | "gold" | "green" | "red" | "muted";

const TONE_CLASSES: Record<Tone, { bg: string; glow: string; text: string }> = {
  blue: { bg: "bg-blue-500/12", glow: "shadow-[0_0_0_3px_rgba(59,130,246,0.18)]", text: "text-blue-500" },
  brand: { bg: "bg-brand-500/12", glow: "shadow-[0_0_0_3px_rgba(37,99,235,0.18)]", text: "text-brand-500" },
  purple: { bg: "bg-purple-500/12", glow: "shadow-[0_0_0_3px_rgba(168,85,247,0.18)]", text: "text-purple-500" },
  amber: { bg: "bg-amber-500/12", glow: "shadow-[0_0_0_3px_rgba(245,158,11,0.18)]", text: "text-amber-500" },
  gold: { bg: "bg-gradient-to-br from-amber-300/30 to-amber-500/20", glow: "shadow-[0_0_0_3px_rgba(251,191,36,0.22)]", text: "text-amber-500" },
  green: { bg: "bg-green-500/12", glow: "shadow-[0_0_0_3px_rgba(16,185,129,0.18)]", text: "text-green-500" },
  red: { bg: "bg-red-500/12", glow: "shadow-[0_0_0_3px_rgba(239,68,68,0.18)]", text: "text-red-500" },
  muted: { bg: "bg-bg-secondary", glow: "", text: "text-text-muted" },
};

const SIZES = {
  sm: { box: "w-7 h-7", icon: "w-3.5 h-3.5", radius: "rounded-md" },
  md: { box: "w-10 h-10", icon: "w-5 h-5", radius: "rounded-xl" },
  lg: { box: "w-14 h-14", icon: "w-7 h-7", radius: "rounded-2xl" },
  xl: { box: "w-20 h-20", icon: "w-10 h-10", radius: "rounded-3xl" },
};

const LEVEL_ICONS: Record<number, { Icon: LucideIcon; tone: Tone }> = {
  1: { Icon: Sprout, tone: "blue" },
  2: { Icon: Rocket, tone: "brand" },
  3: { Icon: Sparkles, tone: "purple" },
  4: { Icon: Trophy, tone: "amber" },
  5: { Icon: Crown, tone: "gold" },
};

const MILESTONE_ICONS: Record<string, { Icon: LucideIcon; tone: Tone }> = {
  "5k": { Icon: Target, tone: "blue" },
  "10k": { Icon: Flame, tone: "amber" },
  "20k": { Icon: Gem, tone: "purple" },
  founding: { Icon: Star, tone: "amber" },
  retention: { Icon: Award, tone: "green" },
};

interface LevelIconProps {
  level: number;
  size?: keyof typeof SIZES;
  /** ring-обводка: для текущего уровня партнёра */
  active?: boolean;
  /** уровень пройден (галочка) */
  passed?: boolean;
  className?: string;
}

export function LevelIcon({ level, size = "md", active = false, passed = false, className = "" }: LevelIconProps) {
  const meta = LEVEL_ICONS[level] || LEVEL_ICONS[1];
  const tone = passed ? "green" : meta.tone;
  const t = TONE_CLASSES[tone];
  const s = SIZES[size];
  const Icon = meta.Icon;

  return (
    <div
      className={`${s.box} ${s.radius} ${t.bg} flex items-center justify-center flex-shrink-0 transition-shadow ${
        active ? t.glow : ""
      } ${className}`}
    >
      <Icon className={`${s.icon} ${t.text}`} strokeWidth={2.2} />
    </div>
  );
}

interface MilestoneIconProps {
  kind: keyof typeof MILESTONE_ICONS;
  size?: keyof typeof SIZES;
  className?: string;
}

export function MilestoneIcon({ kind, size = "md", className = "" }: MilestoneIconProps) {
  const meta = MILESTONE_ICONS[kind] || MILESTONE_ICONS["5k"];
  const t = TONE_CLASSES[meta.tone];
  const s = SIZES[size];
  const Icon = meta.Icon;

  return (
    <div className={`${s.box} ${s.radius} ${t.bg} flex items-center justify-center flex-shrink-0 ${className}`}>
      <Icon className={`${s.icon} ${t.text}`} strokeWidth={2.2} />
    </div>
  );
}

export function getLevelIconMeta(level: number) {
  return LEVEL_ICONS[level] || LEVEL_ICONS[1];
}
