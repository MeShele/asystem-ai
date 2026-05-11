// Partner level system: L1 (10%) → L5 (30%)
// + tier-decay по сумме проекта (большие сделки урезаются мягко)
// Acceptance: deal = project with contract_signed_at IS NOT NULL

export const LEVELS = [
  {
    level: 1,
    title: "Введённый",
    icon: "🌱",
    base_pct: 10,
    color: "blue",
    requirement: "Соглашение + 1 introduction",
  },
  {
    level: 2,
    title: "Активный",
    icon: "🚀",
    base_pct: 14,
    color: "brand",
    requirement: "2 сделки за 90 дней",
  },
  {
    level: 3,
    title: "Эксклюзив",
    icon: "⭐",
    base_pct: 19,
    color: "purple",
    requirement: "5 сделок ИЛИ T2-проект ($30K+) ИЛИ ниша-эксклюзив",
  },
  {
    level: 4,
    title: "Лидер ниши",
    icon: "🏆",
    base_pct: 24,
    color: "amber",
    requirement: "10 сделок за 6 мес ИЛИ $50K+ выручки",
  },
  {
    level: 5,
    title: "Стратегический",
    icon: "👑",
    base_pct: 30,
    color: "gold",
    requirement: "20+ сделок ИЛИ $200K+",
  },
] as const;

/**
 * Tier-decay по сумме проекта.
 * Мелкие сделки — полная ставка. На крупных % мягко падает, но абсолютный $$ всё равно растёт.
 *
 * Применяется к ИТОГОВОМУ % (база + множители), не только к базе.
 * Формула: total × multiplier(amount)
 */
export const TIER_BANDS = [
  { maxAmount: 5_000, multiplier: 1.0, label: "до $5K — полная ставка" },
  { maxAmount: 20_000, multiplier: 0.8, label: "$5K – $20K — ×0.8" },
  { maxAmount: 50_000, multiplier: 0.65, label: "$20K – $50K — ×0.65" },
  { maxAmount: Infinity, multiplier: 0.5, label: "$50K+ — ×0.5" },
] as const;

export function tierDecayMultiplier(amount: number): number {
  for (const band of TIER_BANDS) {
    if (amount <= band.maxAmount) return band.multiplier;
  }
  return TIER_BANDS[TIER_BANDS.length - 1].multiplier;
}

export function tierBandFor(amount: number): typeof TIER_BANDS[number] {
  for (const band of TIER_BANDS) {
    if (amount <= band.maxAmount) return band;
  }
  return TIER_BANDS[TIER_BANDS.length - 1];
}

export const MILESTONE_REWARDS = [
  { threshold: 5000, reward: 500, key: "5k", title: "Первая пятёрка", icon: "🎯" },
  { threshold: 10000, reward: 1000, key: "10k", title: "Десятка", icon: "🔥" },
  { threshold: 20000, reward: 2000, key: "20k", title: "Двадцатка", icon: "💎" },
] as const;

/**
 * Override-комиссия для пригласившего партнёра.
 * Берётся от КОМИССИИ sub-partner (его заработка), не от total_price проекта.
 * Платит студия, а не sub-partner — это инвестиция в реферальный рост сети.
 */
export const SUB_PARTNER_OVERRIDE_PCT: Record<number, number> = {
  1: 3, // sub на L1 → referrer +3% от его комиссии
  2: 4,
  3: 5,
  4: 6,
  5: 8,
};

export function getOverridePct(subLevel: number): number {
  return SUB_PARTNER_OVERRIDE_PCT[subLevel] || 3;
}

export interface PartnerStats {
  totalDeals: number; // contract_signed_at IS NOT NULL
  dealsLast60Days: number; // для retention-бонуса (3 сделки за 60 дней)
  dealsLast90Days: number;
  dealsLast6Months: number;
  totalRevenue: number; // SUM of paid_amount across all signed projects
  hasT2Project: boolean; // any project with tier=T2
  totalEarned: number; // SUM of partner_payouts (status=paid)
}

/**
 * Условие удержания (retention): 3 сделки за 60 дней → авто-продление эксклюзива
 * на 12 месяцев + бонус +5% к комиссии следующих сделок.
 */
export function qualifiesForRetentionBonus(stats: PartnerStats): boolean {
  return stats.dealsLast60Days >= 3;
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
 * Formula: (base(level) + multipliers + founding_bonus) × tier_decay(amount)
 * Multipliers: +5% retention, +10% fast (<30d)
 * Founding: +5% lifetime
 * Tier decay: 1.0 / 0.8 / 0.65 / 0.5 по сумме проекта
 *
 * Штраф за неактивность реализован отдельно — через понижение уровня
 * (enforceInactivityDowngrade). Старый флаг has_churn_penalty оставлен в схеме
 * для backward compat, но в расчёт больше не входит.
 *
 * Если projectAmount не передан — decay не применяется (для UI-карточек уровней).
 */
export function computeCommissionPct({
  level,
  isFounding,
  deliveredIn30Days,
  hasRetentionBonus,
  projectAmount,
}: {
  level: number;
  isFounding: boolean;
  deliveredIn30Days: boolean;
  hasRetentionBonus: boolean;
  /** @deprecated — penalty теперь только через понижение уровня */
  hasChurnPenalty?: boolean;
  projectAmount?: number;
}): {
  base: number;
  bonuses: { label: string; pct: number }[];
  preDecayTotal: number;
  tierMultiplier: number;
  total: number;
} {
  const meta = levelMeta(level);
  const base = meta.base_pct;
  const bonuses: { label: string; pct: number }[] = [];
  if (isFounding) bonuses.push({ label: "Founding partner", pct: 5 });
  if (hasRetentionBonus) bonuses.push({ label: "Retention 12 мес", pct: 5 });
  if (deliveredIn30Days) bonuses.push({ label: "Быстрая сдача (<30 дней)", pct: 10 });
  const preDecayTotal = Math.max(0, base + bonuses.reduce((s, b) => s + b.pct, 0));
  const tierMultiplier = typeof projectAmount === "number" && projectAmount > 0
    ? tierDecayMultiplier(projectAmount)
    : 1;
  const total = Math.round((preDecayTotal * tierMultiplier) * 100) / 100;
  return { base, bonuses, preDecayTotal, tierMultiplier, total };
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
