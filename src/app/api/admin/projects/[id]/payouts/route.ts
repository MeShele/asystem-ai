import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  const rows = await db`
    SELECT * FROM partner_payouts
    WHERE project_id = ${id}
    ORDER BY paid_at DESC, id DESC
  `;
  return NextResponse.json(rows);
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

  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "amount must be positive" }, { status: 400 });
  }

  // Need partner_id from project
  const projects = (await db`SELECT partner_id FROM projects WHERE project_id = ${id} LIMIT 1`) as Record<string, unknown>[];
  if (projects.length === 0) return NextResponse.json({ error: "project not found" }, { status: 404 });
  const partnerId = projects[0].partner_id as string | null;
  if (!partnerId) return NextResponse.json({ error: "project has no partner" }, { status: 400 });

  const paidAt = data.paid_at ? String(data.paid_at) : new Date().toISOString().slice(0, 10);

  const inserted = await db`
    INSERT INTO partner_payouts (project_id, partner_id, amount, paid_at, comment)
    VALUES (${id}, ${partnerId}, ${amount}, ${paidAt}::date, ${data.comment ?? null})
    RETURNING *
  `;
  return NextResponse.json(inserted[0]);
}
