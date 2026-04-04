import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

// POST — approve or reject KP
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { action, feedback } = await req.json();

  if (!action || !["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Invalid action. Must be 'approve' or 'reject'" },
      { status: 400 }
    );
  }

  const db = getDb();
  await initPartnerTables();

  if (action === "approve") {
    await db`
      UPDATE partner_clients
      SET kp_status = 'approved', kp_reviewed_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await db`
      UPDATE partner_clients
      SET kp_status = 'rejected', kp_admin_feedback = ${feedback || ""}, kp_reviewed_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  // Fetch project + partner info for Telegram notification
  const rows = (await db`
    SELECT pc.request_id, p.telegram_id
    FROM partner_clients pc
    JOIN partners p ON pc.partner_id = p.partner_id
    WHERE pc.id = ${id}
  `) as Record<string, unknown>[];

  if (rows.length > 0) {
    const row = rows[0];
    const telegramId = row.telegram_id as string | null;

    if (telegramId) {
      let msg: string;
      if (action === "approve") {
        msg = `✅ КП одобрено!\nПроект: ${row.request_id}\nМожете скачать PDF.`;
      } else {
        msg = `❌ КП требует доработки\nПроект: ${row.request_id}\nКомментарий: ${feedback || "—"}`;
      }

      await sendMessage(telegramId, msg).catch(() => {});
    }
  }

  return NextResponse.json({ success: true });
}
