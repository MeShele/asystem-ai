import { NextRequest, NextResponse } from "next/server";
import { getDb, initPortfolioTables } from "@/lib/db";

function authed(req: NextRequest) {
  return Boolean(req.cookies.get("admin_session")?.value);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPortfolioTables();
  const db = getDb();
  const { id } = await params;
  const data = await req.json();

  const rows = await db`SELECT * FROM portfolio_categories WHERE id = ${Number(id)} LIMIT 1`;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const cur = rows[0];

  const slug = data.slug ? String(data.slug).trim() : String(cur.slug);
  const translations = data.translations ?? cur.translations;
  const orderIndex = data.order_index !== undefined ? Number(data.order_index) : Number(cur.order_index);

  const updated = await db`
    UPDATE portfolio_categories
    SET slug = ${slug}, translations = ${JSON.stringify(translations)}::jsonb, order_index = ${orderIndex}, updated_at = NOW()
    WHERE id = ${Number(id)}
    RETURNING *
  `;
  return NextResponse.json(updated[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await initPortfolioTables();
  const db = getDb();
  const { id } = await params;
  // category_id в portfolio_cases имеет ON DELETE SET NULL — кейсы не удалятся
  await db`DELETE FROM portfolio_categories WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
