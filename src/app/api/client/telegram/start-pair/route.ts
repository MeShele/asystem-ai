import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import crypto from "crypto";

type Row = Record<string, unknown>;

/**
 * POST — создаёт pairing-код для клиента, возвращает t.me-deeplink на бота с этим кодом.
 * Клиент переходит по ссылке, бот ловит /start <код>, привязывает telegram_id к client_id.
 */
export async function POST(req: NextRequest) {
  const clientId = req.cookies.get("client_session")?.value;
  if (!clientId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initProjectTables();
  const db = getDb();

  const settingRow = (await db`SELECT value FROM app_settings WHERE key = 'telegram_bot_username' LIMIT 1`) as Row[];
  const botUsername = String(settingRow[0]?.value || process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "");
  if (!botUsername) {
    return NextResponse.json(
      { error: "Telegram бот не настроен. Админ должен задать telegram_bot_username." },
      { status: 503 }
    );
  }

  // Удаляем старые/неиспользованные коды этого клиента
  await db`DELETE FROM telegram_pairing_codes WHERE client_id = ${clientId}`;

  // Префикс c_ чтобы webhook отличал от партнёрских кодов
  const code = "pair_c_" + crypto.randomBytes(4).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

  await db`
    INSERT INTO telegram_pairing_codes (code, client_id, expires_at)
    VALUES (${code}, ${clientId}, ${expiresAt.toISOString()})
  `;

  return NextResponse.json({
    code,
    url: `https://t.me/${botUsername}?start=${code}`,
    expires_in: 600,
  });
}
