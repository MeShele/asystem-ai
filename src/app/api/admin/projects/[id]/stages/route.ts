import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import { notify } from "@/lib/notify";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  const stages = await db`
    SELECT * FROM project_stages
    WHERE project_id = ${id}
    ORDER BY order_index ASC, id ASC
  `;
  return NextResponse.json(stages);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  const db = getDb();
  await initProjectTables();

  const title = String(data.title || "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const orderRow = (await db`
    SELECT COALESCE(MAX(order_index), -1) + 1 AS next FROM project_stages WHERE project_id = ${id}
  `) as Record<string, unknown>[];
  const nextOrder = Number(orderRow[0]?.next ?? 0);

  const inserted = await db`
    INSERT INTO project_stages (project_id, order_index, title, percent, comment, completed)
    VALUES (${id}, ${nextOrder}, ${title}, ${Number(data.percent || 0)}, ${data.comment ?? null}, ${Boolean(data.completed)})
    RETURNING *
  `;

  // Notify client if linked
  const proj = (await db`SELECT name, client_id FROM projects WHERE project_id = ${id} LIMIT 1`) as Record<string, unknown>[];
  if (proj.length > 0 && proj[0].client_id) {
    await notify({
      userRole: "client",
      userId: String(proj[0].client_id),
      kind: "stage_updated",
      title: `Новый этап в проекте`,
      body: `«${proj[0].name || ""}» → ${title}${data.percent ? ` (${data.percent}%)` : ""}`,
      link: `/client/projects/${id}`,
      payload: { projectId: id, stageId: inserted[0].id, title },
    });
  }

  return NextResponse.json(inserted[0]);
}
