import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_session")?.value;
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json().catch(() => ({}));
  const db = getDb();
  if (Array.isArray(data.ids) && data.ids.length > 0) {
    const ids = data.ids.map(Number).filter((n: number) => Number.isFinite(n));
    if (ids.length === 0) return NextResponse.json({ ok: true });
    await db`UPDATE notifications SET read_at = NOW() WHERE user_role = 'client' AND user_id = ${clientId} AND id = ANY(${ids}) AND read_at IS NULL`;
  } else {
    await db`UPDATE notifications SET read_at = NOW() WHERE user_role = 'client' AND user_id = ${clientId} AND read_at IS NULL`;
  }
  return NextResponse.json({ ok: true });
}
