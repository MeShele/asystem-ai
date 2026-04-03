import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const db = getDb();
  await initPartnerTables();

  const partners = await db`
    SELECT partner_id, name, email, phone, company, ref_code, telegram_id, telegram_username, commission_rate, status, created_at
    FROM partners WHERE partner_id = ${partnerId}
  ` as Record<string, unknown>[];

  if (partners.length === 0) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  const partner = partners[0];

  // Get partner's clients
  const clients = await db`
    SELECT * FROM partner_clients
    WHERE partner_id = ${partnerId}
    ORDER BY created_at DESC
  ` as Record<string, unknown>[];

  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter((c: Record<string, unknown>) => c.status !== "completed" && c.status !== "cancelled").length;
  const totalEarned = clients.reduce((sum: number, c: Record<string, unknown>) => sum + Number(c.commission || 0), 0);

  return NextResponse.json({
    partner,
    clients,
    stats: {
      totalClients,
      activeClients,
      totalEarned,
    },
  });
}
