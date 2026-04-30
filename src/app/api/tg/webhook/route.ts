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
    // Уже привязан?
    const linked = (await db`SELECT name FROM partners WHERE telegram_id = ${String(tgUserId)} LIMIT 1`) as Row[];
    if (linked.length > 0) {
      await sendMessage(
        token,
        chatId,
        `👋 Привет, <b>${linked[0].name}</b>!\n\nТвой аккаунт привязан. Открой кабинет через кнопку <b>🚀 Кабинет</b> внизу или жми /cabinet`
      );
    } else {
      await sendMessage(
        token,
        chatId,
        `👋 Привет, ${tgFirstName}!\n\nЯ — бот ASystem партнёрской программы. Чтобы привязать аккаунт:\n\n1. Зарегистрируйся на сайте\n2. В настройках жми «Привязать Telegram»\n3. Перейди по ссылке которую покажет сайт\n\nКогда привяжешь — я буду присылать уведомления о проектах, выплатах и комментариях.`
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
    const result = await db`
      UPDATE partners SET telegram_id = NULL, telegram_username = NULL
      WHERE telegram_id = ${String(tgUserId)}
      RETURNING name
    ` as Row[];
    if (result.length > 0) {
      await sendMessage(token, chatId, `✅ Аккаунт <b>${result[0].name}</b> отвязан. Уведомления больше не приходят.\nЧтобы привязать снова — заходи в настройки на сайте.`);
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

  // Найти валидный код
  const codes = (await db`
    SELECT id, partner_id, expires_at, used_at FROM telegram_pairing_codes WHERE code = ${code} LIMIT 1
  `) as Row[];

  if (codes.length === 0) {
    await sendMessage(token, chatId, `❌ Код не найден или истёк.\n\nЗайди в настройки на сайте → «Привязать Telegram» → получишь свежий код.`);
    return NextResponse.json({ ok: true });
  }

  const codeRow = codes[0];
  if (codeRow.used_at) {
    await sendMessage(token, chatId, `❌ Этот код уже использован.\n\nСгенерируй новый в настройках.`);
    return NextResponse.json({ ok: true });
  }

  if (new Date(codeRow.expires_at as string).getTime() < Date.now()) {
    await sendMessage(token, chatId, `⏰ Код истёк (живёт 10 минут).\n\nСгенерируй новый в настройках.`);
    return NextResponse.json({ ok: true });
  }

  const partnerId = String(codeRow.partner_id);

  // Проверить что telegram_id ещё не привязан к другому партнёру
  const conflict = (await db`
    SELECT partner_id, name FROM partners WHERE telegram_id = ${String(tgUserId)} AND partner_id != ${partnerId} LIMIT 1
  `) as Row[];
  if (conflict.length > 0) {
    await sendMessage(
      token,
      chatId,
      `⚠️ Этот Telegram уже привязан к другому аккаунту: <b>${conflict[0].name}</b>.\n\nЕсли это ошибка — отправь /unlink или обратись к админу.`
    );
    return NextResponse.json({ ok: true });
  }

  // Привязать
  const partnerRows = (await db`
    UPDATE partners
    SET telegram_id = ${String(tgUserId)},
        telegram_username = ${tgUsername}
    WHERE partner_id = ${partnerId}
    RETURNING name
  `) as Row[];

  if (partnerRows.length === 0) {
    await sendMessage(token, chatId, `❌ Партнёр не найден. Обратись к админу.`);
    return NextResponse.json({ ok: true });
  }

  // Пометить код использованным
  await db`UPDATE telegram_pairing_codes SET used_at = NOW() WHERE id = ${codeRow.id}`;

  const partnerName = String(partnerRows[0].name || "");
  await sendMessage(
    token,
    chatId,
    `✅ <b>Аккаунт привязан!</b>\n\n${tgFirstName}, твой аккаунт <b>${partnerName}</b> теперь связан с этим Telegram.\n\nТы будешь получать уведомления о:\n• новых проектах и комиссиях\n• выплатах (одобрено/отклонено)\n• новых комментариях по проектам\n• повышении уровня и достижениях\n• приглашённых sub-партнёрах\n\nКабинет открывается через кнопку <b>🚀 Кабинет</b> внизу. Если её нет — закрой и открой чат заново.`
  );

  return NextResponse.json({ ok: true });
}

// Telegram также может слать GET для health-check — отвечаем 200
export async function GET() {
  return NextResponse.json({ ok: true, service: "asystem-tg-webhook" });
}
