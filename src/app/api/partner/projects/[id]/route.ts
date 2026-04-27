import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const projects = (await db`
    SELECT * FROM projects
    WHERE (project_id = ${id} OR id::text = ${id})
      AND partner_id = ${partnerId}
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

  const developers = await db`
    SELECT d.id, d.name, d.role, d.avatar_url
    FROM developers d
    JOIN project_developers pd ON pd.developer_id = d.id
    WHERE pd.project_id = ${project.project_id as string}
    ORDER BY pd.created_at ASC
  `;

  const payouts = await db`
    SELECT id, amount, paid_at, comment, status, requested_at, created_at
    FROM partner_payouts
    WHERE project_id = ${project.project_id as string} AND partner_id = ${partnerId}
    ORDER BY (CASE WHEN status = 'requested' THEN 0 ELSE 1 END), paid_at DESC, id DESC
  `;

  return NextResponse.json({ project, stages, developers, payouts });
}
