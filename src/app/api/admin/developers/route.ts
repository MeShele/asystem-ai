import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initProjectTables();

  const rows = await db`
    SELECT d.*,
      (SELECT COUNT(*) FROM project_developers pd WHERE pd.developer_id = d.id) AS projects_count
    FROM developers d
    ORDER BY d.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const db = getDb();
  await initProjectTables();

  const name = String(data.name || "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const inserted = await db`
    INSERT INTO developers (name, role, avatar_url, email, telegram, status)
    VALUES (
      ${name},
      ${data.role ?? null},
      ${data.avatar_url ?? null},
      ${data.email ?? null},
      ${data.telegram ?? null},
      ${data.status ?? "active"}
    )
    RETURNING *
  `;
  return NextResponse.json(inserted[0]);
}
