import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

type Row = Record<string, unknown>;

/**
 * DELETE — удалить оплату.
 * Вычитает amount из projects.paid_amount.
 * Используется чтобы исправить опечатки.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, paymentId } = await params;
  await initProjectTables();
  const db = getDb();

  const payments = (await db`SELECT amount FROM project_payments WHERE id = ${paymentId} AND project_id = ${id} LIMIT 1`) as Row[];
  if (payments.length === 0) return NextResponse.json({ error: "Оплата не найдена" }, { status: 404 });
  const amount = Number(payments[0].amount || 0);

  await db`DELETE FROM project_payments WHERE id = ${paymentId} AND project_id = ${id}`;

  // Пересчитываем paid_amount как SUM всех оставшихся оплат — это надёжнее чем вычитание
  const sumRows = (await db`SELECT COALESCE(SUM(amount), 0) AS total FROM project_payments WHERE project_id = ${id}`) as Row[];
  const newTotal = Number(sumRows[0]?.total || 0);
  await db`UPDATE projects SET paid_amount = ${newTotal}, updated_at = NOW() WHERE project_id = ${id}`;

  return NextResponse.json({ ok: true, deletedAmount: amount, newPaidAmount: newTotal });
}
