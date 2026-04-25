import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { MILESTONES, getCurrentLevel, getNextLevel, getProgressToNext } from "@/lib/achievements";

export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const partners = await db`
    SELECT partner_id, name, email, phone, company, ref_code, telegram_id, telegram_username, commission_rate, status, created_at
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
  // Earned = commission from PAID amount of each project
  const totalEarned = projectsRows.reduce((sum: number, p) => {
    const paid = Number(p.paid_amount || 0);
    const pct = Number(p.partner_commission_percent || 0);
    return sum + Math.round((paid * pct) / 100);
  }, 0);

  // Monthly earnings (last 12 months) — based on project paid amounts
  const monthlyEarnings = await db`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
      COALESCE(SUM((paid_amount * partner_commission_percent / 100.0)), 0) as earned
    FROM projects
    WHERE partner_id = ${partnerId}
      AND created_at >= NOW() - INTERVAL '12 months'
    GROUP BY DATE_TRUNC('month', created_at)
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

  const currentLevel = getCurrentLevel(totalEarned);
  const nextLevel = getNextLevel(totalEarned);
  const progressPercent = getProgressToNext(totalEarned);

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
    currentLevel,
    nextLevel,
    progressPercent,
    monthlyEarnings,
  });
}
