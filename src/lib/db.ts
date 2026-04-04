import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
    });
  }
  return pool;
}

type SqlResult = Record<string, unknown>[];

export function getDb() {
  const p = getPool();

  const sql = async (
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<SqlResult> => {
    let query = "";
    strings.forEach((str, i) => {
      query += str;
      if (i < values.length) {
        query += `$${i + 1}`;
      }
    });
    const result = await p.query(query, values);
    return result.rows;
  };

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
