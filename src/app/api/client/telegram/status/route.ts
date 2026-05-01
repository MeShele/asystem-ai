import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

type Row = Record<string, unknown>;

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_session")?.value;
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initProjectTables();
  const db = getDb();

  const rows = (await db`
    SELECT telegram_id, telegram_username FROM clients WHERE client_id = ${clientId} LIMIT 1
  `) as Row[];

  if (rows.length === 0) return NextResponse.json({ linked: false });

  return NextResponse.json({
    linked: !!rows[0].telegram_id,
    telegram_id: rows[0].telegram_id || null,
    telegram_username: rows[0].telegram_username || null,
  });
}
