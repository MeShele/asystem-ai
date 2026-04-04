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

  // Mask API key for display
  if (settings.ai_api_key) {
    const key = settings.ai_api_key;
    settings.ai_api_key_masked = key.length > 8
      ? key.slice(0, 4) + "..." + key.slice(-4)
      : "****";
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

  const allowedKeys = ["ai_provider", "ai_api_key", "ai_model"];

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
