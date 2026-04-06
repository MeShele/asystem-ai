import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

const statusLabels: Record<string, string> = {
  new: "Новая",
  discussing: "Обсуждение",
  in_progress: "В работе",
  review: "На проверке",
  completed: "Завершён",
  cancelled: "Отменён",
};

// GET — all partner clients for admin
export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initPartnerTables();

  const clients = await db`
    SELECT pc.*, p.name as partner_name, p.telegram_id as partner_telegram_id
    FROM partner_clients pc
    LEFT JOIN partners p ON pc.partner_id = p.partner_id
    ORDER BY pc.created_at DESC
  ` as Record<string, unknown>[];

  return NextResponse.json(clients);
}

// PATCH — update client status, price, commission
export async function PATCH(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const db = getDb();

  const { id, status, basePrice, commission, notes } = data;

  // Update partner_client
  if (status) {
    await db`UPDATE partner_clients SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (basePrice !== undefined) {
    await db`UPDATE partner_clients SET base_price = ${Number(basePrice)}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (commission !== undefined) {
    await db`UPDATE partner_clients SET commission = ${Number(commission)}, updated_at = NOW() WHERE id = ${id}`;
  }
  if (notes !== undefined) {
    await db`UPDATE partner_clients SET notes = ${notes}, updated_at = NOW() WHERE id = ${id}`;
  }

  // If status changed, notify partner via Telegram
  if (status) {
    const rows = await db`
      SELECT pc.request_id, pc.client_name, p.telegram_id, p.name as partner_name
      FROM partner_clients pc
      JOIN partners p ON pc.partner_id = p.partner_id
      WHERE pc.id = ${id}
    ` as Record<string, unknown>[];

    if (rows.length > 0) {
      const row = rows[0];
      const telegramId = row.telegram_id as string | null;

      if (telegramId) {
        const statusText = statusLabels[status] || status;
        let msg = `📋 Обновление проекта *${row.request_id}*\n\nКлиент: ${row.client_name}\nСтатус: *${statusText}*`;

        if (status === "completed" && commission) {
          msg += `\n\n💰 Ваша комиссия: *$${commission}*`;
        }

        await sendMessage(telegramId, msg).catch(() => {});
      }
    }
  }

  return NextResponse.json({ success: true });
}
