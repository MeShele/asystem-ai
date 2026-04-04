import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { selected, quantities, discount, basePrice, partnerPrice } = await req.json();
  const db = getDb();
  await initPartnerTables();

  // Verify ownership
  const projects = await db`
    SELECT id FROM partner_clients
    WHERE id = ${id} AND partner_id = ${partnerId}
    LIMIT 1
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const calculatorConfig = JSON.stringify({ selected, quantities, discount });
  const commission = basePrice * 0.15 + Math.max(0, (partnerPrice - basePrice) * 0.5);

  await db`
    UPDATE partner_clients
    SET
      calculator_config = ${calculatorConfig}::jsonb,
      base_price = ${basePrice},
      partner_price = ${partnerPrice},
      commission = ${commission}
    WHERE id = ${id} AND partner_id = ${partnerId}
  `;

  return NextResponse.json({ success: true, commission });
}
