import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("partner_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPartnerTables();
  const db = getDb();
  const rows = await db`SELECT id, title, description, file_url, file_name, file_size, mime_type, category, pinned, created_at FROM knowledge_docs ORDER BY pinned DESC, created_at DESC`;
  return NextResponse.json(rows);
}
