import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { levelMeta } from "@/lib/partner-levels";

type Row = Record<string, unknown>;

/**
 * GET — данные для страницы «Мои партнёры»:
 *  - sub_partners: партнёры, зарегавшиеся по моей реф-ссылке (referrer_partner_id = me)
 *  - overrides: история override-начислений
 *  - totals: суммы paid/pending/total
 *  - monthly: помесячный override-доход
 */
export async function GET(req: NextRequest) {
  const me = req.cookies.get("partner_session")?.value;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initPartnerTables();
  const db = getDb();

  // Список приглашённых партнёров с агрегатами
  const subPartners = (await db`
    SELECT
      p.partner_id,
      p.name,
      p.email,
      p.company,
      p.level,
      p.is_founding,
      p.last_activity_at,
      p.created_at,
      (SELECT COUNT(*)::int FROM projects WHERE partner_id = p.partner_id AND contract_signed_at IS NOT NULL) AS deals_count,
      (SELECT COALESCE(SUM(total_price), 0) FROM projects WHERE partner_id = p.partner_id AND contract_signed_at IS NOT NULL) AS revenue,
      (SELECT COALESCE(SUM(amount), 0) FROM partner_payouts WHERE partner_id = p.partner_id AND status = 'paid') AS earned,
      (SELECT COALESCE(SUM(override_amount), 0) FROM partner_overrides WHERE referrer_partner_id = ${me} AND sub_partner_id = p.partner_id) AS my_override
    FROM partners p
    WHERE p.referrer_partner_id = ${me}
    ORDER BY p.created_at DESC
  `) as Row[];

  // История override
  const overrides = (await db`
    SELECT
      po.id, po.project_id, po.sub_partner_id, po.sub_commission_amount, po.override_pct,
      po.override_amount, po.sub_level, po.status, po.paid_at, po.created_at,
      pr.name AS project_name,
      p.name AS sub_partner_name
    FROM partner_overrides po
    LEFT JOIN projects pr ON pr.project_id = po.project_id
    LEFT JOIN partners p ON p.partner_id = po.sub_partner_id
    WHERE po.referrer_partner_id = ${me}
    ORDER BY po.created_at DESC
    LIMIT 50
  `) as Row[];

  // Сводки
  const totalsRow = (await db`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'paid' THEN override_amount ELSE 0 END), 0) AS paid,
      COALESCE(SUM(CASE WHEN status = 'pending' THEN override_amount ELSE 0 END), 0) AS pending,
      COALESCE(SUM(override_amount), 0) AS total
    FROM partner_overrides
    WHERE referrer_partner_id = ${me}
  `) as Row[];

  // Помесячная динамика (текущий + 5 последних месяцев)
  const monthly = (await db`
    SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
           COALESCE(SUM(override_amount), 0) AS amount
    FROM partner_overrides
    WHERE referrer_partner_id = ${me}
      AND created_at >= (NOW() - INTERVAL '6 months')::date
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month ASC
  `) as Row[];

  // Активные sub-partners (есть сделка за 90 дней)
  const activeCount = subPartners.filter((s) => {
    return Number(s.deals_count || 0) > 0 && s.last_activity_at &&
      (Date.now() - new Date(s.last_activity_at as string).getTime()) <= 90 * 24 * 3600 * 1000;
  }).length;

  return NextResponse.json({
    subPartners: subPartners.map((s) => ({
      ...s,
      level_meta: levelMeta(Number(s.level || 1)),
    })),
    overrides,
    totals: {
      paid: Number(totalsRow[0]?.paid || 0),
      pending: Number(totalsRow[0]?.pending || 0),
      total: Number(totalsRow[0]?.total || 0),
    },
    counts: {
      total: subPartners.length,
      active: activeCount,
    },
    monthly,
  });
}
