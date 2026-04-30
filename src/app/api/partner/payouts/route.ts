import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

/**
 * История всех выплат партнёра.
 * Включает обычные комиссионные (partner_payouts) + claimed milestone-награды (partner_milestone_claims).
 * Возвращает единый отсортированный список с типом, статусом, суммой, проектом.
 */
export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initPartnerTables();
  const db = getDb();

  // Обычные комиссии — со ссылкой на проект (название + project_id)
  const commissions = (await db`
    SELECT
      pp.id,
      'commission' AS kind,
      pp.amount,
      pp.status,
      pp.paid_at,
      pp.requested_at,
      pp.created_at,
      pp.comment,
      pp.rejection_comment,
      pp.project_id,
      p.name AS project_name
    FROM partner_payouts pp
    LEFT JOIN projects p ON p.project_id = pp.project_id
    WHERE pp.partner_id = ${partnerId}
    ORDER BY COALESCE(pp.requested_at, pp.created_at) DESC
  `) as Record<string, unknown>[];

  // Mini-rewards
  const milestones = (await db`
    SELECT
      id,
      'milestone' AS kind,
      milestone_key,
      threshold,
      amount,
      status,
      paid_at,
      requested_at,
      comment,
      rejection_comment
    FROM partner_milestone_claims
    WHERE partner_id = ${partnerId}
    ORDER BY requested_at DESC
  `) as Record<string, unknown>[];

  // Суммарные показатели
  const totals = {
    paid: 0,
    requested: 0,
    rejected: 0,
  };
  for (const r of [...commissions, ...milestones]) {
    const amt = Number(r.amount || 0);
    const st = String(r.status || "");
    if (st === "paid") totals.paid += amt;
    else if (st === "requested") totals.requested += amt;
    else if (st === "rejected") totals.rejected += amt;
  }

  return NextResponse.json({
    totals,
    commissions,
    milestones,
  });
}
