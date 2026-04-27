import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initProjectTables();

  const rows = await db`
    SELECT c.client_id, c.name, c.email, c.phone, c.created_at,
      (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.client_id) AS projects_count
    FROM clients c
    ORDER BY c.created_at DESC
  `;
  return NextResponse.json(rows);
}
