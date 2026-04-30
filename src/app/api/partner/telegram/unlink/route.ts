import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * POST — отвязать Telegram от аккаунта партнёра.
 */
export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  await db`UPDATE partners SET telegram_id = NULL, telegram_username = NULL WHERE partner_id = ${partnerId}`;
  await db`DELETE FROM telegram_pairing_codes WHERE partner_id = ${partnerId}`;
  return NextResponse.json({ ok: true });
}
