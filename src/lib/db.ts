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

  // KP workflow columns on partner_clients
  const kpColumns = [
    { name: "description", def: "TEXT" },
    { name: "calculator_config", def: "JSONB" },
    { name: "kp_status", def: "TEXT DEFAULT 'none'" },
    { name: "kp_content", def: "TEXT" },
    { name: "kp_admin_feedback", def: "TEXT" },
    { name: "kp_submitted_at", def: "TIMESTAMP" },
    { name: "kp_reviewed_at", def: "TIMESTAMP" },
  ];
  for (const col of kpColumns) {
    await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_clients' AND column_name = ${col.name}`.then(async (rows) => {
      if (rows.length === 0) {
        await getPool().query(`ALTER TABLE partner_clients ADD COLUMN ${col.name} ${col.def}`);
      }
    });
  }

  // App settings (AI keys, etc)
  await db`CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  // KP AI chat messages table
  await db`CREATE TABLE IF NOT EXISTS kp_messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
}
