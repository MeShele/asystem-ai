import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const clientId = req.cookies.get("client_session")?.value;
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initProjectTables();

  const rows = await db`
    SELECT p.id, p.project_id, p.name, p.description, p.logo_url, p.total_price, p.paid_amount,
           p.progress_percent, p.status, p.tier, p.created_at,
           pt.name AS partner_name
    FROM projects p
    LEFT JOIN partners pt ON pt.partner_id = p.partner_id
    WHERE p.client_id = ${clientId}
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json(rows);
}
