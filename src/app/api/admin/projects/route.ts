import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { recomputePartnerLevel, bumpPartnerActivity } from "@/lib/partner-stats";
import { computeCommissionPct } from "@/lib/partner-levels";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const rows = await db`
    SELECT p.*, pt.name AS partner_name, pt.company AS partner_company
    FROM projects p
    LEFT JOIN partners pt ON pt.partner_id = p.partner_id
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const projectId = "PR-" + String(Date.now()).slice(-6);
  const name = String(data.name || "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const description = data.description ?? null;
  const logoUrl = data.logo_url ?? null;
  const totalPrice = Number(data.total_price || 0);
  const paidAmount = Number(data.paid_amount || 0);
  const partnerId = data.partner_id || null;
  const status = data.status || "planning";
  const tier = ["T1", "T2", "T4"].includes(data.tier) ? data.tier : "T1";
  const contractSignedAt = data.contract_signed_at || null;

  // Auto-compute commission % from partner's level (if partner attached)
  let partnerCommissionPercent = Math.max(0, Math.min(100, Number(data.partner_commission_percent || 0)));
  if (partnerId && !data.partner_commission_percent) {
    const partners = (await db`SELECT level, is_founding FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Record<string, unknown>[];
    if (partners.length > 0) {
      const calc = computeCommissionPct({
        level: Number(partners[0].level || 1),
        isFounding: Boolean(partners[0].is_founding),
        deliveredIn30Days: false,
        hasRetentionBonus: false,
        hasChurnPenalty: false,
      });
      partnerCommissionPercent = calc.total;
    }
  }

  const inserted = await db`
    INSERT INTO projects (project_id, name, description, logo_url, total_price, paid_amount, partner_id, status, partner_commission_percent, tier, contract_signed_at)
    VALUES (${projectId}, ${name}, ${description}, ${logoUrl}, ${totalPrice}, ${paidAmount}, ${partnerId}, ${status}, ${partnerCommissionPercent}, ${tier}, ${contractSignedAt})
    RETURNING *
  `;

  if (partnerId) {
    await bumpPartnerActivity(partnerId);
    await recomputePartnerLevel(partnerId);
  }

  return NextResponse.json(inserted[0]);
}
