import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_session")?.value;
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initProjectTables();
  const db = getDb();
  await db`UPDATE clients SET telegram_id = NULL, telegram_username = NULL WHERE client_id = ${clientId}`;
  return NextResponse.json({ ok: true });
}
