import { getDb } from "./db";

// Cache settings for 60 seconds to avoid DB hit on every call
let cachedSettings: Record<string, string> | null = null;
let cacheTime = 0;

async function getTelegramSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedSettings && now - cacheTime < 60000) {
    return cachedSettings;
  }

  try {
    const db = getDb();
    const rows = await db`SELECT key, value FROM app_settings WHERE key IN ('telegram_bot_token', 'telegram_chat_id', 'telegram_group_id')`;
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key as string] = row.value as string;
    }

    // Fallback to env vars if DB is empty
    if (!settings.telegram_bot_token) settings.telegram_bot_token = process.env.TELEGRAM_BOT_TOKEN || "";
    if (!settings.telegram_chat_id) settings.telegram_chat_id = process.env.TELEGRAM_CHAT_ID || "";
    if (!settings.telegram_group_id) settings.telegram_group_id = process.env.TELEGRAM_GROUP_ID || "";

    cachedSettings = settings;
    cacheTime = now;
    return settings;
  } catch {
    // If DB not ready, fall back to env
    return {
      telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN || "",
      telegram_chat_id: process.env.TELEGRAM_CHAT_ID || "",
      telegram_group_id: process.env.TELEGRAM_GROUP_ID || "",
    };
  }
}

const api = async (method: string, body?: Record<string, unknown>) => {
  const settings = await getTelegramSettings();
  const token = settings.telegram_bot_token;
  if (!token) {
    console.warn(`Telegram API skipped (no bot token): ${method}`);
    return { ok: false, description: "Bot token not configured" };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!data.ok) {
      console.error(`Telegram API error (${method}):`, data.description);
    }
    return data;
  } catch (e) {
    console.error(`Telegram API fetch failed (${method}):`, e);
    return { ok: false, description: "Network error" };
  }
};

export async function sendMessage(chatId: string, text: string) {
  return api("sendMessage", { chat_id: chatId, text, parse_mode: "Markdown" });
}

export async function notifyAdmin(text: string) {
  const settings = await getTelegramSettings();
  const chatId = settings.telegram_chat_id;
  if (!chatId) return { ok: false, description: "Admin chat ID not configured" };
  return sendMessage(chatId, text);
}

export async function sendToTopic(topicId: number, text: string) {
  const settings = await getTelegramSettings();
  const groupId = settings.telegram_group_id;
  if (!groupId) return { ok: false, description: "Group ID not configured" };
  return api("sendMessage", {
    chat_id: groupId,
    message_thread_id: topicId,
    text,
    parse_mode: "Markdown",
  });
}

export async function createProjectTopic(projectId: string, clientName: string, partnerName: string) {
  const settings = await getTelegramSettings();
  const groupId = settings.telegram_group_id;
  if (!groupId) return null;

  try {
    const result = await api("createForumTopic", {
      chat_id: groupId,
      name: `${projectId} | ${clientName}`,
      icon_custom_emoji_id: undefined,
    });

    if (!result.ok) {
      console.error("Failed to create topic:", result);
      return null;
    }

    const topicId = result.result.message_thread_id;

    await sendToTopic(topicId, [
      `📋 *Проект ${projectId}*`,
      ``,
      `Клиент: ${clientName}`,
      `Партнёр: ${partnerName}`,
      `Статус: *Новый*`,
      ``,
      `Этот топик — рабочее пространство проекта.`,
      `Все обновления будут приходить сюда.`,
    ].join("\n"));

    return topicId;
  } catch (e) {
    console.error("Topic creation error:", e);
    return null;
  }
}

export async function createGroupInvite(expireSeconds = 86400) {
  const settings = await getTelegramSettings();
  const groupId = settings.telegram_group_id;
  if (!groupId) return null;

  try {
    const result = await api("createChatInviteLink", {
      chat_id: groupId,
      expire_date: Math.floor(Date.now() / 1000) + expireSeconds,
      member_limit: 1,
    });

    return result.ok ? result.result.invite_link : null;
  } catch {
    return null;
  }
}

export async function updateTopicName(topicId: number, name: string) {
  const settings = await getTelegramSettings();
  const groupId = settings.telegram_group_id;
  if (!groupId) return { ok: false, description: "Group ID not configured" };
  return api("editForumTopic", {
    chat_id: groupId,
    message_thread_id: topicId,
    name,
  });
}

export async function notifyPartnerStatus(
  partnerTelegramId: string,
  projectId: string,
  clientName: string,
  status: string,
  commission?: number
) {
  const statusLabels: Record<string, string> = {
    new: "🆕 Новый",
    discussing: "💬 Обсуждение",
    in_progress: "⚙️ В работе",
    review: "🔍 На проверке",
    completed: "✅ Завершён",
    cancelled: "❌ Отменён",
  };

  let text = `📋 *Проект ${projectId}*\nКлиент: ${clientName}\nСтатус: ${statusLabels[status] || status}`;

  if (status === "completed" && commission) {
    text += `\n\n💰 Ваша комиссия: *$${commission}*`;
  }

  return sendMessage(partnerTelegramId, text);
}
