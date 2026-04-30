import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { validateTelegramWebAppData } from "@/lib/telegram-auth";

type Row = Record<string, unknown>;

/**
 * POST { initData: string } — валидирует Telegram WebApp initData,
 * находит партнёра по telegram_id, ставит partner_session cookie.
 *
 * Если партнёр не найден — возвращает 404 с linked=false.
 * Mini App при этом покажет экран «Доступ закрыт» с ссылкой на сайт.
 */
export async function POST(req: NextRequest) {
  await initPartnerTables();
  const db = getDb();

  // Берём bot token из app_settings или env
  const settingsRow = (await db`SELECT value FROM app_settings WHERE key = 'telegram_bot_token' LIMIT 1`) as Row[];
  const botToken = String(settingsRow[0]?.value || process.env.TELEGRAM_BOT_TOKEN || "");
  if (!botToken) {
    return NextResponse.json({ error: "Telegram bot не настроен" }, { status: 500 });
  }

  const { initData } = await req.json();
  if (!initData || typeof initData !== "string") {
    return NextResponse.json({ error: "initData required" }, { status: 400 });
  }

  const validation = validateTelegramWebAppData(initData, botToken);
  if (!validation.ok || !validation.user) {
    return NextResponse.json({ error: "invalid Telegram signature", reason: validation.error }, { status: 401 });
  }

  const tgId = String(validation.user.id);

  // Ищем партнёра по telegram_id
  const rows = (await db`
    SELECT partner_id, name, ref_code FROM partners WHERE telegram_id = ${tgId} LIMIT 1
  `) as Row[];

  if (rows.length === 0) {
    return NextResponse.json(
      {
        linked: false,
        telegram_user: validation.user,
        message: "Аккаунт не привязан к Telegram. Привяжите Telegram в настройках на сайте.",
      },
      { status: 404 }
    );
  }

  const partner = rows[0];
  const partnerId = String(partner.partner_id);

  const res = NextResponse.json({
    linked: true,
    partner: { partner_id: partnerId, name: partner.name, ref_code: partner.ref_code },
  });
  // 7-day cookie для Telegram Mini App. Не httpOnly — JS внутри Mini App может его прочитать (но это не нужно, всё через API)
  res.cookies.set("partner_session", partnerId, {
    httpOnly: true,
    secure: true,
    sameSite: "none", // важно для iframe-Mini App в Telegram
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
