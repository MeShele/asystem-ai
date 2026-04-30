import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

type Row = Record<string, unknown>;

/**
 * GET — sub-partners + история override для конкретного партнёра.
 * Используется на странице /admin/partners/[id].
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ partnerId: string }> }) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerId } = await params;
  await initPartnerTables();
  const db = getDb();

  // Sub-partners агрегаты
  const subs = (await db`
    SELECT
      p.partner_id, p.name, p.email, p.phone, p.company,
      p.level, p.is_founding, p.last_activity_at, p.created_at, p.status,
      (SELECT COUNT(*)::int FROM projects WHERE partner_id = p.partner_id AND contract_signed_at IS NOT NULL) AS deals_count,
      (SELECT COALESCE(SUM(total_price), 0) FROM projects WHERE partner_id = p.partner_id AND contract_signed_at IS NOT NULL) AS revenue,
      (SELECT COALESCE(SUM(amount), 0) FROM partner_payouts WHERE partner_id = p.partner_id AND status = 'paid') AS earned,
      (SELECT COALESCE(SUM(override_amount), 0) FROM partner_overrides WHERE referrer_partner_id = ${partnerId} AND sub_partner_id = p.partner_id) AS my_override
    FROM partners p
    WHERE p.referrer_partner_id = ${partnerId}
    ORDER BY p.created_at DESC
  `) as Row[];

  // Все override-начисления этого partner'а как referrer
  const overrides = (await db`
    SELECT
      po.id, po.project_id, po.sub_partner_id,
      po.sub_commission_amount, po.override_pct, po.override_amount, po.sub_level,
      po.status, po.paid_at, po.created_at,
      pr.name AS project_name,
      sp.name AS sub_partner_name
    FROM partner_overrides po
    LEFT JOIN projects pr ON pr.project_id = po.project_id
    LEFT JOIN partners sp ON sp.partner_id = po.sub_partner_id
    WHERE po.referrer_partner_id = ${partnerId}
    ORDER BY po.created_at DESC
  `) as Row[];

  // Кто пригласил этого партнёра
  const referrerRow = (await db`
    SELECT p.referrer_partner_id, ref.name AS referrer_name
    FROM partners p
    LEFT JOIN partners ref ON ref.partner_id = p.referrer_partner_id
    WHERE p.partner_id = ${partnerId}
    LIMIT 1
  `) as Row[];

  const totals = (await db`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'paid' THEN override_amount ELSE 0 END), 0) AS paid,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN override_amount ELSE 0 END), 0) AS pending,
      COALESCE(SUM(override_amount), 0) AS total
    FROM partner_overrides WHERE referrer_partner_id = ${partnerId}
  `) as Row[];

  return NextResponse.json({
    referrer: referrerRow[0]?.referrer_partner_id
      ? { partner_id: referrerRow[0].referrer_partner_id, name: referrerRow[0].referrer_name }
      : null,
    subPartners: subs,
    overrides,
    totals: {
      paid: Number(totals[0]?.paid || 0),
      pending: Number(totals[0]?.pending || 0),
      total: Number(totals[0]?.total || 0),
    },
  });
}
