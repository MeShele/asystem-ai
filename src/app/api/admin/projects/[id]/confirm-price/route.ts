import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import { notify } from "@/lib/notify";

type Row = Record<string, unknown>;

/**
 * POST — Подтверждает согласованную стоимость проекта.
 * Ставит price_confirmed_at = NOW(), переводит статус в active (если был planning),
 * уведомляет партнёра и клиента «Сумма $X согласована, проект запущен».
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await initProjectTables();
  const db = getDb();

  const rows = (await db`
    SELECT project_id, name, total_price, partner_id, client_id, status, price_confirmed_at, partner_commission_percent
    FROM projects WHERE project_id = ${id} OR id::text = ${id} LIMIT 1
  `) as Row[];
  if (rows.length === 0) return NextResponse.json({ error: "Проект не найден" }, { status: 404 });

  const p = rows[0];
  const totalPrice = Number(p.total_price || 0);
  if (totalPrice <= 0) {
    return NextResponse.json({ error: "Сначала задайте стоимость проекта (>0)" }, { status: 400 });
  }
  if (p.price_confirmed_at) {
    return NextResponse.json({ error: "Сумма уже подтверждена" }, { status: 400 });
  }

  // Если статус planning → переводим в active автоматически
  const newStatus = p.status === "planning" ? "active" : String(p.status);
  await db`
    UPDATE projects
    SET price_confirmed_at = NOW(), status = ${newStatus}, updated_at = NOW()
    WHERE project_id = ${id} OR id::text = ${id}
  `;

  const projId = String(p.project_id);
  const projName = String(p.name || "");
  const pct = Number(p.partner_commission_percent || 0);
  const partnerShare = Math.round((totalPrice * pct) / 100);

  if (p.partner_id) {
    await notify({
      userRole: "partner",
      userId: String(p.partner_id),
      kind: "milestone_paid",
      title: `🎉 Сумма согласована — проект запущен`,
      body: `«${projName}» — $${totalPrice.toLocaleString("ru-RU")}. Твоя комиссия ${pct}% ≈ $${partnerShare.toLocaleString("ru-RU")}`,
      link: `/partner/projects/${projId}`,
      payload: { projectId: projId, totalPrice, pct },
    });
  }
  if (p.client_id) {
    await notify({
      userRole: "client",
      userId: String(p.client_id),
      kind: "project_status_changed",
      title: `Проект запущен 🚀`,
      body: `«${projName}» — стоимость $${totalPrice.toLocaleString("ru-RU")} согласована, приступаем к работе.`,
      link: `/client/projects/${projId}`,
      payload: { projectId: projId, totalPrice },
    });
  }

  return NextResponse.json({ ok: true });
}
