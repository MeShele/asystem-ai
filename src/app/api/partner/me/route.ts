import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { MILESTONES, getCurrentLevel, getNextLevel, getProgressToNext } from "@/lib/achievements";
import { getPartnerStats } from "@/lib/partner-stats";
import { LEVELS, levelMeta, nextLevel, progressToNext, computeCommissionPct } from "@/lib/partner-levels";

export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const partners = await db`
    SELECT partner_id, name, email, phone, company, ref_code, telegram_id, telegram_username, commission_rate, status, created_at,
           level, is_founding, last_activity_at
    FROM partners WHERE partner_id = ${partnerId}
  ` as Record<string, unknown>[];

  if (partners.length === 0) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const partner = partners[0];

  // New system: stats from projects, not legacy partner_clients
  const projectsRows = await db`
    SELECT * FROM projects
    WHERE partner_id = ${partnerId}
    ORDER BY created_at DESC
  ` as Record<string, unknown>[];

  const totalClients = projectsRows.length;
  const activeClients = projectsRows.filter((p) => p.status !== "completed" && p.status !== "cancelled").length;
  const completedClients = projectsRows.filter((p) => p.status === "completed").length;

  // Earned = ACTUAL payouts to partner
  const earnedRow = await db`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM partner_payouts
    WHERE partner_id = ${partnerId}
  ` as Record<string, unknown>[];
  const totalEarned = Number(earnedRow[0]?.total || 0);

  // Monthly earnings (last 12 months) — based on actual payout dates
  const monthlyEarnings = await db`
    SELECT
      TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') as month,
      COALESCE(SUM(amount), 0) as earned
    FROM partner_payouts
    WHERE partner_id = ${partnerId}
      AND paid_at >= (NOW() - INTERVAL '12 months')::date
    GROUP BY DATE_TRUNC('month', paid_at)
    ORDER BY month ASC
  ` as Record<string, unknown>[];

  // Achievements — check and auto-unlock
  const existingAchievements = await db`
    SELECT milestone_key, milestone_amount, bonus_amount, achieved_at, paid
    FROM partner_achievements
    WHERE partner_id = ${partnerId}
  ` as Record<string, unknown>[];

  const achievedKeys = new Set(existingAchievements.map((a) => a.milestone_key as string));

  // Auto-unlock new achievements
  for (const milestone of MILESTONES) {
    if (totalEarned >= milestone.amount && !achievedKeys.has(milestone.key)) {
      await db`
        INSERT INTO partner_achievements (partner_id, milestone_key, milestone_amount, bonus_amount)
        VALUES (${partnerId}, ${milestone.key}, ${milestone.amount}, ${milestone.bonus})
        ON CONFLICT (partner_id, milestone_key) DO NOTHING
      `;
      existingAchievements.push({
        milestone_key: milestone.key,
        milestone_amount: milestone.amount,
        bonus_amount: milestone.bonus,
        achieved_at: new Date().toISOString(),
        paid: false,
      });
      achievedKeys.add(milestone.key);
    }
  }

  // Legacy $-based achievements (we'll deprecate, but keep for backward compat in dashboard until phase 18)
  const legacyCurrentLevel = getCurrentLevel(totalEarned);
  const legacyNextLevel = getNextLevel(totalEarned);
  const legacyProgressPercent = getProgressToNext(totalEarned);

  // NEW: Tier-level system L1-L5
  const partnerStats = await getPartnerStats(partnerId);
  const currentTierLevel = Number(partner.level || 1);
  const tierMeta = levelMeta(currentTierLevel);
  const nextTierMeta = nextLevel(currentTierLevel);
  const tierProgress = progressToNext(partnerStats, currentTierLevel);
  const baseCommission = computeCommissionPct({
    level: currentTierLevel,
    isFounding: Boolean(partner.is_founding),
    deliveredIn30Days: false,
    hasRetentionBonus: false,
    hasChurnPenalty: false,
  });

  return NextResponse.json({
    partner,
    clients: [],
    stats: {
      totalClients,
      activeClients,
      completedClients,
      totalEarned,
    },
    achievements: existingAchievements,
    milestones: MILESTONES,
    currentLevel: legacyCurrentLevel,
    nextLevel: legacyNextLevel,
    progressPercent: legacyProgressPercent,
    monthlyEarnings,
    // NEW partner level system
    tierSystem: {
      levels: LEVELS,
      currentLevel: currentTierLevel,
      currentMeta: tierMeta,
      nextMeta: nextTierMeta,
      progress: tierProgress,
      baseCommission,
      acceptanceStats: partnerStats,
    },
  });
}
