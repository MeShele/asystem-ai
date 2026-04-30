import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { notify } from "@/lib/notify";

type Row = Record<string, unknown>;

/**
 * POST { partner_id: string | null } — назначить заявку партнёру (или снять назначение).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json().catch(() => ({}));
  const partnerId = data.partner_id ? String(data.partner_id) : null;

  const db = getDb();

  // Проверяем заявку
  const reqRows = (await db`SELECT request_id, name FROM asystem_requests WHERE request_id = ${id} LIMIT 1`) as Row[];
  if (reqRows.length === 0) return NextResponse.json({ error: "request not found" }, { status: 404 });

  await db`UPDATE asystem_requests SET assigned_partner_id = ${partnerId} WHERE request_id = ${id}`;

  if (partnerId) {
    // Проверяем партнёра
    const p = (await db`SELECT name FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Row[];
    if (p.length === 0) return NextResponse.json({ error: "partner not found" }, { status: 404 });

    await notify({
      userRole: "partner",
      userId: partnerId,
      kind: "request_assigned",
      title: `Новая заявка на вас`,
      body: `${reqRows[0].name || "Без имени"} — посмотрите в Лидах`,
      link: `/partner/leads`,
      payload: { requestId: id },
    });
  }

  return NextResponse.json({ ok: true });
}
