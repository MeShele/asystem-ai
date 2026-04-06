import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

// Link Telegram to partner account
export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { telegramId, telegramUsername } = await req.json();

  // Validate telegramId is a non-empty numeric value
  if (!telegramId || !/^\d+$/.test(String(telegramId))) {
    return NextResponse.json({ error: "Invalid Telegram ID" }, { status: 400 });
  }

  const db = getDb();

  await db`
    UPDATE partners
    SET telegram_id = ${telegramId}, telegram_username = ${telegramUsername || null}
    WHERE partner_id = ${partnerId}
  `;

  // Send test message to verify the connection
  const result = await sendMessage(
    String(telegramId),
    "✅ Telegram подключён!\n\nВы будете получать уведомления о ваших проектах и клиентах."
  );

  if (!result?.ok) {
    return NextResponse.json(
      { error: "Не удалось отправить сообщение. Убедитесь что вы начали чат с ботом @asystem_notify_bot" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}

// Send notification to partner's Telegram
export async function notifyPartner(telegramId: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !telegramId) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch {
    // silently fail
  }
}
