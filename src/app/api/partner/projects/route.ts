import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const rows = await db`
    SELECT * FROM projects
    WHERE partner_id = ${partnerId}
    ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}
