import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import crypto from "crypto";

type Row = Record<string, unknown>;

/**
 * POST — создаёт pairing-код, возвращает t.me-deeplink на бота с этим кодом.
 * Партнёр переходит по ссылке, бот ловит /start <код>, привязывает telegram_id.
 *
 * Пример ответа:
 * { code: "pair_a3f9k2", url: "https://t.me/asystem_bot?start=pair_a3f9k2", expires_in: 600 }
 */
export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initPartnerTables();
  const db = getDb();

  // Bot username — нужен для t.me-ссылки
  const settingRow = (await db`SELECT value FROM app_settings WHERE key = 'telegram_bot_username' LIMIT 1`) as Row[];
  const botUsername = String(settingRow[0]?.value || process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, "");
  if (!botUsername) {
    return NextResponse.json(
      { error: "Telegram бот не настроен. Админ должен задать telegram_bot_username в настройках." },
      { status: 503 }
    );
  }

  // Удаляем старые/использованные коды этого партнёра — оставляем только свежий
  await db`DELETE FROM telegram_pairing_codes WHERE partner_id = ${partnerId}`;

  // Генерируем короткий код (читаемый, без спорных символов)
  const code = "pair_" + crypto.randomBytes(4).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

  await db`
    INSERT INTO telegram_pairing_codes (code, partner_id, expires_at)
    VALUES (${code}, ${partnerId}, ${expiresAt.toISOString()})
  `;

  return NextResponse.json({
    code,
    url: `https://t.me/${botUsername}?start=${code}`,
    expires_in: 600,
  });
}
