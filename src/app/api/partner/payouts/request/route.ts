import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { notifyAdmins } from "@/lib/notify";

// Partner requests payout for a specific project (commission portion not yet covered by paid payouts)
export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const projectId = String(data.project_id || "");
  const amount = Number(data.amount || 0);
  if (!projectId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "project_id and positive amount required" }, { status: 400 });
  }

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  // Verify project belongs to this partner
  const projects = (await db`
    SELECT project_id, total_price, partner_commission_percent
    FROM projects
    WHERE project_id = ${projectId} AND partner_id = ${partnerId}
    LIMIT 1
  `) as Record<string, unknown>[];
  if (projects.length === 0) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const project = projects[0];
  const total = Number(project.total_price || 0);
  const pct = Number(project.partner_commission_percent || 0);
  const fullCommission = Math.round((total * pct) / 100);

  // Already paid + requested (rejected не блокируют — партнёр может перезапросить)
  const sumRow = (await db`
    SELECT
      COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid_sum,
      COALESCE(SUM(CASE WHEN status = 'requested' THEN amount ELSE 0 END), 0) AS pending_sum
    FROM partner_payouts
    WHERE project_id = ${projectId}
  `) as Record<string, unknown>[];
  const paidSum = Number(sumRow[0]?.paid_sum || 0);
  const pendingSum = Number(sumRow[0]?.pending_sum || 0);
  const remaining = Math.max(0, fullCommission - paidSum - pendingSum);

  if (amount > remaining) {
    return NextResponse.json({ error: `amount exceeds remaining (${remaining})` }, { status: 400 });
  }

  const inserted = await db`
    INSERT INTO partner_payouts (project_id, partner_id, amount, paid_at, status, requested_at, comment)
    VALUES (${projectId}, ${partnerId}, ${amount}, CURRENT_DATE, 'requested', NOW(), ${data.comment ?? null})
    RETURNING *
  `;

  // Уведомление админу о новом запросе на выплату
  const partnerInfo = (await db`SELECT name FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Record<string, unknown>[];
  const partnerName = String(partnerInfo[0]?.name || partnerId);
  await notifyAdmins({
    kind: "payout_paid", // используем как general payout-event tone
    title: `Запрос выплаты $${amount.toLocaleString("ru-RU")}`,
    body: `${partnerName} → проект ${projectId}`,
    link: `/admin/payouts`,
    payload: { projectId, partnerId, amount },
  });

  return NextResponse.json(inserted[0]);
}
