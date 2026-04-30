import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { notify } from "@/lib/notify";

type Row = Record<string, unknown>;

/**
 * POST — отметить override-запись как выплаченную (status: pending → paid).
 * Уведомляет партнёра в Telegram + кабинет.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: "bad id" }, { status: 400 });

  await initPartnerTables();
  const db = getDb();

  const rows = (await db`
    SELECT po.*, sp.name AS sub_partner_name, pr.name AS project_name
    FROM partner_overrides po
    LEFT JOIN partners sp ON sp.partner_id = po.sub_partner_id
    LEFT JOIN projects pr ON pr.project_id = po.project_id
    WHERE po.id = ${id} LIMIT 1
  `) as Row[];

  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  const r = rows[0];
  if (r.status === "paid") return NextResponse.json({ error: "already paid" }, { status: 400 });

  await db`UPDATE partner_overrides SET status = 'paid', paid_at = CURRENT_DATE WHERE id = ${id}`;

  const referrerId = String(r.referrer_partner_id);
  const amount = Number(r.override_amount || 0);
  await notify({
    userRole: "partner",
    userId: referrerId,
    kind: "milestone_paid",
    title: `Override $${amount.toLocaleString("ru-RU")} выплачен`,
    body: `Сделка sub-partner ${r.sub_partner_name || ""} → проект «${r.project_name || ""}»`,
    link: `/partner/network`,
    payload: { overrideId: id },
  });

  return NextResponse.json({ ok: true });
}
