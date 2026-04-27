import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { MILESTONE_REWARDS } from "@/lib/partner-levels";

export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { milestone_key } = await req.json();
  const milestone = MILESTONE_REWARDS.find((m) => m.key === milestone_key);
  if (!milestone) return NextResponse.json({ error: "unknown milestone" }, { status: 400 });

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  // Verify partner has earned enough (totalEarned = SUM of paid payouts)
  const earnedRow = (await db`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM partner_payouts
    WHERE partner_id = ${partnerId} AND status = 'paid'
  `) as Record<string, unknown>[];
  const totalEarned = Number(earnedRow[0]?.total || 0);

  if (totalEarned < milestone.threshold) {
    return NextResponse.json({ error: `not eligible (earned ${totalEarned} < ${milestone.threshold})` }, { status: 400 });
  }

  // Already claimed?
  const existing = (await db`
    SELECT id, status FROM partner_milestone_claims
    WHERE partner_id = ${partnerId} AND milestone_key = ${milestone_key}
    LIMIT 1
  `) as Record<string, unknown>[];
  if (existing.length > 0) {
    return NextResponse.json({ error: `already ${existing[0].status}` }, { status: 400 });
  }

  const inserted = await db`
    INSERT INTO partner_milestone_claims (partner_id, milestone_key, threshold, amount, status)
    VALUES (${partnerId}, ${milestone_key}, ${milestone.threshold}, ${milestone.reward}, 'requested')
    RETURNING *
  `;
  return NextResponse.json(inserted[0]);
}
