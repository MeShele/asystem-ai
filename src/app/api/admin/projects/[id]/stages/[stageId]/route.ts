import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, stageId } = await params;
  const data = await req.json();
  const db = getDb();
  await initProjectTables();

  if ("title" in data) {
    await db`UPDATE project_stages SET title = ${String(data.title)}, updated_at = NOW() WHERE id = ${stageId} AND project_id = ${id}`;
  }
  if ("percent" in data) {
    await db`UPDATE project_stages SET percent = ${Number(data.percent)}, updated_at = NOW() WHERE id = ${stageId} AND project_id = ${id}`;
  }
  if ("comment" in data) {
    await db`UPDATE project_stages SET comment = ${data.comment ?? null}, updated_at = NOW() WHERE id = ${stageId} AND project_id = ${id}`;
  }
  if ("completed" in data) {
    await db`UPDATE project_stages SET completed = ${Boolean(data.completed)}, updated_at = NOW() WHERE id = ${stageId} AND project_id = ${id}`;
  }
  if ("order_index" in data) {
    await db`UPDATE project_stages SET order_index = ${Number(data.order_index)}, updated_at = NOW() WHERE id = ${stageId} AND project_id = ${id}`;
  }

  const updated = await db`SELECT * FROM project_stages WHERE id = ${stageId} LIMIT 1`;
  return NextResponse.json(updated[0] || {});
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, stageId } = await params;
  const db = getDb();
  await initProjectTables();

  await db`DELETE FROM project_stages WHERE id = ${stageId} AND project_id = ${id}`;
  return NextResponse.json({ success: true });
}
