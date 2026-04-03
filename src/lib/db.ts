import { neon } from "@neondatabase/serverless";

let sql: ReturnType<typeof neon> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export async function initPartnerTables() {
  const db = getDb();

  await db`CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    partner_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    password_hash TEXT,
    telegram_id TEXT,
    telegram_username TEXT,
    ref_code TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC DEFAULT 0.15,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS partner_clients (
    id SERIAL PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES partners(partner_id),
    request_id TEXT,
    client_name TEXT,
    client_phone TEXT,
    client_company TEXT,
    project_type TEXT,
    budget TEXT,
    base_price NUMERIC DEFAULT 0,
    partner_price NUMERIC DEFAULT 0,
    commission NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS partner_messages (
    id SERIAL PRIMARY KEY,
    partner_id TEXT NOT NULL,
    client_request_id TEXT,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}
