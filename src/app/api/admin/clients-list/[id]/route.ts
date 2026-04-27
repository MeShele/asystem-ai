import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  const rows = (await db`
    SELECT * FROM clients WHERE client_id = ${id} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });

  const projects = await db`
    SELECT * FROM projects WHERE client_id = ${id} ORDER BY created_at DESC
  `;

  return NextResponse.json({ client: rows[0], projects });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  await db`UPDATE projects SET client_id = NULL WHERE client_id = ${id}`;
  await db`DELETE FROM clients WHERE client_id = ${id}`;
  return NextResponse.json({ success: true });
}
