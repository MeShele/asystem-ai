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

  await db`UPDATE partner_milestone_claims SET status = 'rejected', rejection_comment = ${comment} WHERE id = ${id}`;
  const rows = await db`SELECT * FROM partner_milestone_claims WHERE id = ${id} LIMIT 1` as Row[];
  const r = rows[0];
  if (r?.partner_id) {
    await notify({
      userRole: "partner",
      userId: String(r.partner_id),
      kind: "milestone_rejected",
      title: `Награда «${r.milestone_key}» отклонена`,
      body: comment,
      link: `/partner/achievements`,
      payload: { milestoneId: id, comment },
    });
  }
  return NextResponse.json(r || {});
}
