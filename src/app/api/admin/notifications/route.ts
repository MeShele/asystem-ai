import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPartnerTables();
  const db = getDb();
  const rows = await db`
    SELECT id, kind, title, body, link, payload, read_at, created_at
    FROM notifications
    WHERE user_role = 'admin'
    ORDER BY created_at DESC
    LIMIT 50
  `;
  const unreadRow = await db`
    SELECT COUNT(*)::int AS cnt FROM notifications WHERE user_role = 'admin' AND read_at IS NULL
  ` as Record<string, unknown>[];
  return NextResponse.json({ items: rows, unread: Number(unreadRow[0]?.cnt || 0) });
}
