import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { notifyAdmin } from "@/lib/telegram";

export async function POST(
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

  // Fetch project and verify ownership
  const projects = await db`
    SELECT * FROM partner_clients
    WHERE id = ${id} AND partner_id = ${partnerId}
    LIMIT 1
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projects[0];

  if (!project.kp_content) {
    return NextResponse.json({ error: "KP content is empty" }, { status: 400 });
  }

  // Update KP status
  await db`
    UPDATE partner_clients
    SET kp_status = 'submitted', kp_submitted_at = NOW()
    WHERE id = ${id} AND partner_id = ${partnerId}
  `;

  // Get partner name
  const partners = await db`
    SELECT name FROM partners WHERE partner_id = ${partnerId}
  ` as Record<string, unknown>[];
  const partnerName = partners.length > 0 ? String(partners[0].name) : partnerId;

  // Notify admin
  await notifyAdmin(
    `📄 Партнёр ${partnerName} отправил КП на согласование\nПроект: ${project.request_id}\nКлиент: ${project.client_name}`
  ).catch(() => {});

  return NextResponse.json({ success: true });
}
