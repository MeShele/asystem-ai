export interface Milestone {
  key: string;
  amount: number;
  bonus: number;
  title: string;
  icon: string;
}

export const MILESTONES: Milestone[] = [
  { key: "starter",      amount: 1000,    bonus: 100,    title: "Starter",        icon: "🚀" },
  { key: "rising",       amount: 4000,    bonus: 400,    title: "Rising Star",    icon: "⭐" },
  { key: "professional", amount: 9000,    bonus: 900,    title: "Professional",   icon: "💼" },
  { key: "expert",       amount: 15000,   bonus: 1500,   title: "Expert",         icon: "🏆" },
  { key: "master",       amount: 20000,   bonus: 2000,   title: "Master",         icon: "👑" },
  { key: "elite",        amount: 40000,   bonus: 4000,   title: "Elite Partner",  icon: "💎" },
  { key: "platinum",     amount: 100000,  bonus: 10000,  title: "Platinum",       icon: "🌟" },
  { key: "diamond",      amount: 500000,  bonus: 50000,  title: "Diamond",        icon: "💠" },
  { key: "legend",       amount: 1000000, bonus: 100000, title: "Legend",         icon: "🔥" },
];

export function getCurrentLevel(totalEarned: number): Milestone | null {
  let current: Milestone | null = null;
  for (const m of MILESTONES) {
    if (totalEarned >= m.amount) current = m;
    else break;
  }
  return current;
}

export function getNextLevel(totalEarned: number): Milestone | null {
  for (const m of MILESTONES) {
    if (totalEarned < m.amount) return m;
  }
  return null;
}

export function getProgressToNext(totalEarned: number): number {
  const next = getNextLevel(totalEarned);
  if (!next) return 100;
  const current = getCurrentLevel(totalEarned);
  const base = current ? current.amount : 0;
  const range = next.amount - base;
  return Math.min(100, Math.round(((totalEarned - base) / range) * 100));
}
