import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { validateTelegramWebAppData } from "@/lib/telegram-auth";

type Row = Record<string, unknown>;

/**
 * POST { initData: string } — валидирует Telegram WebApp initData.
 * Сначала ищет партнёра, потом клиента, ставит соответствующую cookie.
 *
 * Если ни тот, ни другой не привязан — 404.
 */
export async function POST(req: NextRequest) {
  await initPartnerTables();
  await initProjectTables();
  const db = getDb();

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

  // 1. Партнёр?
  const partnerRows = (await db`
    SELECT partner_id, name, ref_code FROM partners WHERE telegram_id = ${tgId} LIMIT 1
  `) as Row[];
  if (partnerRows.length > 0) {
    const partner = partnerRows[0];
    const partnerId = String(partner.partner_id);
    const res = NextResponse.json({
      linked: true,
      role: "partner",
      partner: { partner_id: partnerId, name: partner.name, ref_code: partner.ref_code },
    });
    res.cookies.set("partner_session", partnerId, {
      httpOnly: true, secure: true, sameSite: "none",
      maxAge: 60 * 60 * 24 * 7, path: "/",
    });
    // Чистим клиентскую куку на случай если юзер раньше был клиентом
    res.cookies.set("client_session", "", { maxAge: 0, path: "/" });
    return res;
  }

  // 2. Клиент?
  const clientRows = (await db`
    SELECT client_id, name, email FROM clients WHERE telegram_id = ${tgId} LIMIT 1
  `) as Row[];
  if (clientRows.length > 0) {
    const client = clientRows[0];
    const clientId = String(client.client_id);
    const res = NextResponse.json({
      linked: true,
      role: "client",
      client: { client_id: clientId, name: client.name, email: client.email },
    });
    res.cookies.set("client_session", clientId, {
      httpOnly: true, secure: true, sameSite: "none",
      maxAge: 60 * 60 * 24 * 30, path: "/",
    });
    res.cookies.set("partner_session", "", { maxAge: 0, path: "/" });
    return res;
  }

  return NextResponse.json(
    {
      linked: false,
      telegram_user: validation.user,
      message: "Аккаунт не привязан к Telegram. Зарегистрируйтесь на сайте и привяжите Telegram в кабинете.",
    },
    { status: 404 }
  );
}
