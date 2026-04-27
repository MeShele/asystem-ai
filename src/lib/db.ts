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
    { name: "pricing_mode", def: "TEXT DEFAULT 'manual'" },
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

  // Partner achievements
  await db`CREATE TABLE IF NOT EXISTS partner_achievements (
    id SERIAL PRIMARY KEY,
    partner_id TEXT NOT NULL,
    milestone_key TEXT NOT NULL,
    milestone_amount NUMERIC NOT NULL,
    bonus_amount NUMERIC NOT NULL,
    achieved_at TIMESTAMP DEFAULT NOW(),
    paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP,
    UNIQUE(partner_id, milestone_key)
  )`;
}

export async function initProjectTables() {
  const db = getDb();

  await db`CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    total_price NUMERIC DEFAULT 0,
    paid_amount NUMERIC DEFAULT 0,
    partner_id TEXT,
    progress_percent INT DEFAULT 0,
    status TEXT DEFAULT 'planning',
    developers JSONB DEFAULT '[]'::jsonb,
    partner_commission_percent INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS project_stages (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    order_index INT DEFAULT 0,
    title TEXT NOT NULL,
    percent INT DEFAULT 0,
    comment TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS developers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    avatar_url TEXT,
    email TEXT,
    telegram TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS project_developers (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    developer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, developer_id)
  )`;

  await db`CREATE TABLE IF NOT EXISTS partner_payouts (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    partner_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    paid_at DATE NOT NULL DEFAULT CURRENT_DATE,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Phase 15: Partner levels + multipliers
  await db`CREATE TABLE IF NOT EXISTS partner_level_history (
    id SERIAL PRIMARY KEY,
    partner_id TEXT NOT NULL,
    level INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Lazy ALTERs for new columns
  const projectCols = [
    { name: "tier", def: "TEXT DEFAULT 'T1'" },
    { name: "contract_signed_at", def: "DATE" },
    { name: "delivered_in_30_days", def: "BOOLEAN DEFAULT FALSE" },
    { name: "has_retention_bonus", def: "BOOLEAN DEFAULT FALSE" },
    { name: "has_churn_penalty", def: "BOOLEAN DEFAULT FALSE" },
  ];
  for (const col of projectCols) {
    const exists = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = ${col.name}`;
    if (exists.length === 0) {
      await getPool().query(`ALTER TABLE projects ADD COLUMN ${col.name} ${col.def}`);
    }
  }

  const partnerCols = [
    { name: "level", def: "INT DEFAULT 1" },
    { name: "is_founding", def: "BOOLEAN DEFAULT FALSE" },
    { name: "last_activity_at", def: "DATE" },
  ];
  for (const col of partnerCols) {
    const exists = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = ${col.name}`;
    if (exists.length === 0) {
      await getPool().query(`ALTER TABLE partners ADD COLUMN ${col.name} ${col.def}`);
    }
  }

  await db`CREATE INDEX IF NOT EXISTS idx_project_stages_project ON project_stages(project_id, order_index)`;
  await db`CREATE INDEX IF NOT EXISTS idx_projects_partner ON projects(partner_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_project_developers_project ON project_developers(project_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_project_developers_developer ON project_developers(developer_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_partner_payouts_project ON partner_payouts(project_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON partner_payouts(partner_id, paid_at DESC)`;

  // Lazy migration: ensure partner_commission_percent column exists on legacy DBs
  await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'partner_commission_percent'`.then(async (rows) => {
    if (rows.length === 0) {
      await getPool().query(`ALTER TABLE projects ADD COLUMN partner_commission_percent INT DEFAULT 0`);
    }
  });
}
