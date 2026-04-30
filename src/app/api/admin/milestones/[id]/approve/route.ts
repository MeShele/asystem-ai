import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import { notify } from "@/lib/notify";

type Row = Record<string, unknown>;

// Approve milestone reward claim → status 'paid', paid_at = today
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  await db`UPDATE partner_milestone_claims SET status = 'paid', paid_at = CURRENT_DATE WHERE id = ${id}`;
  const rows = await db`SELECT * FROM partner_milestone_claims WHERE id = ${id} LIMIT 1` as Row[];
  const r = rows[0];
  if (r?.partner_id) {
    const amt = Number(r.amount || 0);
    await notify({
      userRole: "partner",
      userId: String(r.partner_id),
      kind: "milestone_paid",
      title: `Награда $${amt.toLocaleString("ru-RU")} выплачена`,
      body: `Mини-награда «${r.milestone_key}» зачислена.`,
      link: `/partner/payouts`,
      payload: { milestoneId: id },
    });
  }
  return NextResponse.json(r || {});
}
