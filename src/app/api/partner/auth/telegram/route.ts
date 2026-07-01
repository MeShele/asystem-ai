import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { notifyAdmin } from "@/lib/telegram";
import { notify } from "@/lib/notify";
import crypto from "crypto";

// Verify Telegram Login Widget data
function verifyTelegramAuth(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...rest } = data;
  if (!hash) return false;

  const secret = crypto.createHash("sha256").update(botToken).digest();
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");

  return hmac === hash;
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ error: "Bot not configured" }, { status: 500 });
  }

  // Verify Telegram data
  if (!verifyTelegramAuth(data, botToken)) {
    return NextResponse.json({ error: "Invalid Telegram auth" }, { status: 401 });
  }

  const telegramId = String(data.id);
  const firstName = data.first_name || "";
  const lastName = data.last_name || "";
  const username = data.username || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const db = getDb();
  await initPartnerTables();

  // Check if partner exists with this telegram_id
  const existing = await db`
    SELECT partner_id, name, email FROM partners WHERE telegram_id = ${telegramId}
  ` as Record<string, unknown>[];

  let partnerId: string;

  if (existing.length > 0) {
    // Login existing partner
    partnerId = String(existing[0].partner_id);
  } else {
    // Register new partner via Telegram
    partnerId = "P-" + String(Date.now()).slice(-6);
    const refCode = crypto.randomBytes(4).toString("hex");
    let referrerPartnerId: string | null = null;
    const refCookie = req.cookies.get("partner_ref")?.value;

    if (refCookie) {
      const refRows = (await db`SELECT partner_id FROM partners WHERE ref_code = ${refCookie} LIMIT 1`) as Record<string, unknown>[];
      if (refRows.length > 0) referrerPartnerId = String(refRows[0].partner_id);
    }

    await db`INSERT INTO partners (partner_id, name, telegram_id, telegram_username, ref_code, password_hash, referrer_partner_id)
      VALUES (
        ${partnerId},
        ${fullName || username || "Partner"},
        ${telegramId},
        ${username || null},
        ${refCode},
        ${crypto.randomBytes(16).toString("hex")},
        ${referrerPartnerId}
      )`;

    if (referrerPartnerId) {
      await notify({
        userRole: "partner",
        userId: referrerPartnerId,
        kind: "lead_assigned",
        title: "Новый партнёр в твоей сети",
        body: `${fullName || username || "Новый партнёр"} зарегистрировался по твоей реф-ссылке. Ты будешь получать override с его сделок.`,
        link: "/partner/network",
        payload: { newPartnerId: partnerId },
      });
    }

    // Notify admin
    await notifyAdmin(`🤝 Новый партнёр через Telegram\nID: ${partnerId}\nИмя: ${fullName}\nTG: @${username || "—"}`).catch(() => {});
  }

  // Set session cookie
  const res = NextResponse.json({ success: true, partnerId });
  res.cookies.set("partner_session", partnerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set("partner_ref", "", { path: "/", maxAge: 0 });

  return res;
}
