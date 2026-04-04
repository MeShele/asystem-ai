import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  await initPartnerTables();

  const projects = await db`
    SELECT * FROM partner_clients
    WHERE id = ${id} AND partner_id = ${partnerId}
    LIMIT 1
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projects[0];

  const kpMessages = await db`
    SELECT * FROM kp_messages
    WHERE project_id = ${project.id}
    ORDER BY created_at ASC
  `;

  return NextResponse.json({ project, kpMessages });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { description, kpContent } = await req.json();
  const db = getDb();
  await initPartnerTables();

  // Verify ownership
  const projects = await db`
    SELECT id FROM partner_clients
    WHERE id = ${id} AND partner_id = ${partnerId}
    LIMIT 1
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (description !== undefined) {
    await db`
      UPDATE partner_clients
      SET description = ${description}
      WHERE id = ${id} AND partner_id = ${partnerId}
    `;
  }

  if (kpContent !== undefined) {
    await db`
      UPDATE partner_clients
      SET kp_content = ${kpContent}, kp_status = 'draft'
      WHERE id = ${id} AND partner_id = ${partnerId}
    `;
  }

  return NextResponse.json({ success: true });
}
