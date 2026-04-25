import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

// POST — wipes legacy state of a partner: partner_clients (legacy projects), achievements
// Does NOT delete the partner record itself or new-system projects (those are managed via /admin/projects)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerId } = await params;
  const db = getDb();
  await initPartnerTables();

  const partner = (await db`SELECT partner_id FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Record<string, unknown>[];
  if (partner.length === 0) return NextResponse.json({ error: "partner not found" }, { status: 404 });

  const clientIds = (await db`SELECT request_id FROM partner_clients WHERE partner_id = ${partnerId}`) as Record<string, unknown>[];
  const reqIds = clientIds.map((r) => r.request_id as string).filter(Boolean);

  for (const rid of reqIds) {
    await db`DELETE FROM partner_messages WHERE partner_id = ${partnerId} AND client_request_id = ${rid}`;
  }
  await db`DELETE FROM partner_clients WHERE partner_id = ${partnerId}`;
  await db`DELETE FROM partner_achievements WHERE partner_id = ${partnerId}`;

  return NextResponse.json({
    success: true,
    deleted: { partner_clients: reqIds.length, achievements: true },
  });
}
