import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

type Row = Record<string, unknown>;

/**
 * GET — список заявок назначенных текущему партнёру (admin переадресовал лида).
 * Возвращает все поля заявки + статус lead_status (new/contacted/qualified/won/lost).
 */
export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await initPartnerTables();
  const db = getDb();

  const rows = (await db`
    SELECT request_id, name, phone, company, services, budget, timeline, description,
           ref_code, status, lead_status, partner_note, created_at
    FROM asystem_requests
    WHERE assigned_partner_id = ${partnerId}
    ORDER BY created_at DESC
  `) as Row[];

  // Считаем по статусам для KPI на странице
  const counts = {
    total: rows.length,
    new: rows.filter((r) => (r.lead_status || "new") === "new").length,
    contacted: rows.filter((r) => r.lead_status === "contacted").length,
    qualified: rows.filter((r) => r.lead_status === "qualified").length,
    won: rows.filter((r) => r.lead_status === "won").length,
    lost: rows.filter((r) => r.lead_status === "lost").length,
  };

  return NextResponse.json({ items: rows, counts });
}
