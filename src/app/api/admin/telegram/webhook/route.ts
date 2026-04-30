import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Row = Record<string, unknown>;

async function getBotToken(): Promise<string> {
  const db = getDb();
  const rows = (await db`SELECT value FROM app_settings WHERE key = 'telegram_bot_token' LIMIT 1`) as Row[];
  return String(rows[0]?.value || process.env.TELEGRAM_BOT_TOKEN || "");
}

async function tgApi(token: string, method: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

/**
 * GET — статус текущего webhook
 */
export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getBotToken();
  if (!token) return NextResponse.json({ error: "Bot token не настроен" }, { status: 503 });

  const info = await tgApi(token, "getWebhookInfo");
  const me = await tgApi(token, "getMe");
  return NextResponse.json({ webhook: info.result || null, bot: me.result || null });
}

/**
 * POST — установить webhook на текущий origin (или указанный URL).
 * body: { url?: string } — если не передать, берётся из заголовка origin.
 */
export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = await getBotToken();
  if (!token) return NextResponse.json({ error: "Bot token не настроен. Задай telegram_bot_token в настройках." }, { status: 503 });

  const data = await req.json().catch(() => ({}));
  let baseUrl: string = data.url || "";
  if (!baseUrl) {
    // Берём origin из заголовков
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    baseUrl = `${proto}://${host}`;
  }
  const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/tg/webhook`;

  const result = await tgApi(token, "setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: false,
  });

  return NextResponse.json({ webhookUrl, result });
}

/**
 * DELETE — удалить webhook (бот станет «не отвечает» в Telegram)
 */
export async function DELETE(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const token = await getBotToken();
  if (!token) return NextResponse.json({ error: "Bot token не настроен" }, { status: 503 });
  const result = await tgApi(token, "deleteWebhook", { drop_pending_updates: false });
  return NextResponse.json({ result });
}
