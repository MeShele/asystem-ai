import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPartnerTables();
  const db = getDb();
  const rows = await db`
    SELECT id, kind, title, body, link, payload, read_at, created_at
    FROM notifications
    WHERE user_role = 'partner' AND user_id = ${partnerId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
  const unreadCountRow = await db`
    SELECT COUNT(*)::int AS cnt FROM notifications
    WHERE user_role = 'partner' AND user_id = ${partnerId} AND read_at IS NULL
  ` as Record<string, unknown>[];
  const unread = Number(unreadCountRow[0]?.cnt || 0);
  return NextResponse.json({ items: rows, unread });
}
