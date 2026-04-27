import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; payoutId: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, payoutId } = await params;
  const data = await req.json();
  const db = getDb();
  await initProjectTables();

  if ("amount" in data) {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be positive" }, { status: 400 });
    }
    await db`UPDATE partner_payouts SET amount = ${amount} WHERE id = ${payoutId} AND project_id = ${id}`;
  }
  if ("paid_at" in data) {
    await db`UPDATE partner_payouts SET paid_at = ${String(data.paid_at)}::date WHERE id = ${payoutId} AND project_id = ${id}`;
  }
  if ("comment" in data) {
    await db`UPDATE partner_payouts SET comment = ${data.comment ?? null} WHERE id = ${payoutId} AND project_id = ${id}`;
  }

  const updated = await db`SELECT * FROM partner_payouts WHERE id = ${payoutId} LIMIT 1`;
  return NextResponse.json(updated[0] || {});
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; payoutId: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, payoutId } = await params;
  const db = getDb();
  await initProjectTables();

  await db`DELETE FROM partner_payouts WHERE id = ${payoutId} AND project_id = ${id}`;
  return NextResponse.json({ success: true });
}
