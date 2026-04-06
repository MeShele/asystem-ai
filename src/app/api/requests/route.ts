import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { notifyAdmin, sendMessage } from "@/lib/telegram";

async function ensureTable() {
  const db = getDb();
  await db`CREATE TABLE IF NOT EXISTS asystem_requests (
    id SERIAL PRIMARY KEY,
    request_id TEXT UNIQUE,
    name TEXT,
    phone TEXT,
    company TEXT,
    services TEXT[],
    budget TEXT,
    timeline TEXT,
    description TEXT,
    ref_code TEXT,
    partner_id TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("admin_session");
  if (!cookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  await ensureTable();
  const rows = await db`SELECT * FROM asystem_requests ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const db = getDb();
  await ensureTable();
  await initPartnerTables();

  const requestId = "A-" + String(Date.now()).slice(-6);
  const refCode = data.ref || null;

  const budgetMap: Record<string, string> = {
    range1: "до 30 000 сом",
    range2: "30 000 — 100 000 сом",
    range3: "100 000 — 500 000 сом",
    range4: "500 000+ сом",
    undefined: "Не определён",
  };
  const timelineMap: Record<string, string> = {
    asap: "Как можно скорее",
    weeks: "1-2 недели",
    month: "Месяц",
    noRush: "Не срочно",
  };
  const budgetLabel = budgetMap[data.budget] || data.budget || "—";
  const timelineLabel = timelineMap[data.timeline] || data.timeline || "—";

  // Find partner by ref code
  let partnerId: string | null = null;
  let partnerTelegramId: string | null = null;
  if (refCode) {
    const partners = await db`SELECT partner_id, telegram_id, name FROM partners WHERE ref_code = ${refCode}` as Record<string, unknown>[];
    if (partners.length > 0) {
      partnerId = partners[0].partner_id as string;
      partnerTelegramId = partners[0].telegram_id as string | null;
    }
  }

  // Save request
  await db`INSERT INTO asystem_requests (request_id, name, phone, company, services, budget, timeline, description, ref_code, partner_id)
    VALUES (
      ${requestId},
      ${data.name ?? null},
      ${data.phone ?? null},
      ${data.company ?? null},
      ${data.services ?? null},
      ${data.budget ?? null},
      ${data.timeline ?? null},
      ${data.description ?? null},
      ${refCode},
      ${partnerId}
    )`;

  // If partner found, create partner_client record
  if (partnerId) {
    await db`INSERT INTO partner_clients (partner_id, request_id, client_name, client_phone, client_company, project_type, budget, description, status)
      VALUES (
        ${partnerId},
        ${requestId},
        ${data.name ?? null},
        ${data.phone ?? null},
        ${data.company ?? null},
        ${Array.isArray(data.services) ? data.services.join(", ") : data.services ?? null},
        ${data.budget ?? null},
        ${data.description ?? null},
        'new'
      )`;
  }

  // Telegram to admin
  const partnerInfo = partnerId ? `\nПартнёр: ${partnerId} (ref: ${refCode})` : "";
  await notifyAdmin(`🆕 Новая заявка *${requestId}*\nИмя: ${data.name || "—"}\nТелефон: ${data.phone || "—"}\nКомпания: ${data.company || "—"}\nБюджет: ${budgetLabel}\nСроки: ${timelineLabel}${partnerInfo}`).catch(() => {});

  // Telegram to partner
  if (partnerTelegramId) {
    await sendMessage(partnerTelegramId, `🎉 Ваш клиент оставил заявку!\n\nЗаявка: *${requestId}*\nИмя: ${data.name || "—"}\nТелефон: ${data.phone || "—"}\nБюджет: ${budgetLabel}\nСроки: ${timelineLabel}\n\nМы свяжемся с клиентом и будем держать вас в курсе.`).catch(() => {});
  }

  return NextResponse.json({ success: true, requestId });
}
