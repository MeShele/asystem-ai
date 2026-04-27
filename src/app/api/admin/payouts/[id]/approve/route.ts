import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

// Approve project payout request → status 'paid', set paid_at to today
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  await db`UPDATE partner_payouts SET status = 'paid', paid_at = CURRENT_DATE WHERE id = ${id}`;
  const rows = await db`SELECT * FROM partner_payouts WHERE id = ${id} LIMIT 1`;
  return NextResponse.json(rows[0] || {});
}
