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

  return NextResponse.json({ project, stages });
}
