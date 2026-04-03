import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Link Telegram to partner account
export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { telegramId, telegramUsername } = await req.json();
  const db = getDb();

  await db`
    UPDATE partners
    SET telegram_id = ${telegramId}, telegram_username = ${telegramUsername || null}
    WHERE partner_id = ${partnerId}
  `;

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
