import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { notifyAdmin } from "@/lib/telegram";
import { notify } from "@/lib/notify";
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
  await initProjectTables();

  // If invite token provided — validate
  let inviteId: number | null = null;
  if (data.invite_token) {
    const inv = (await db`
      SELECT id, role, used_at, expires_at FROM invites WHERE token = ${data.invite_token} LIMIT 1
    `) as Record<string, unknown>[];
    if (inv.length === 0) return NextResponse.json({ error: "invite not found" }, { status: 400 });
    if (inv[0].role !== "partner") return NextResponse.json({ error: "wrong invite role" }, { status: 400 });
    if (inv[0].used_at) return NextResponse.json({ error: "invite already used" }, { status: 400 });
    if (inv[0].expires_at && new Date(inv[0].expires_at as string).getTime() < Date.now()) {
      return NextResponse.json({ error: "invite expired" }, { status: 400 });
    }
    inviteId = Number(inv[0].id);
  }

  const partnerId = "P-" + String(Date.now()).slice(-6);
  const refCode = crypto.randomBytes(4).toString("hex");
  const passwordHash = crypto.createHash("sha256").update(data.password || "").digest("hex");

  // Auto-founding: первые 5 партнёров получают статус автоматически
  const FOUNDING_LIMIT = 5;
  const countRow = (await db`SELECT COUNT(*) AS c FROM partners`) as Record<string, unknown>[];
  const existingCount = Number(countRow[0]?.c || 0);
  const isFounding = existingCount < FOUNDING_LIMIT;

  // Sub-partner: capture referrer через ref_code (от приглашающего партнёра)
  let referrerPartnerId: string | null = null;
  let referrerName: string | null = null;
  if (data.ref_code) {
    const ref = (await db`SELECT partner_id, name FROM partners WHERE ref_code = ${String(data.ref_code)} LIMIT 1`) as Record<string, unknown>[];
    if (ref.length > 0) {
      referrerPartnerId = String(ref[0].partner_id);
      referrerName = String(ref[0].name || "");
    }
  }

  try {
    await db`INSERT INTO partners (partner_id, name, email, phone, company, password_hash, ref_code, is_founding, referrer_partner_id)
      VALUES (
        ${partnerId},
        ${data.name},
        ${data.email},
        ${data.phone || null},
        ${data.company || null},
        ${passwordHash},
        ${refCode},
        ${isFounding},
        ${referrerPartnerId}
      )`;

    if (inviteId) {
      await db`UPDATE invites SET used_at = NOW() WHERE id = ${inviteId}`;
    }

    const foundingNote = isFounding ? `\n⭐ Founding Partner #${existingCount + 1} (+5% lifetime)` : "";
    const refNote = referrerPartnerId ? `\n👥 Sub-partner от ${referrerName || referrerPartnerId}` : "";
    await notifyAdmin(`🤝 Новый партнёр зарегистрирован\nID: ${partnerId}\nИмя: ${data.name}\nEmail: ${data.email}\nRef: ${refCode}${foundingNote}${refNote}`).catch(() => {});

    // Уведомление пригласившему партнёру
    if (referrerPartnerId) {
      await notify({
        userRole: "partner",
        userId: referrerPartnerId,
        kind: "lead_assigned",
        title: `Новый партнёр в твоей сети`,
        body: `${String(data.name).trim()} зарегистрировался по твоей реф-ссылке. Ты будешь получать override с его сделок.`,
        link: `/partner/network`,
        payload: { newPartnerId: partnerId },
      });
    }

    return NextResponse.json({ success: true, partnerId, refCode, isFounding });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
