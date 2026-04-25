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

  const rows = await db`
    SELECT d.*, pd.id AS link_id
    FROM developers d
    JOIN project_developers pd ON pd.developer_id = d.id
    WHERE pd.project_id = ${id}
    ORDER BY pd.created_at ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { developer_id } = await req.json();
  if (!developer_id) return NextResponse.json({ error: "developer_id required" }, { status: 400 });

  const db = getDb();
  await initProjectTables();

  await db`
    INSERT INTO project_developers (project_id, developer_id)
    VALUES (${id}, ${Number(developer_id)})
    ON CONFLICT (project_id, developer_id) DO NOTHING
  `;
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const developerId = url.searchParams.get("developer_id");
  if (!developerId) return NextResponse.json({ error: "developer_id required" }, { status: 400 });

  const db = getDb();
  await initProjectTables();

  await db`DELETE FROM project_developers WHERE project_id = ${id} AND developer_id = ${Number(developerId)}`;
  return NextResponse.json({ success: true });
}
