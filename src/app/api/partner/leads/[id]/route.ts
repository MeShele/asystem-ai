import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { notifyAdmins } from "@/lib/notify";

type Row = Record<string, unknown>;

const ALLOWED_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

/**
 * PATCH { lead_status?, partner_note? } — партнёр обновляет статус назначенной заявки.
 * Только для своих заявок (assigned_partner_id = текущий партнёр).
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const data = await req.json().catch(() => ({}));

  await initPartnerTables();
  const db = getDb();

  const existing = (await db`
    SELECT request_id, name, lead_status FROM asystem_requests
    WHERE request_id = ${id} AND assigned_partner_id = ${partnerId}
    LIMIT 1
  `) as Row[];
  if (existing.length === 0) return NextResponse.json({ error: "Заявка не найдена или не назначена вам" }, { status: 404 });

  const newStatus = typeof data.lead_status === "string" && (ALLOWED_STATUSES as readonly string[]).includes(data.lead_status)
    ? data.lead_status
    : null;
  const newNote = typeof data.partner_note === "string" ? data.partner_note.slice(0, 2000) : null;

  if (newStatus) {
    await db`UPDATE asystem_requests SET lead_status = ${newStatus} WHERE request_id = ${id}`;
  }
  if (newNote !== null) {
    await db`UPDATE asystem_requests SET partner_note = ${newNote} WHERE request_id = ${id}`;
  }

  // Уведомляем админа об изменениях статуса (won/lost — важные)
  if (newStatus && newStatus !== existing[0].lead_status && (newStatus === "won" || newStatus === "lost")) {
    const partnerRow = (await db`SELECT name FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Row[];
    const pname = partnerRow[0]?.name || partnerId;
    const verb = newStatus === "won" ? "закрыл" : "потерял";
    await notifyAdmins({
      kind: "request_assigned",
      title: `Партнёр ${verb} лид «${existing[0].name || id}»`,
      body: `${pname} → статус: ${newStatus}`,
      link: `/admin/requests`,
      payload: { requestId: id, partnerId, lead_status: newStatus },
    });
  }

  return NextResponse.json({ ok: true });
}
