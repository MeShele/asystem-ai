import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";

// GET — all pending payout requests + milestone claims for admin
export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  // Project payout requests + paid history
  const payouts = await db`
    SELECT pp.id, pp.project_id, pp.partner_id, pp.amount, pp.status, pp.requested_at, pp.paid_at, pp.comment,
           p.name AS partner_name, pr.name AS project_name
    FROM partner_payouts pp
    LEFT JOIN partners p ON p.partner_id = pp.partner_id
    LEFT JOIN projects pr ON pr.project_id = pp.project_id
    ORDER BY (CASE WHEN pp.status = 'requested' THEN 0 ELSE 1 END), pp.requested_at DESC, pp.paid_at DESC
  `;

  // Milestone reward claims
  const milestones = await db`
    SELECT mc.id, mc.partner_id, mc.milestone_key, mc.threshold, mc.amount, mc.status, mc.requested_at, mc.paid_at, mc.comment,
           p.name AS partner_name
    FROM partner_milestone_claims mc
    LEFT JOIN partners p ON p.partner_id = mc.partner_id
    ORDER BY (CASE WHEN mc.status = 'requested' THEN 0 ELSE 1 END), mc.requested_at DESC
  `;

  return NextResponse.json({ payouts, milestones });
}
