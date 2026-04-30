import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

type Row = Record<string, unknown>;

/**
 * GET — все override записи для админ-вкладки в /admin/payouts.
 * Поддерживает ?status=pending|paid|all.
 */
export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initPartnerTables();
  const db = getDb();

  const status = req.nextUrl.searchParams.get("status") || "all";

  const rows = status === "all"
    ? (await db`
        SELECT
          po.id, po.referrer_partner_id, po.sub_partner_id, po.project_id,
          po.sub_commission_amount, po.override_pct, po.override_amount, po.sub_level,
          po.status, po.paid_at, po.created_at,
          ref.name AS referrer_name,
          ref.telegram_username AS referrer_tg,
          sp.name AS sub_partner_name,
          pr.name AS project_name
        FROM partner_overrides po
        LEFT JOIN partners ref ON ref.partner_id = po.referrer_partner_id
        LEFT JOIN partners sp ON sp.partner_id = po.sub_partner_id
        LEFT JOIN projects pr ON pr.project_id = po.project_id
        ORDER BY po.created_at DESC
      `) as Row[]
    : (await db`
        SELECT
          po.id, po.referrer_partner_id, po.sub_partner_id, po.project_id,
          po.sub_commission_amount, po.override_pct, po.override_amount, po.sub_level,
          po.status, po.paid_at, po.created_at,
          ref.name AS referrer_name,
          ref.telegram_username AS referrer_tg,
          sp.name AS sub_partner_name,
          pr.name AS project_name
        FROM partner_overrides po
        LEFT JOIN partners ref ON ref.partner_id = po.referrer_partner_id
        LEFT JOIN partners sp ON sp.partner_id = po.sub_partner_id
        LEFT JOIN projects pr ON pr.project_id = po.project_id
        WHERE po.status = ${status}
        ORDER BY po.created_at DESC
      `) as Row[];

  const totalsRow = (await db`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'paid' THEN override_amount ELSE 0 END), 0) AS paid,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN override_amount ELSE 0 END), 0) AS pending
    FROM partner_overrides
  `) as Row[];

  return NextResponse.json({
    items: rows,
    totals: {
      paid: Number(totalsRow[0]?.paid || 0),
      pending: Number(totalsRow[0]?.pending || 0),
    },
  });
}
