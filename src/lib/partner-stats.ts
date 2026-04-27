import { getDb } from "./db";
import { computeLevel, type PartnerStats } from "./partner-levels";

type Row = Record<string, unknown>;

export async function getPartnerStats(partnerId: string): Promise<PartnerStats> {
  const db = getDb();

  // All "deals" = projects with contract_signed_at IS NOT NULL
  const allDeals = (await db`
    SELECT contract_signed_at, paid_amount, tier, total_price
    FROM projects
    WHERE partner_id = ${partnerId} AND contract_signed_at IS NOT NULL
  `) as Row[];

  const now = Date.now();
  const ms90d = 90 * 24 * 3600 * 1000;
  const ms6mo = 180 * 24 * 3600 * 1000;

  let dealsLast90Days = 0;
  let dealsLast6Months = 0;
  let hasT2Project = false;
  let totalRevenue = 0;
  for (const d of allDeals) {
    const signedAt = d.contract_signed_at ? new Date(d.contract_signed_at as string).getTime() : 0;
    if (now - signedAt <= ms90d) dealsLast90Days++;
    if (now - signedAt <= ms6mo) dealsLast6Months++;
    if (d.tier === "T2") hasT2Project = true;
    totalRevenue += Number(d.paid_amount || 0);
  }

  const earnedRow = (await db`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM partner_payouts
    WHERE partner_id = ${partnerId}
  `) as Row[];
  const totalEarned = Number(earnedRow[0]?.total || 0);

  return {
    totalDeals: allDeals.length,
    dealsLast90Days,
    dealsLast6Months,
    totalRevenue,
    hasT2Project,
    totalEarned,
  };
}

/**
 * Recompute and store partner level. Called whenever a project changes.
 * Writes to partner_level_history if level changed.
 */
export async function recomputePartnerLevel(partnerId: string): Promise<number> {
  const db = getDb();
  const stats = await getPartnerStats(partnerId);
  const newLevel = computeLevel(stats);

  const partners = (await db`SELECT level FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Row[];
  if (partners.length === 0) return newLevel;
  const oldLevel = Number(partners[0].level || 1);

  if (newLevel !== oldLevel) {
    await db`UPDATE partners SET level = ${newLevel} WHERE partner_id = ${partnerId}`;
    const reason = `auto: deals=${stats.totalDeals}, last90=${stats.dealsLast90Days}, last6mo=${stats.dealsLast6Months}, revenue=${stats.totalRevenue}, hasT2=${stats.hasT2Project}`;
    await db`INSERT INTO partner_level_history (partner_id, level, reason) VALUES (${partnerId}, ${newLevel}, ${reason})`;
  }

  return newLevel;
}

/**
 * Update partner.last_activity_at to today. Call when a new project is created or signed.
 */
export async function bumpPartnerActivity(partnerId: string) {
  const db = getDb();
  await db`UPDATE partners SET last_activity_at = CURRENT_DATE WHERE partner_id = ${partnerId}`;
}
