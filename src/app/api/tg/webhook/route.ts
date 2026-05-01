import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

type Row = Record<string, unknown>;

interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: { id: number; type: string };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function getBotToken(): Promise<string> {
  const db = getDb();
  const rows = (await db`SELECT value FROM app_settings WHERE key = 'telegram_bot_token' LIMIT 1`) as Row[];
  return String(rows[0]?.value || process.env.TELEGRAM_BOT_TOKEN || "");
}

async function tgApi(token: string, method: string, body: Record<string, unknown>) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    console.error(`[tg-webhook] tgApi(${method}) failed:`, e);
    return { ok: false };
  }
}

async function sendMessage(token: string, chatId: number, text: string, replyMarkup?: object) {
  return tgApi(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

/**
 * POST — Telegram webhook.
 * Telegram дёргает этот endpoint на каждое входящее сообщение боту.
 *
 * Поддерживаемые команды:
 *   /start <code>     — pairing: связать telegram_id с partner_id
 *   /start            — приветствие
 *   /help             — справка
 *   /unlink           — отвязать аккаунт
 */
export async function POST(req: NextRequest) {
  await initPartnerTables();

  const token = await getBotToken();
  if (!token) {
    console.warn("[tg-webhook] bot token не настроен");
    return NextResponse.json({ ok: true }); // отвечаем 200 чтобы Telegram не ретраил
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const msg = update.message;
  if (!msg || !msg.from || msg.from.is_bot) return NextResponse.json({ ok: true });

  const text = (msg.text || "").trim();
  const chatId = msg.chat.id;
  const tgUserId = msg.from.id;
  const tgUsername = msg.from.username || null;
  const tgFirstName = msg.from.first_name || "друг";

  const db = getDb();

  // /start <code> — pairing flow
  if (text.startsWith("/start ")) {
    const code = text.slice(7).trim();
    return await handleStartCode(token, chatId, tgUserId, tgUsername, tgFirstName, code);
  }

  if (text === "/start") {
    const linkedPartner = (await db`SELECT name FROM partners WHERE telegram_id = ${String(tgUserId)} LIMIT 1`) as Row[];
    const linkedClient = (await db`SELECT name FROM clients WHERE telegram_id = ${String(tgUserId)} LIMIT 1`) as Row[];
    if (linkedPartner.length > 0) {
      await sendMessage(
        token,
        chatId,
        `👋 Привет, <b>${linkedPartner[0].name}</b>!\n\nПартнёрский кабинет привязан. Открой через кнопку <b>🚀 Кабинет</b> внизу или /cabinet`
      );
    } else if (linkedClient.length > 0) {
      await sendMessage(
        token,
        chatId,
        `👋 Привет, <b>${linkedClient[0].name}</b>!\n\nКлиентский кабинет привязан. Здесь будешь получать обновления по своему проекту. Открой через кнопку <b>🚀 Кабинет</b> внизу или /cabinet`
      );
    } else {
      await sendMessage(
        token,
        chatId,
        `👋 Привет, ${tgFirstName}!\n\nЯ — бот ASystem AI. Чтобы привязать аккаунт:\n\n1. Зарегистрируйся на сайте (как клиент или партнёр)\n2. В кабинете жми «Привязать Telegram»\n3. Перейди по ссылке которую покажет сайт\n\nПосле привязки буду слать уведомления по проекту, статусам и комментариям.`
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (text === "/help") {
    await sendMessage(
      token,
      chatId,
      `📖 <b>Команды:</b>\n\n/start — приветствие и инструкция\n/cabinet — открыть Mini App\n/unlink — отвязать аккаунт\n/help — это сообщение\n\nПолный кабинет — на сайте: уровни, выплаты, реф-ссылка для приглашений партнёров.`
    );
    return NextResponse.json({ ok: true });
  }

  if (text === "/unlink") {
    const partnerUnlinked = (await db`
      UPDATE partners SET telegram_id = NULL, telegram_username = NULL
      WHERE telegram_id = ${String(tgUserId)}
      RETURNING name
    `) as Row[];
    const clientUnlinked = (await db`
      UPDATE clients SET telegram_id = NULL, telegram_username = NULL
      WHERE telegram_id = ${String(tgUserId)}
      RETURNING name
    `) as Row[];
    const names = [...partnerUnlinked, ...clientUnlinked].map((r) => r.name).join(", ");
    if (names) {
      await sendMessage(token, chatId, `✅ Отвязано: <b>${names}</b>. Уведомления больше не приходят.\nЧтобы привязать снова — зайди в кабинет на сайте.`);
    } else {
      await sendMessage(token, chatId, `Этот Telegram не привязан ни к одному аккаунту.`);
    }
    return NextResponse.json({ ok: true });
  }

  if (text === "/cabinet") {
    await sendMessage(token, chatId, `Открой кабинет через кнопку <b>🚀 Кабинет</b> в меню (слева от поля ввода).\n\nЕсли кнопки нет — закрой и открой чат заново.`);
    return NextResponse.json({ ok: true });
  }

  // Любой другой текст — мягкая подсказка
  await sendMessage(token, chatId, `Не понял команду. Жми /help чтобы увидеть список команд.`);
  return NextResponse.json({ ok: true });
}

async function handleStartCode(
  token: string,
  chatId: number,
  tgUserId: number,
  tgUsername: string | null,
  tgFirstName: string,
  code: string
) {
  const db = getDb();

  const codes = (await db`
    SELECT id, partner_id, client_id, expires_at, used_at FROM telegram_pairing_codes WHERE code = ${code} LIMIT 1
  `) as Row[];

  if (codes.length === 0) {
    await sendMessage(token, chatId, `❌ Код не найден или истёк.\n\nЗайди в кабинет на сайте → «Привязать Telegram» → получишь свежий код.`);
    return NextResponse.json({ ok: true });
  }

  const codeRow = codes[0];
  if (codeRow.used_at) {
    await sendMessage(token, chatId, `❌ Этот код уже использован.\n\nСгенерируй новый в кабинете.`);
    return NextResponse.json({ ok: true });
  }

  if (new Date(codeRow.expires_at as string).getTime() < Date.now()) {
    await sendMessage(token, chatId, `⏰ Код истёк (живёт 10 минут).\n\nСгенерируй новый в кабинете.`);
    return NextResponse.json({ ok: true });
  }

  const tgIdStr = String(tgUserId);
  const isClientCode = !!codeRow.client_id;
  const isPartnerCode = !!codeRow.partner_id;

  if (isClientCode) {
    const clientId = String(codeRow.client_id);
    const conflict = (await db`
      SELECT client_id, name FROM clients WHERE telegram_id = ${tgIdStr} AND client_id != ${clientId} LIMIT 1
    `) as Row[];
    if (conflict.length > 0) {
      await sendMessage(token, chatId, `⚠️ Этот Telegram уже привязан к другому клиенту: <b>${conflict[0].name}</b>. Отправь /unlink.`);
      return NextResponse.json({ ok: true });
    }
    const clientRows = (await db`
      UPDATE clients SET telegram_id = ${tgIdStr}, telegram_username = ${tgUsername}
      WHERE client_id = ${clientId}
      RETURNING name
    `) as Row[];
    if (clientRows.length === 0) {
      await sendMessage(token, chatId, `❌ Клиент не найден. Обратись в поддержку.`);
      return NextResponse.json({ ok: true });
    }
    await db`UPDATE telegram_pairing_codes SET used_at = NOW() WHERE id = ${codeRow.id}`;
    await sendMessage(
      token,
      chatId,
      `✅ <b>Кабинет клиента привязан!</b>\n\n${tgFirstName}, аккаунт <b>${clientRows[0].name}</b> теперь связан с Telegram.\n\nТы будешь получать уведомления:\n• о новых этапах работы\n• о смене статуса проекта\n• о комментариях команды\n• о готовности результата\n\nКабинет открывается через кнопку <b>🚀 Кабинет</b> внизу. Если её нет — закрой и открой чат заново.`
    );
    return NextResponse.json({ ok: true });
  }

  if (isPartnerCode) {
    const partnerId = String(codeRow.partner_id);
    const conflict = (await db`
      SELECT partner_id, name FROM partners WHERE telegram_id = ${tgIdStr} AND partner_id != ${partnerId} LIMIT 1
    `) as Row[];
    if (conflict.length > 0) {
      await sendMessage(
        token,
        chatId,
        `⚠️ Этот Telegram уже привязан к другому аккаунту: <b>${conflict[0].name}</b>. Отправь /unlink или обратись к админу.`
      );
      return NextResponse.json({ ok: true });
    }
    const partnerRows = (await db`
      UPDATE partners SET telegram_id = ${tgIdStr}, telegram_username = ${tgUsername}
      WHERE partner_id = ${partnerId}
      RETURNING name
    `) as Row[];
    if (partnerRows.length === 0) {
      await sendMessage(token, chatId, `❌ Партнёр не найден. Обратись к админу.`);
      return NextResponse.json({ ok: true });
    }
    await db`UPDATE telegram_pairing_codes SET used_at = NOW() WHERE id = ${codeRow.id}`;
    const partnerName = String(partnerRows[0].name || "");
    await sendMessage(
      token,
      chatId,
      `✅ <b>Партнёрский кабинет привязан!</b>\n\n${tgFirstName}, аккаунт <b>${partnerName}</b> теперь связан с Telegram.\n\nУведомления:\n• новые проекты и комиссии\n• выплаты (одобрено/отклонено)\n• комментарии по проектам\n• повышение уровня и достижения\n• приглашённые sub-партнёры\n\nКабинет — через кнопку <b>🚀 Кабинет</b> внизу. Если её нет — закрой и открой чат заново.`
    );
    return NextResponse.json({ ok: true });
  }

  await sendMessage(token, chatId, `❌ Код повреждён (не привязан ни к клиенту, ни к партнёру). Сгенерируй новый.`);
  return NextResponse.json({ ok: true });
}

// Telegram также может слать GET для health-check — отвечаем 200
export async function GET() {
  return NextResponse.json({ ok: true, service: "asystem-tg-webhook" });
}
