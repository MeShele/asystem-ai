import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * POST: пометить уведомления прочитанными.
 * body: { ids?: number[] } — конкретные id, либо без body — все unread помечаем.
 */
export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json().catch(() => ({}));
  const db = getDb();
  if (Array.isArray(data.ids) && data.ids.length > 0) {
    const ids = data.ids.map(Number).filter((n: number) => Number.isFinite(n));
    if (ids.length === 0) return NextResponse.json({ ok: true });
    await db`
      UPDATE notifications SET read_at = NOW()
      WHERE user_role = 'partner' AND user_id = ${partnerId} AND id = ANY(${ids}) AND read_at IS NULL
    `;
  } else {
    await db`
      UPDATE notifications SET read_at = NOW()
      WHERE user_role = 'partner' AND user_id = ${partnerId} AND read_at IS NULL
    `;
  }
  return NextResponse.json({ ok: true });
}
