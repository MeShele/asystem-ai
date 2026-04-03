import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const data = await req.json();
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
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤝 Новый партнёр зарегистрирован\nID: ${partnerId}\nИмя: ${data.name}\nEmail: ${data.email}\nRef: ${refCode}`,
          parse_mode: "Markdown",
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, partnerId, refCode });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
