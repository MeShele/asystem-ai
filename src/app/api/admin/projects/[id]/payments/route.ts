import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import { notify } from "@/lib/notify";

type Row = Record<string, unknown>;

/** GET — список оплат проекта */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await initProjectTables();
  const db = getDb();

  const rows = await db`
    SELECT id, amount, note, paid_at, created_at
    FROM project_payments
    WHERE project_id = ${id}
    ORDER BY paid_at DESC, id DESC
  `;
  return NextResponse.json(rows);
}

/**
 * POST — добавить оплату { amount, note?, paid_at? }
 * Приплюсовывает к projects.paid_amount, уведомляет партнёра и клиента.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json().catch(() => ({}));
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Сумма должна быть положительным числом" }, { status: 400 });
  }
  const note = typeof data.note === "string" && data.note.trim() ? data.note.trim().slice(0, 200) : null;
  const paidAt = typeof data.paid_at === "string" && data.paid_at ? data.paid_at : null;

  await initProjectTables();
  const db = getDb();

  const projRows = (await db`
    SELECT project_id, name, total_price, paid_amount, partner_id, client_id, partner_commission_percent
    FROM projects WHERE project_id = ${id} OR id::text = ${id} LIMIT 1
  `) as Row[];
  if (projRows.length === 0) return NextResponse.json({ error: "Проект не найден" }, { status: 404 });

  const proj = projRows[0];
  const total = Number(proj.total_price || 0);
  const alreadyPaid = Number(proj.paid_amount || 0);
  if (total > 0 && alreadyPaid + amount > total) {
    return NextResponse.json({
      error: `Сумма $${(alreadyPaid + amount).toLocaleString("ru-RU")} превышает стоимость проекта $${total.toLocaleString("ru-RU")}`,
    }, { status: 400 });
  }

  // INSERT записи + UPDATE paid_amount
  const inserted = paidAt
    ? await db`
        INSERT INTO project_payments (project_id, amount, note, paid_at)
        VALUES (${String(proj.project_id)}, ${amount}, ${note}, ${paidAt}::date)
        RETURNING *
      `
    : await db`
        INSERT INTO project_payments (project_id, amount, note)
        VALUES (${String(proj.project_id)}, ${amount}, ${note})
        RETURNING *
      `;

  await db`UPDATE projects SET paid_amount = ${alreadyPaid + amount}, updated_at = NOW() WHERE project_id = ${String(proj.project_id)}`;

  const projId = String(proj.project_id);
  const projName = String(proj.name || "");
  const newPaid = alreadyPaid + amount;
  const remaining = Math.max(0, total - newPaid);
  const pct = Number(proj.partner_commission_percent || 0);
  const partnerShare = Math.round((amount * pct) / 100);

  if (proj.partner_id) {
    await notify({
      userRole: "partner",
      userId: String(proj.partner_id),
      kind: "payout_paid",
      title: `💰 Оплата по проекту: +$${amount.toLocaleString("ru-RU")}`,
      body: `«${projName}» — оплачено +$${amount.toLocaleString("ru-RU")}${note ? ` (${note})` : ""}. Остаток $${remaining.toLocaleString("ru-RU")}. Твоя доля с этой оплаты ≈ $${partnerShare.toLocaleString("ru-RU")}`,
      link: `/partner/projects/${projId}`,
      payload: { projectId: projId, amount, remaining, partnerShare },
    });
  }
  if (proj.client_id) {
    await notify({
      userRole: "client",
      userId: String(proj.client_id),
      kind: "payout_paid",
      title: `Оплата зафиксирована: +$${amount.toLocaleString("ru-RU")}`,
      body: `«${projName}» — спасибо за оплату $${amount.toLocaleString("ru-RU")}${note ? ` (${note})` : ""}. Остаток $${remaining.toLocaleString("ru-RU")}.`,
      link: `/client/projects/${projId}`,
      payload: { projectId: projId, amount, remaining },
    });
  }

  return NextResponse.json(inserted[0]);
}
