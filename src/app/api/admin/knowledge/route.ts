import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPartnerTables();
  const db = getDb();
  const rows = await db`SELECT * FROM knowledge_docs ORDER BY pinned DESC, created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPartnerTables();
  const db = getDb();
  const data = await req.json();

  const title = String(data.title || "").trim();
  const fileUrl = String(data.file_url || "").trim();
  if (!title || !fileUrl) {
    return NextResponse.json({ error: "title и file_url обязательны" }, { status: 400 });
  }
  const description = data.description ? String(data.description).trim() : null;
  const fileName = data.file_name ? String(data.file_name) : null;
  const fileSize = Number(data.file_size || 0);
  const mimeType = data.mime_type ? String(data.mime_type) : null;
  const category = data.category ? String(data.category) : "general";
  const pinned = Boolean(data.pinned);

  const inserted = await db`
    INSERT INTO knowledge_docs (title, description, file_url, file_name, file_size, mime_type, category, pinned)
    VALUES (${title}, ${description}, ${fileUrl}, ${fileName}, ${fileSize}, ${mimeType}, ${category}, ${pinned})
    RETURNING *
  `;
  return NextResponse.json(inserted[0]);
}
