import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("admin_session");
  if (!cookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  await initPartnerTables();

  const rows = await db`SELECT key, value FROM app_settings`;
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key as string] = row.value as string;
  }

  // Mask sensitive keys for display
  for (const sensitiveKey of ["ai_api_key", "telegram_bot_token", "resend_api_key"]) {
    if (settings[sensitiveKey]) {
      const val = settings[sensitiveKey];
      settings[`${sensitiveKey}_masked`] = val.length > 8
        ? val.slice(0, 4) + "..." + val.slice(-4)
        : "****";
    }
  }

  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const cookie = req.cookies.get("admin_session");
  if (!cookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const db = getDb();
  await initPartnerTables();

  const allowedKeys = [
    "ai_provider", "ai_api_key", "ai_model",
    "telegram_bot_token", "telegram_bot_username", "telegram_chat_id", "telegram_group_id",
    "company_name", "company_email", "company_phone",
    "resend_api_key",
  ];

  for (const key of allowedKeys) {
    if (data[key] !== undefined) {
      const existing = await db`SELECT key FROM app_settings WHERE key = ${key}`;
      if (existing.length > 0) {
        await db`UPDATE app_settings SET value = ${data[key]}, updated_at = NOW() WHERE key = ${key}`;
      } else {
        await db`INSERT INTO app_settings (key, value) VALUES (${key}, ${data[key]})`;
      }
    }
  }

  return NextResponse.json({ success: true });
}
