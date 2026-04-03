const BOT_TOKEN = () => process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT = () => process.env.TELEGRAM_CHAT_ID!;
const PROJECT_GROUP = () => process.env.TELEGRAM_GROUP_ID!;

const api = (method: string, body?: Record<string, unknown>) =>
  fetch(`https://api.telegram.org/bot${BOT_TOKEN()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json());

// Send message to a chat
export async function sendMessage(chatId: string, text: string) {
  return api("sendMessage", { chat_id: chatId, text, parse_mode: "Markdown" });
}

// Send message to admin
export async function notifyAdmin(text: string) {
  return sendMessage(ADMIN_CHAT(), text);
}

// Send message to a specific topic in the project group
export async function sendToTopic(topicId: number, text: string) {
  return api("sendMessage", {
    chat_id: PROJECT_GROUP(),
    message_thread_id: topicId,
    text,
    parse_mode: "Markdown",
  });
}

// Create a forum topic for a new project
export async function createProjectTopic(projectId: string, clientName: string, partnerName: string) {
  const groupId = PROJECT_GROUP();
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

    // Send welcome message to topic
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

// Create invite link for the project group
export async function createGroupInvite(expireSeconds = 86400) {
  const groupId = PROJECT_GROUP();
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

// Update topic name (e.g., add status)
export async function updateTopicName(topicId: number, name: string) {
  return api("editForumTopic", {
    chat_id: PROJECT_GROUP(),
    message_thread_id: topicId,
    name,
  });
}

// Notify partner about status change
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
