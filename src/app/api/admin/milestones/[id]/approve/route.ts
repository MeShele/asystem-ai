import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

// Approve milestone reward claim → status 'paid', paid_at = today
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  await db`UPDATE partner_milestone_claims SET status = 'paid', paid_at = CURRENT_DATE WHERE id = ${id}`;
  const rows = await db`SELECT * FROM partner_milestone_claims WHERE id = ${id} LIMIT 1`;
  return NextResponse.json(rows[0] || {});
}
