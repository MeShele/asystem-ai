import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Notify admin via Telegram
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `📧 Новая подписка на продукты\nEmail: ${email}`,
      }),
    }).catch(() => {});
  }

  // Save to DB if available
  try {
    const { getDb } = await import("@/lib/db");
    const db = getDb();
    await db`CREATE TABLE IF NOT EXISTS email_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
    await db`INSERT INTO email_subscribers (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
  } catch {
    // DB not available, Telegram notification already sent
  }

  return NextResponse.json({ success: true });
}
