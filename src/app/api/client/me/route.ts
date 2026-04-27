import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_session")?.value;
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initProjectTables();

  const rows = (await db`
    SELECT client_id, name, email, phone, created_at FROM clients WHERE client_id = ${clientId} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ client: rows[0] });
}
