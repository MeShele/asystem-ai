import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import { notify } from "@/lib/notify";

type Row = Record<string, unknown>;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json().catch(() => ({}));
  const comment = String(data.comment || "").trim();
  if (!comment) {
    return NextResponse.json({ error: "Комментарий обязателен" }, { status: 400 });
  }

  const db = getDb();
  await initProjectTables();

  await db`UPDATE partner_payouts SET status = 'rejected', rejection_comment = ${comment} WHERE id = ${id}`;
  const rows = await db`SELECT pp.*, p.name AS project_name FROM partner_payouts pp LEFT JOIN projects p ON p.project_id = pp.project_id WHERE pp.id = ${id} LIMIT 1` as Row[];
  const r = rows[0];
  if (r?.partner_id) {
    const amt = Number(r.amount || 0);
    await notify({
      userRole: "partner",
      userId: String(r.partner_id),
      kind: "payout_rejected",
      title: `Выплата $${amt.toLocaleString("ru-RU")} отклонена`,
      body: comment,
      link: `/partner/payouts`,
      payload: { payoutId: id, comment },
    });
  }
  return NextResponse.json(r || {});
}
