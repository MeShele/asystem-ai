import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const db = getDb();
  await initPartnerTables();

  const passwordHash = crypto.createHash("sha256").update(password || "").digest("hex");

  const rows = await db`
    SELECT partner_id, name, email, phone, company, ref_code, telegram_id, telegram_username, commission_rate, status
    FROM partners
    WHERE email = ${email} AND password_hash = ${passwordHash}
  ` as Record<string, unknown>[];

  if (rows.length === 0) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const partner = rows[0];

  const res = NextResponse.json({ success: true, partner });
  res.cookies.set("partner_session", String(partner.partner_id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("partner_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
