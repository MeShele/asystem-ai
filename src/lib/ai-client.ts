import { getDb, initPartnerTables } from "./db";

type Message = { role: "system" | "user" | "assistant"; content: string };

async function getAiSettings() {
  const db = getDb();
  await initPartnerTables();
  const rows = await db`SELECT key, value FROM app_settings WHERE key IN ('ai_provider', 'ai_api_key', 'ai_model')`;
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key as string] = row.value as string;
  }
  return {
    provider: (settings.ai_provider || "openrouter") as "openrouter" | "anthropic",
    apiKey: settings.ai_api_key || "",
    model: settings.ai_model || "anthropic/claude-sonnet-4",
  };
}

async function callOpenRouter(messages: Message[], apiKey: string, model: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://asystemai.asystem.kg",
      "X-Title": "Asystem AI KP Agent",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(messages: Message[], apiKey: string, model: string): Promise<string> {
  const systemMsg = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemMsg?.content || "",
      messages: chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export async function chatWithAi(messages: Message[]): Promise<string> {
  const settings = await getAiSettings();

  if (!settings.apiKey) {
    throw new Error("AI API key not configured. Go to Admin → Settings to add it.");
  }

  if (settings.provider === "anthropic") {
    return callAnthropic(messages, settings.apiKey, settings.model);
  }

  return callOpenRouter(messages, settings.apiKey, settings.model);
}
