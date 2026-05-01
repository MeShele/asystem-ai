import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import crypto from "crypto";

type Row = Record<string, unknown>;

/**
 * POST { current_password: string, new_password: string } — партнёр меняет свой пароль.
 * Проверяет старый пароль через sha256-сравнение.
 */
export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const data = await req.json().catch(() => ({}));
  const current = typeof data.current_password === "string" ? data.current_password : "";
  const next = typeof data.new_password === "string" ? data.new_password : "";

  if (next.length < 6) {
    return NextResponse.json({ error: "Новый пароль не короче 6 символов" }, { status: 400 });
  }
  if (current === next) {
    return NextResponse.json({ error: "Новый пароль должен отличаться от старого" }, { status: 400 });
  }

  await initPartnerTables();
  const db = getDb();

  const rows = (await db`SELECT password_hash FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Row[];
  if (rows.length === 0) return NextResponse.json({ error: "Партнёр не найден" }, { status: 404 });

  const currentHash = crypto.createHash("sha256").update(current).digest("hex");
  if (rows[0].password_hash !== currentHash) {
    return NextResponse.json({ error: "Текущий пароль неверный" }, { status: 403 });
  }

  const newHash = crypto.createHash("sha256").update(next).digest("hex");
  await db`UPDATE partners SET password_hash = ${newHash} WHERE partner_id = ${partnerId}`;

  return NextResponse.json({ ok: true });
}
