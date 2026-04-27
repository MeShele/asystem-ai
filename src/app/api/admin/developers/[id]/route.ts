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

  const rows = (await db`SELECT * FROM developers WHERE id = ${id} LIMIT 1`) as Record<string, unknown>[];
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });

  const projects = await db`
    SELECT p.* FROM projects p
    JOIN project_developers pd ON pd.project_id = p.project_id
    WHERE pd.developer_id = ${id}
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json({ developer: rows[0], projects });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  const db = getDb();
  await initProjectTables();

  if ("name" in data) await db`UPDATE developers SET name = ${String(data.name)}, updated_at = NOW() WHERE id = ${id}`;
  if ("role" in data) await db`UPDATE developers SET role = ${data.role ?? null}, updated_at = NOW() WHERE id = ${id}`;
  if ("avatar_url" in data) await db`UPDATE developers SET avatar_url = ${data.avatar_url ?? null}, updated_at = NOW() WHERE id = ${id}`;
  if ("email" in data) await db`UPDATE developers SET email = ${data.email ?? null}, updated_at = NOW() WHERE id = ${id}`;
  if ("telegram" in data) await db`UPDATE developers SET telegram = ${data.telegram ?? null}, updated_at = NOW() WHERE id = ${id}`;
  if ("status" in data) await db`UPDATE developers SET status = ${String(data.status)}, updated_at = NOW() WHERE id = ${id}`;

  const updated = await db`SELECT * FROM developers WHERE id = ${id} LIMIT 1`;
  return NextResponse.json(updated[0] || {});
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

  await db`DELETE FROM project_developers WHERE developer_id = ${id}`;
  await db`DELETE FROM developers WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
