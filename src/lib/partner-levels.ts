// Partner level system: L1 (15%) → L5 (40%)
// Acceptance: deal = project with contract_signed_at IS NOT NULL

export const LEVELS = [
  {
    level: 1,
    title: "Введённый",
    icon: "🌱",
    base_pct: 15,
    color: "blue",
    requirement: "Соглашение + 1 introduction",
  },
  {
    level: 2,
    title: "Активный",
    icon: "🚀",
    base_pct: 20,
    color: "brand",
    requirement: "2 сделки за 90 дней",
  },
  {
    level: 3,
    title: "Эксклюзив",
    icon: "⭐",
    base_pct: 25,
    color: "purple",
    requirement: "5 сделок ИЛИ T2-проект ($30K+) ИЛИ ниша-эксклюзив",
  },
  {
    level: 4,
    title: "Лидер ниши",
    icon: "🏆",
    base_pct: 30,
    color: "amber",
    requirement: "10 сделок за 6 мес ИЛИ $50K+ выручки",
  },
  {
    level: 5,
    title: "Стратегический",
    icon: "👑",
    base_pct: 40,
    color: "gold",
    requirement: "20+ сделок ИЛИ $200K+",
  },
] as const;

export const MILESTONE_REWARDS = [
  { threshold: 5000, reward: 500, key: "5k", title: "Первая пятёрка", icon: "🎯" },
  { threshold: 10000, reward: 1000, key: "10k", title: "Десятка", icon: "🔥" },
  { threshold: 20000, reward: 2000, key: "20k", title: "Двадцатка", icon: "💎" },
] as const;

export interface PartnerStats {
  totalDeals: number; // contract_signed_at IS NOT NULL
  dealsLast90Days: number;
  dealsLast6Months: number;
  totalRevenue: number; // SUM of paid_amount across all signed projects
  hasT2Project: boolean; // any project with tier=T2
  totalEarned: number; // SUM of partner_payouts (status=paid)
}

/**
 * Compute level from acceptance criteria.
 * L5: 20+ deals OR $200K+ revenue
 * L4: 10+ deals in 6mo OR $50K+ revenue
 * L3: 5+ deals OR has T2 project (≥$30K)
 * L2: 2+ deals in 90 days
 * L1: default (signed agreement)
 */
export function computeLevel(stats: PartnerStats): number {
  if (stats.totalDeals >= 20 || stats.totalRevenue >= 200_000) return 5;
  if (stats.dealsLast6Months >= 10 || stats.totalRevenue >= 50_000) return 4;
  if (stats.totalDeals >= 5 || stats.hasT2Project) return 3;
  if (stats.dealsLast90Days >= 2) return 2;
  return 1;
}

export function levelMeta(level: number) {
  return LEVELS.find((l) => l.level === level) || LEVELS[0];
}

export function nextLevel(level: number): typeof LEVELS[number] | null {
  return LEVELS.find((l) => l.level === level + 1) || null;
}

/**
 * Compute effective commission % for a project.
 * Formula: base(level) + multipliers + founding_bonus
 * Multipliers: +5% retention, +10% fast (<30d), -5% churn
 * Founding: +5% lifetime
 */
export function computeCommissionPct({
  level,
  isFounding,
  deliveredIn30Days,
  hasRetentionBonus,
  hasChurnPenalty,
}: {
  level: number;
  isFounding: boolean;
  deliveredIn30Days: boolean;
  hasRetentionBonus: boolean;
  hasChurnPenalty: boolean;
}): { base: number; bonuses: { label: string; pct: number }[]; total: number } {
  const meta = levelMeta(level);
  const base = meta.base_pct;
  const bonuses: { label: string; pct: number }[] = [];
  if (isFounding) bonuses.push({ label: "Founding partner", pct: 5 });
  if (hasRetentionBonus) bonuses.push({ label: "Retention 12 мес", pct: 5 });
  if (deliveredIn30Days) bonuses.push({ label: "Быстрая сдача (<30 дней)", pct: 10 });
  if (hasChurnPenalty) bonuses.push({ label: "Churn penalty (60 дн неактивности)", pct: -5 });
  const total = Math.max(0, base + bonuses.reduce((s, b) => s + b.pct, 0));
  return { base, bonuses, total };
}

/**
 * Progress to next level (0-100). For UI progress bar.
 */
export function progressToNext(stats: PartnerStats, currentLevel: number): {
  percent: number;
  hint: string;
} {
  if (currentLevel >= 5) {
    return { percent: 100, hint: "Максимальный уровень — продолжайте удерживать достижения" };
  }
  if (currentLevel === 1) {
    // Need 2 deals in 90d for L2
    const pct = Math.min(100, (stats.dealsLast90Days / 2) * 100);
    return { percent: pct, hint: `${stats.dealsLast90Days}/2 сделок за 90 дней до L2 «Активный»` };
  }
  if (currentLevel === 2) {
    // Need 5 deals total OR T2 for L3
    const dealsPct = (stats.totalDeals / 5) * 100;
    const t2Pct = stats.hasT2Project ? 100 : 0;
    const pct = Math.min(100, Math.max(dealsPct, t2Pct));
    return { percent: pct, hint: `${stats.totalDeals}/5 сделок или T2-проект ($30K+) до L3 «Эксклюзив»` };
  }
  if (currentLevel === 3) {
    // Need 10 deals in 6mo OR $50K for L4
    const dealsPct = (stats.dealsLast6Months / 10) * 100;
    const revPct = (stats.totalRevenue / 50_000) * 100;
    const pct = Math.min(100, Math.max(dealsPct, revPct));
    return {
      percent: pct,
      hint: `${stats.dealsLast6Months}/10 сделок за 6 мес или $${stats.totalRevenue.toLocaleString("ru-RU")}/$50 000 до L4`,
    };
  }
  if (currentLevel === 4) {
    // Need 20 deals OR $200K for L5
    const dealsPct = (stats.totalDeals / 20) * 100;
    const revPct = (stats.totalRevenue / 200_000) * 100;
    const pct = Math.min(100, Math.max(dealsPct, revPct));
    return {
      percent: pct,
      hint: `${stats.totalDeals}/20 сделок или $${stats.totalRevenue.toLocaleString("ru-RU")}/$200 000 до L5`,
    };
  }
  return { percent: 0, hint: "" };
}
