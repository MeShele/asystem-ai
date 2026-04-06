import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { notifyAdmin } from "@/lib/telegram";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!data.password || typeof data.password !== "string" || data.password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const db = getDb();
  await initPartnerTables();

  const partnerId = "P-" + String(Date.now()).slice(-6);
  const refCode = crypto.randomBytes(4).toString("hex");
  const passwordHash = crypto.createHash("sha256").update(data.password || "").digest("hex");

  try {
    await db`INSERT INTO partners (partner_id, name, email, phone, company, password_hash, ref_code)
      VALUES (
        ${partnerId},
        ${data.name},
        ${data.email},
        ${data.phone || null},
        ${data.company || null},
        ${passwordHash},
        ${refCode}
      )`;

    // Send Telegram notification to admin
    await notifyAdmin(`🤝 Новый партнёр зарегистрирован\nID: ${partnerId}\nИмя: ${data.name}\nEmail: ${data.email}\nRef: ${refCode}`).catch(() => {});

    return NextResponse.json({ success: true, partnerId, refCode });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
