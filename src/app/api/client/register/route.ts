import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    return NextResponse.json({ error: "Имя обязательно" }, { status: 400 });
  }
  if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
    return NextResponse.json({ error: "Корректный email обязателен" }, { status: 400 });
  }
  if (!data.password || typeof data.password !== "string" || data.password.length < 6) {
    return NextResponse.json({ error: "Пароль не короче 6 символов" }, { status: 400 });
  }

  const db = getDb();
  await initProjectTables();

  // Optional invite token
  let inviteId: number | null = null;
  let inviteProjectId: string | null = null;
  if (data.invite_token) {
    const inv = (await db`
      SELECT id, role, project_id, used_at, expires_at FROM invites WHERE token = ${data.invite_token} LIMIT 1
    `) as Record<string, unknown>[];
    if (inv.length === 0) return NextResponse.json({ error: "Invite не найден" }, { status: 400 });
    if (inv[0].role !== "client") return NextResponse.json({ error: "Не клиентский invite" }, { status: 400 });
    if (inv[0].used_at) return NextResponse.json({ error: "Invite уже использован" }, { status: 400 });
    if (inv[0].expires_at && new Date(inv[0].expires_at as string).getTime() < Date.now()) {
      return NextResponse.json({ error: "Invite истёк" }, { status: 400 });
    }
    inviteId = Number(inv[0].id);
    inviteProjectId = (inv[0].project_id as string | null) ?? null;
  }

  // Email uniqueness
  const existing = (await db`SELECT id FROM clients WHERE email = ${String(data.email).toLowerCase()} LIMIT 1`) as Record<string, unknown>[];
  if (existing.length > 0) {
    return NextResponse.json({ error: "Клиент с таким email уже существует" }, { status: 409 });
  }

  const clientId = "C-" + String(Date.now()).slice(-6);
  const passwordHash = crypto.createHash("sha256").update(data.password).digest("hex");

  await db`
    INSERT INTO clients (client_id, name, email, phone, password_hash)
    VALUES (
      ${clientId},
      ${String(data.name).trim()},
      ${String(data.email).toLowerCase()},
      ${data.phone ?? null},
      ${passwordHash}
    )
  `;

  // Mark invite used + auto-link project if invite carried project_id
  if (inviteId) {
    await db`UPDATE invites SET used_at = NOW() WHERE id = ${inviteId}`;
  }
  if (inviteProjectId) {
    await db`UPDATE projects SET client_id = ${clientId} WHERE project_id = ${inviteProjectId}`;
  }

  // Auto-login: set cookie
  const res = NextResponse.json({ success: true, clientId });
  res.cookies.set("client_session", clientId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
