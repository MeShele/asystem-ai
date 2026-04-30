import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerId } = await params;
  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const partners = (await db`
    SELECT *
    FROM partners
    WHERE partner_id = ${partnerId}
    LIMIT 1
  `) as Record<string, unknown>[];
  if (partners.length === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const partner = partners[0];

  const projects = await db`
    SELECT *
    FROM projects
    WHERE partner_id = ${partnerId}
    ORDER BY created_at DESC
  ` as Record<string, unknown>[];

  // Aggregate stats
  let totalValue = 0;
  let totalPaid = 0;
  let totalCommission = 0;
  let active = 0;
  let completed = 0;
  for (const p of projects) {
    const total = Number(p.total_price || 0);
    const paid = Number(p.paid_amount || 0);
    const pct = Number(p.partner_commission_percent || 0);
    totalValue += total;
    totalPaid += paid;
    totalCommission += Math.round((total * pct) / 100);
    if (p.status === "completed") completed++;
    else if (p.status !== "cancelled") active++;
  }

  // Actual payouts (paid only)
  const payoutsRow = (await db`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM partner_payouts
    WHERE partner_id = ${partnerId} AND status = 'paid'
  `) as Record<string, unknown>[];
  const totalPayouts = Number(payoutsRow[0]?.total || 0);

  // Total founding partners across system (for the hint in UI)
  const foundingRow = (await db`SELECT COUNT(*) AS c FROM partners WHERE is_founding = TRUE`) as Record<string, unknown>[];
  const foundingCount = Number(foundingRow[0]?.c || 0);

  return NextResponse.json({
    partner,
    projects,
    stats: {
      totalProjects: projects.length,
      activeProjects: active,
      completedProjects: completed,
      totalValue,
      totalPaid,
      totalCommission,
      totalPayouts,
      remainingCommission: Math.max(0, totalCommission - totalPayouts),
      foundingCount,
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ partnerId: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerId } = await params;
  const data = await req.json();
  const db = getDb();
  await initPartnerTables();

  if ("name" in data) await db`UPDATE partners SET name = ${String(data.name)} WHERE partner_id = ${partnerId}`;
  if ("email" in data) await db`UPDATE partners SET email = ${data.email ?? null} WHERE partner_id = ${partnerId}`;
  if ("phone" in data) await db`UPDATE partners SET phone = ${data.phone ?? null} WHERE partner_id = ${partnerId}`;
  if ("company" in data) await db`UPDATE partners SET company = ${data.company ?? null} WHERE partner_id = ${partnerId}`;
  if ("status" in data) await db`UPDATE partners SET status = ${String(data.status)} WHERE partner_id = ${partnerId}`;
  if ("commission_rate" in data) await db`UPDATE partners SET commission_rate = ${Number(data.commission_rate)} WHERE partner_id = ${partnerId}`;
  if ("level" in data) {
    const lvl = Math.max(1, Math.min(5, Number(data.level)));
    await db`UPDATE partners SET level = ${lvl} WHERE partner_id = ${partnerId}`;
    await db`INSERT INTO partner_level_history (partner_id, level, reason) VALUES (${partnerId}, ${lvl}, 'manual override by admin')`;
    // Старые проекты остаются на своих %. Новые получат новый.
  }
  if ("is_founding" in data) {
    await db`UPDATE partners SET is_founding = ${Boolean(data.is_founding)} WHERE partner_id = ${partnerId}`;
    // Founding влияет на новые проекты. Старые остаются.
  }

  const updated = await db`SELECT * FROM partners WHERE partner_id = ${partnerId} LIMIT 1`;
  return NextResponse.json(updated[0] || {});
}
