import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { MILESTONES, getCurrentLevel, getNextLevel, getProgressToNext } from "@/lib/achievements";
import { notify } from "@/lib/notify";
import { getPartnerStats, getDaysSinceLastActivity, enforceExclusivityRule } from "@/lib/partner-stats";
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

  // Earned = ACTUAL paid payouts (status='paid')
  const earnedRow = await db`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM partner_payouts
    WHERE partner_id = ${partnerId} AND status = 'paid'
  ` as Record<string, unknown>[];
  const totalEarned = Number(earnedRow[0]?.total || 0);

  // Pending payouts (requested, not yet approved)
  const pendingRow = await db`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM partner_payouts
    WHERE partner_id = ${partnerId} AND status = 'requested'
  ` as Record<string, unknown>[];
  const pendingPayouts = Number(pendingRow[0]?.total || 0);

  // Milestone claims status
  const milestoneClaims = await db`
    SELECT milestone_key, status, amount, paid_at, requested_at, rejection_comment
    FROM partner_milestone_claims
    WHERE partner_id = ${partnerId}
  ` as Record<string, unknown>[];

  // Monthly earnings (last 12 months) — based on actual payout dates (paid only)
  const monthlyEarnings = await db`
    SELECT
      TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') as month,
      COALESCE(SUM(amount), 0) as earned
    FROM partner_payouts
    WHERE partner_id = ${partnerId}
      AND status = 'paid'
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
      // Уведомление: новая мини-награда разблокирована
      await notify({
        userRole: "partner",
        userId: partnerId,
        kind: "milestone_unlocked",
        title: `Открыта награда «${milestone.title || milestone.key}»`,
        body: `Заработали $${milestone.amount.toLocaleString("ru-RU")} — заберите бонус $${milestone.bonus.toLocaleString("ru-RU")}.`,
        link: `/partner/achievements`,
        payload: { milestoneKey: milestone.key, bonus: milestone.bonus },
      });
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

  // Enforce exclusivity rule (may downgrade L3+ → L1 if inactive 60+ days with <3 deals)
  await enforceExclusivityRule(partnerId);

  // Re-read partner level after potential downgrade
  const refreshed = await db`SELECT level, is_founding, last_activity_at FROM partners WHERE partner_id = ${partnerId} LIMIT 1` as Record<string, unknown>[];
  if (refreshed.length > 0) {
    partner.level = refreshed[0].level;
    partner.is_founding = refreshed[0].is_founding;
    partner.last_activity_at = refreshed[0].last_activity_at;
  }

  // NEW: Tier-level system L1-L5
  const partnerStats = await getPartnerStats(partnerId);
  const daysSinceActivity = await getDaysSinceLastActivity(partnerId);
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

  // Network summary — sub-partners + override
  const networkRow = (await db`
    SELECT
      (SELECT COUNT(*)::int FROM partners WHERE referrer_partner_id = ${partnerId}) AS total_subs,
      (SELECT COUNT(*)::int FROM partners
        WHERE referrer_partner_id = ${partnerId}
          AND last_activity_at >= (CURRENT_DATE - INTERVAL '90 days')
          AND EXISTS (SELECT 1 FROM projects WHERE partner_id = partners.partner_id AND contract_signed_at IS NOT NULL)
      ) AS active_subs,
      (SELECT COALESCE(SUM(override_amount), 0) FROM partner_overrides WHERE referrer_partner_id = ${partnerId}) AS override_total,
      (SELECT COALESCE(SUM(override_amount), 0) FROM partner_overrides WHERE referrer_partner_id = ${partnerId} AND status = 'paid') AS override_paid,
      (SELECT COALESCE(SUM(t.revenue), 0) FROM (
        SELECT COALESCE(SUM(p.total_price), 0) AS revenue
        FROM partners sub
        LEFT JOIN projects p ON p.partner_id = sub.partner_id AND p.contract_signed_at IS NOT NULL
        WHERE sub.referrer_partner_id = ${partnerId}
        GROUP BY sub.partner_id
      ) t) AS sub_revenue
  `) as Record<string, unknown>[];

  const network = {
    totalSubs: Number(networkRow[0]?.total_subs || 0),
    activeSubs: Number(networkRow[0]?.active_subs || 0),
    overrideTotal: Number(networkRow[0]?.override_total || 0),
    overridePaid: Number(networkRow[0]?.override_paid || 0),
    subRevenue: Number(networkRow[0]?.sub_revenue || 0),
  };

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
      daysSinceActivity, // null if never active, otherwise N days
    },
    // Phase 16: pending and milestones
    pendingPayouts,
    milestoneClaims,
    // Phase 19: sub-partner network
    network,
  });
}
