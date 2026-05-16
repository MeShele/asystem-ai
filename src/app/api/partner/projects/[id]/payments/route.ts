import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

type Row = Record<string, unknown>;

/**
 * GET — партнёр видит список оплат по своему проекту + накопленную долю.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const { id } = await params;
  await initProjectTables();
  const db = getDb();

  // Защита: проект должен принадлежать этому партнёру
  const proj = (await db`
    SELECT total_price, paid_amount, partner_commission_percent
    FROM projects WHERE project_id = ${id} AND partner_id = ${partnerId} LIMIT 1
  `) as Row[];
  if (proj.length === 0) return NextResponse.json({ error: "Проект не найден или не привязан к вам" }, { status: 404 });

  const total = Number(proj[0].total_price || 0);
  const paid = Number(proj[0].paid_amount || 0);
  const pct = Number(proj[0].partner_commission_percent || 0);

  const payments = await db`
    SELECT id, amount, note, paid_at
    FROM project_payments WHERE project_id = ${id}
    ORDER BY paid_at DESC, id DESC
  `;

  return NextResponse.json({
    payments,
    summary: {
      total,
      paid,
      remaining: Math.max(0, total - paid),
      partnerPct: pct,
      partnerEarnedSoFar: Math.round((paid * pct) / 100),
      partnerPotential: Math.round((total * pct) / 100),
    },
  });
}
