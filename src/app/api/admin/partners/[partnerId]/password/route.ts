import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import crypto from "crypto";

/**
 * POST { password: string } — админ меняет пароль партнёра.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ partnerId: string }> }) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partnerId } = await params;
  const { password } = await req.json().catch(() => ({}));

  if (!password || typeof password !== "string" || password.length < 6) {
    return NextResponse.json({ error: "Пароль не короче 6 символов" }, { status: 400 });
  }

  await initPartnerTables();
  const db = getDb();

  const exists = (await db`SELECT partner_id FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Record<string, unknown>[];
  if (exists.length === 0) return NextResponse.json({ error: "Партнёр не найден" }, { status: 404 });

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  await db`UPDATE partners SET password_hash = ${passwordHash} WHERE partner_id = ${partnerId}`;

  return NextResponse.json({ ok: true });
}
