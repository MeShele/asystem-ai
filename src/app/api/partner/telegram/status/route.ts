import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

type Row = Record<string, unknown>;

/**
 * GET — статус привязки Telegram у текущего партнёра.
 * Используется для polling после генерации pairing-кода (UI ждёт пока партнёр в боте подтвердит).
 */
export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initPartnerTables();
  const db = getDb();

  const rows = (await db`
    SELECT telegram_id, telegram_username FROM partners WHERE partner_id = ${partnerId} LIMIT 1
  `) as Row[];

  if (rows.length === 0) return NextResponse.json({ linked: false });

  const linked = !!rows[0].telegram_id;
  return NextResponse.json({
    linked,
    telegram_id: rows[0].telegram_id || null,
    telegram_username: rows[0].telegram_username || null,
  });
}
