import { getDb } from "./db";

export type NotificationKind =
  | "project_created"
  | "project_status_changed"
  | "stage_updated"
  | "comment_added"
  | "payout_paid"
  | "payout_rejected"
  | "level_up"
  | "level_down"
  | "milestone_unlocked"
  | "milestone_paid"
  | "milestone_rejected"
  | "lead_assigned"
  | "request_assigned"
  | "review_received"
  | "duplicate_lead";

export interface NotifyArgs {
  userRole: "partner" | "admin" | "client";
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string | null;
  link?: string | null;
  payload?: Record<string, unknown> | null;
}

type Row = Record<string, unknown>;

let cachedBotToken: string | null = null;
let botTokenCachedAt = 0;

async function getBotToken(): Promise<string> {
  const now = Date.now();
  if (cachedBotToken !== null && now - botTokenCachedAt < 60_000) return cachedBotToken;
  try {
    const db = getDb();
    const rows = (await db`SELECT value FROM app_settings WHERE key = 'telegram_bot_token' LIMIT 1`) as Row[];
    cachedBotToken = String(rows[0]?.value || process.env.TELEGRAM_BOT_TOKEN || "");
    botTokenCachedAt = now;
    return cachedBotToken;
  } catch {
    return process.env.TELEGRAM_BOT_TOKEN || "";
  }
}

/**
 * Отправляет sendMessage в Telegram с inline-кнопкой "Открыть Mini App".
 * Безопасна — не бросает.
 */
async function sendTelegramMessage(
  telegramId: string,
  title: string,
  body: string | null | undefined,
  link: string | null | undefined
): Promise<void> {
  const token = await getBotToken();
  if (!token) return;

  // Текст: title (bold) + body. Telegram HTML.
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let text = `<b>${escape(title)}</b>`;
  if (body) text += `\n\n${escape(body)}`;

  // Inline-keyboard с web_app кнопкой если есть link
  // Web App требует абсолютный URL. Берём из env.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "";
  const replyMarkup = link && baseUrl
    ? {
        inline_keyboard: [
          [
            {
              text: "🚀 Открыть",
              web_app: { url: `${baseUrl.replace(/\/$/, "")}/ru/tg${link.startsWith("/partner") ? link.replace("/partner", "") : link}` },
            },
          ],
        ],
      }
    : undefined;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
      }),
    });
  } catch (err) {
    console.warn("[notify] telegram send failed:", err);
  }
}

/**
 * Создаёт уведомление в БД и параллельно шлёт в Telegram (если у партнёра есть telegram_id).
 * Безопасна — никогда не бросает.
 */
export async function notify(args: NotifyArgs): Promise<void> {
  try {
    const db = getDb();
    await db`
      INSERT INTO notifications (user_role, user_id, kind, title, body, link, payload)
      VALUES (
        ${args.userRole},
        ${args.userId},
        ${args.kind},
        ${args.title},
        ${args.body ?? null},
        ${args.link ?? null},
        ${args.payload ? JSON.stringify(args.payload) : null}
      )
    `;

    // Telegram-уведомления только для партнёров с привязанным telegram_id
    if (args.userRole === "partner") {
      const rows = (await db`SELECT telegram_id FROM partners WHERE partner_id = ${args.userId} LIMIT 1`) as Row[];
      const tgId = rows[0]?.telegram_id ? String(rows[0].telegram_id) : null;
      if (tgId) {
        // Не блокируем основной flow — fire-and-forget
        sendTelegramMessage(tgId, args.title, args.body ?? null, args.link ?? null).catch(() => {});
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[notify] failed:", err);
  }
}

/**
 * Уведомить админов. Хранится под user_id='admin'.
 * Также отправляется в Telegram админскому chat_id если задан.
 */
export async function notifyAdmins(args: Omit<NotifyArgs, "userRole" | "userId">): Promise<void> {
  await notify({ ...args, userRole: "admin", userId: "admin" });

  // Дополнительно — admin telegram_chat_id из настроек
  try {
    const db = getDb();
    const rows = (await db`SELECT value FROM app_settings WHERE key = 'telegram_chat_id' LIMIT 1`) as Row[];
    const adminChatId = String(rows[0]?.value || process.env.TELEGRAM_CHAT_ID || "");
    if (adminChatId) {
      sendTelegramMessage(adminChatId, args.title, args.body ?? null, args.link ?? null).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}
