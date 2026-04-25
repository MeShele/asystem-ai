import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const projects = (await db`
    SELECT p.*, pt.name AS partner_name, pt.company AS partner_company, pt.telegram_id AS partner_telegram_id
    FROM projects p
    LEFT JOIN partners pt ON pt.partner_id = p.partner_id
    WHERE p.project_id = ${id} OR p.id::text = ${id}
    LIMIT 1
  `) as Record<string, unknown>[];

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const project = projects[0];

  const stages = await db`
    SELECT * FROM project_stages
    WHERE project_id = ${project.project_id as string}
    ORDER BY order_index ASC, id ASC
  `;

  return NextResponse.json({ project, stages });
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

  if ("name" in data) {
    await db`UPDATE projects SET name = ${String(data.name)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("description" in data) {
    await db`UPDATE projects SET description = ${data.description ?? null}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("logo_url" in data) {
    await db`UPDATE projects SET logo_url = ${data.logo_url ?? null}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("total_price" in data) {
    await db`UPDATE projects SET total_price = ${Number(data.total_price)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("paid_amount" in data) {
    await db`UPDATE projects SET paid_amount = ${Number(data.paid_amount)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("partner_id" in data) {
    await db`UPDATE projects SET partner_id = ${data.partner_id ?? null}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("progress_percent" in data) {
    await db`UPDATE projects SET progress_percent = ${Number(data.progress_percent)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("status" in data) {
    await db`UPDATE projects SET status = ${String(data.status)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("developers" in data) {
    await db`UPDATE projects SET developers = ${JSON.stringify(data.developers)}::jsonb, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }

  const updated = await db`SELECT * FROM projects WHERE project_id = ${id} OR id::text = ${id} LIMIT 1`;
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

  const proj = (await db`SELECT project_id FROM projects WHERE project_id = ${id} OR id::text = ${id} LIMIT 1`) as Record<string, unknown>[];
  if (proj.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  const pid = proj[0].project_id as string;

  await db`DELETE FROM project_stages WHERE project_id = ${pid}`;
  await db`DELETE FROM projects WHERE project_id = ${pid}`;
  return NextResponse.json({ success: true });
}
