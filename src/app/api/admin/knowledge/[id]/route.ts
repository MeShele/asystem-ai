import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const db = getDb();
  const data = await req.json();

  if (typeof data.pinned === "boolean") {
    await db`UPDATE knowledge_docs SET pinned = ${data.pinned} WHERE id = ${id}`;
  }
  if (data.title !== undefined) {
    await db`UPDATE knowledge_docs SET title = ${String(data.title)} WHERE id = ${id}`;
  }
  if (data.description !== undefined) {
    await db`UPDATE knowledge_docs SET description = ${data.description ? String(data.description) : null} WHERE id = ${id}`;
  }
  if (data.category !== undefined) {
    await db`UPDATE knowledge_docs SET category = ${String(data.category)} WHERE id = ${id}`;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) return NextResponse.json({ error: "bad id" }, { status: 400 });
  const db = getDb();
  await db`DELETE FROM knowledge_docs WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
