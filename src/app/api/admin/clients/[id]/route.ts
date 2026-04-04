import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

// GET — single project with partner info and KP messages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initPartnerTables();

  // Fetch project with partner info
  const projects = (await db`
    SELECT pc.*, p.name as partner_name, p.telegram_id as partner_telegram_id
    FROM partner_clients pc
    LEFT JOIN partners p ON pc.partner_id = p.partner_id
    WHERE pc.id = ${id}
  `) as Record<string, unknown>[];

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projects[0];

  // Extract partner info
  const partner = {
    name: project.partner_name,
    telegram_id: project.partner_telegram_id,
  };

  // Fetch KP messages for this project
  const kpMessages = (await db`
    SELECT * FROM kp_messages
    WHERE project_id = ${id}
    ORDER BY created_at ASC
  `) as Record<string, unknown>[];

  return NextResponse.json({ project, partner, kpMessages });
}
