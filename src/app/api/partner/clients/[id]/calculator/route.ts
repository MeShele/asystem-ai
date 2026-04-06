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
  const body = await req.json();
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

  const pricingMode = body.pricingMode || "manual";
  const basePrice = Number(body.basePrice) || 0;
  const partnerPrice = Number(body.partnerPrice) || 0;
  const commission = Math.round(basePrice * 0.15 + Math.max(0, (partnerPrice - basePrice) * 0.5));

  if (pricingMode === "calculator") {
    // Save calculator config + prices
    const calculatorConfig = JSON.stringify({
      selected: body.selected || [],
      quantities: body.quantities || {},
      discount: body.discount || 0,
    });

    await db`
      UPDATE partner_clients
      SET
        pricing_mode = 'calculator',
        calculator_config = ${calculatorConfig}::jsonb,
        base_price = ${basePrice},
        partner_price = ${partnerPrice},
        commission = ${commission}
      WHERE id = ${id} AND partner_id = ${partnerId}
    `;
  } else {
    // Manual pricing — just save prices
    await db`
      UPDATE partner_clients
      SET
        pricing_mode = 'manual',
        calculator_config = NULL,
        base_price = ${basePrice},
        partner_price = ${partnerPrice},
        commission = ${commission}
      WHERE id = ${id} AND partner_id = ${partnerId}
    `;
  }

  return NextResponse.json({ success: true, commission });
}
