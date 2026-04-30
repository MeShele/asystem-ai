import { NextRequest, NextResponse } from 'next/server';
import { getDb, initPartnerTables } from '@/lib/db';
import { notifyAdmin } from '@/lib/telegram';

// GET — список партнёров для админа (из основной таблицы partners)
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("admin_session");
  if (!cookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const db = getDb();
    await initPartnerTables();

    const rows = await db`
      SELECT
        p.partner_id, p.name, p.email, p.phone, p.company,
        p.ref_code, p.commission_rate, p.status, p.telegram_username, p.telegram_id,
        p.created_at, p.level, p.is_founding, p.last_activity_at,
        p.referrer_partner_id,
        ref.name AS referrer_name,
        (SELECT COUNT(*) FROM projects pr WHERE pr.partner_id = p.partner_id) AS total_clients,
        (SELECT COALESCE(SUM(amount), 0) FROM partner_payouts pp WHERE pp.partner_id = p.partner_id AND pp.status = 'paid') AS total_earned,
        (SELECT COUNT(*) FROM partner_payouts pp WHERE pp.partner_id = p.partner_id AND pp.status = 'requested')
          + (SELECT COUNT(*) FROM partner_milestone_claims mc WHERE mc.partner_id = p.partner_id AND mc.status = 'requested') AS pending_count,
        (SELECT COUNT(*) FROM partners sub WHERE sub.referrer_partner_id = p.partner_id) AS subs_count,
        (SELECT COALESCE(SUM(override_amount), 0) FROM partner_overrides ov WHERE ov.referrer_partner_id = p.partner_id) AS override_total,
        (SELECT COALESCE(SUM(override_amount), 0) FROM partner_overrides ov WHERE ov.referrer_partner_id = p.partner_id AND ov.status = 'pending') AS override_pending
      FROM partners p
      LEFT JOIN partners ref ON ref.partner_id = p.referrer_partner_id
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
  await notifyAdmin(`🤝 Новый партнёр *${partnerId}*\nИмя: ${data.name || '—'}\nКомпания: ${data.company || '—'}\nТелефон: ${data.phone || '—'}\nСпециализация: ${data.specialization || '—'}`).catch(() => {});

  return NextResponse.json({ success: true, partnerId });
}
