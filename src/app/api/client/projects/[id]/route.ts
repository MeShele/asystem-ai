import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const clientId = req.cookies.get("client_session")?.value;
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  const projects = (await db`
    SELECT p.*, pt.name AS partner_name, pt.company AS partner_company
    FROM projects p
    LEFT JOIN partners pt ON pt.partner_id = p.partner_id
    WHERE (p.project_id = ${id} OR p.id::text = ${id}) AND p.client_id = ${clientId}
    LIMIT 1
  `) as Record<string, unknown>[];
  if (projects.length === 0) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const project = projects[0];

  const stages = await db`
    SELECT id, order_index, title, percent, comment, completed
    FROM project_stages
    WHERE project_id = ${project.project_id as string}
    ORDER BY order_index ASC, id ASC
  `;

  const developers = await db`
    SELECT d.id, d.name, d.role, d.avatar_url
    FROM developers d
    JOIN project_developers pd ON pd.developer_id = d.id
    WHERE pd.project_id = ${project.project_id as string}
    ORDER BY pd.created_at ASC
  `;

  return NextResponse.json({ project, stages, developers });
}
