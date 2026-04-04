import { NextRequest, NextResponse } from 'next/server';
import { getDb, initPartnerTables } from '@/lib/db';

// GET — список партнёров для админа (из основной таблицы partners)
export async function GET() {
  try {
    const db = getDb();
    await initPartnerTables();

    const rows = await db`
      SELECT
        p.partner_id, p.name, p.email, p.phone, p.company,
        p.ref_code, p.commission_rate, p.status, p.telegram_username,
        p.created_at,
        COUNT(pc.id) as total_clients,
        COALESCE(SUM(pc.commission), 0) as total_earned
      FROM partners p
      LEFT JOIN partner_clients pc ON pc.partner_id = p.partner_id
      GROUP BY p.id, p.partner_id, p.name, p.email, p.phone, p.company,
               p.ref_code, p.commission_rate, p.status, p.telegram_username, p.created_at
      ORDER BY p.created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (e) {
    console.error('Failed to fetch partners:', e);
    return NextResponse.json([]);
  }
}

// POST — новая заявка партнёра (legacy intake form)
export async function POST(req: NextRequest) {
  const data = await req.json();
  const db = getDb();

  await db`CREATE TABLE IF NOT EXISTS asystem_partners (
    id SERIAL PRIMARY KEY,
    partner_id TEXT UNIQUE,
    name TEXT,
    phone TEXT,
    company TEXT,
    website TEXT,
    specialization TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  const partnerId = 'P-' + String(Date.now()).slice(-4);

  try {
    await db`INSERT INTO asystem_partners (partner_id, name, phone, company, website, specialization, message)
      VALUES (
        ${partnerId},
        ${data.name ?? null},
        ${data.phone ?? null},
        ${data.company ?? null},
        ${data.website ?? null},
        ${data.specialization ?? null},
        ${data.message ?? null}
      )`;
  } catch (e) {
    console.error('DB insert failed:', e);
  }

  // Telegram notification
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (botToken && chatId) {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤝 Новый партнёр *${partnerId}*\nИмя: ${data.name || '—'}\nКомпания: ${data.company || '—'}\nТелефон: ${data.phone || '—'}\nСпециализация: ${data.specialization || '—'}`,
          parse_mode: 'Markdown',
        }),
      });
    } catch (e) {
      console.error('Telegram notify failed:', e);
    }
  }

  return NextResponse.json({ success: true, partnerId });
}
