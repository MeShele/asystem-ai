import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

let initialized = false;

async function getSql() {
  if (!process.env.DATABASE_URL) return null;
  const db = getDb();
  if (!initialized) {
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
    initialized = true;
  }
  return db;
}

// GET — список партнёров для админа
export async function GET() {
  const sql = await getSql();
  if (!sql) return NextResponse.json([]);
  const rows = await sql`SELECT * FROM asystem_partners ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

// POST — новая заявка партнёра
export async function POST(req: NextRequest) {
  const data = await req.json();
  const partnerId = 'P-' + String(Date.now()).slice(-4);

  // Save to DB if available
  const sql = await getSql();
  if (sql) {
    try {
      await sql`INSERT INTO asystem_partners (partner_id, name, phone, company, website, specialization, message)
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
  }

  // Telegram notification — always attempt
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
