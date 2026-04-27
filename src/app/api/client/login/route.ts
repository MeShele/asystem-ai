import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const email = String(data.email || "").toLowerCase().trim();
  const password = String(data.password || "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 });
  }

  const db = getDb();
  await initProjectTables();

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  const rows = (await db`
    SELECT client_id FROM clients WHERE email = ${email} AND password_hash = ${passwordHash} LIMIT 1
  `) as Record<string, unknown>[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true, clientId: rows[0].client_id });
  res.cookies.set("client_session", rows[0].client_id as string, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("client_session", "", { maxAge: 0, path: "/" });
  return res;
}
