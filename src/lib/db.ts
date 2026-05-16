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
    partner_commission_percent NUMERIC(5,2) DEFAULT 0,
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

  // Phase 19: Sub-partner overrides — менторская комиссия за приглашённого партнёра
  await db`CREATE TABLE IF NOT EXISTS partner_overrides (
    id SERIAL PRIMARY KEY,
    referrer_partner_id TEXT NOT NULL,
    sub_partner_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    sub_commission_amount NUMERIC NOT NULL,
    override_pct INT NOT NULL,
    override_amount NUMERIC NOT NULL,
    sub_level INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    paid_at DATE,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await db`CREATE INDEX IF NOT EXISTS idx_partner_overrides_referrer ON partner_overrides(referrer_partner_id, created_at DESC)`;
  await db`CREATE INDEX IF NOT EXISTS idx_partner_overrides_sub ON partner_overrides(sub_partner_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_partner_overrides_project ON partner_overrides(project_id)`;

  // Phase 16: Milestone reward claims ($5K→$500, $10K→$1000, $20K→$2000)
  await db`CREATE TABLE IF NOT EXISTS partner_milestone_claims (
    id SERIAL PRIMARY KEY,
    partner_id TEXT NOT NULL,
    milestone_key TEXT NOT NULL,
    threshold NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested',
    requested_at TIMESTAMP DEFAULT NOW(),
    paid_at DATE,
    comment TEXT,
    UNIQUE(partner_id, milestone_key)
  )`;

  // Phase 16: payout request workflow — add status + requested_at to partner_payouts
  const payoutCols = [
    { name: "status", def: "TEXT DEFAULT 'paid'" },
    { name: "requested_at", def: "TIMESTAMP" },
    { name: "rejection_comment", def: "TEXT" },
  ];
  for (const col of payoutCols) {
    const exists = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_payouts' AND column_name = ${col.name}`;
    if (exists.length === 0) {
      await getPool().query(`ALTER TABLE partner_payouts ADD COLUMN ${col.name} ${col.def}`);
    }
  }

  // Same for milestone claims
  const msCols = [
    { name: "rejection_comment", def: "TEXT" },
  ];
  for (const col of msCols) {
    const exists = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'partner_milestone_claims' AND column_name = ${col.name}`;
    if (exists.length === 0) {
      await getPool().query(`ALTER TABLE partner_milestone_claims ADD COLUMN ${col.name} ${col.def}`);
    }
  }

  // Lazy ALTERs for new columns
  const projectCols = [
    { name: "tier", def: "TEXT DEFAULT 'S'" },
    { name: "contract_signed_at", def: "DATE" },
    { name: "contract_type", def: "TEXT DEFAULT 'fix'" },
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

  // One-time migration: старые tier-значения T1/T2 → новая шкала S/M/L/XL
  // T1 (MVP $500–2K) → S, T2 (полная упаковка $30K+) → L
  await db`UPDATE projects SET tier = 'S' WHERE tier = 'T1'`;
  await db`UPDATE projects SET tier = 'L' WHERE tier = 'T2'`;

  const partnerCols = [
    { name: "level", def: "INT DEFAULT 1" },
    { name: "is_founding", def: "BOOLEAN DEFAULT FALSE" },
    { name: "last_activity_at", def: "DATE" },
    { name: "exclusivity_until", def: "DATE" },
    { name: "referrer_partner_id", def: "TEXT" }, // кто пригласил этого партнёра (1 уровень)
  ];
  for (const col of partnerCols) {
    const exists = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'partners' AND column_name = ${col.name}`;
    if (exists.length === 0) {
      await getPool().query(`ALTER TABLE partners ADD COLUMN ${col.name} ${col.def}`);
    }
  }

  // Phase 17: invites + clients + project comments
  await db`CREATE TABLE IF NOT EXISTS invites (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    project_id TEXT,
    email TEXT,
    name TEXT,
    used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  await db`CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    client_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  // Lazy ALTER: добавляем telegram_id и telegram_username для клиентов
  const clientTgIdCol = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'telegram_id'`;
  if (clientTgIdCol.length === 0) {
    await getPool().query(`ALTER TABLE clients ADD COLUMN telegram_id TEXT`);
    await getPool().query(`ALTER TABLE clients ADD COLUMN telegram_username TEXT`);
    await getPool().query(`CREATE INDEX IF NOT EXISTS idx_clients_telegram_id ON clients(telegram_id)`);
  }

  await db`CREATE TABLE IF NOT EXISTS project_comments (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    author_role TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  const projClientCol = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id'`;
  if (projClientCol.length === 0) {
    await getPool().query(`ALTER TABLE projects ADD COLUMN client_id TEXT`);
  }

  // Telegram pairing codes — для привязки telegram_id к partner_id ИЛИ client_id
  await db`CREATE TABLE IF NOT EXISTS telegram_pairing_codes (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    partner_id TEXT,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  // Lazy ALTER: разрешаем NULL в partner_id и добавляем client_id
  const tpcClientCol = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'telegram_pairing_codes' AND column_name = 'client_id'`;
  if (tpcClientCol.length === 0) {
    await getPool().query(`ALTER TABLE telegram_pairing_codes ALTER COLUMN partner_id DROP NOT NULL`);
    await getPool().query(`ALTER TABLE telegram_pairing_codes ADD COLUMN client_id TEXT`);
  }
  await db`CREATE INDEX IF NOT EXISTS idx_pairing_code ON telegram_pairing_codes(code)`;
  await db`CREATE INDEX IF NOT EXISTS idx_pairing_partner ON telegram_pairing_codes(partner_id, expires_at DESC)`;
  await db`CREATE INDEX IF NOT EXISTS idx_pairing_client ON telegram_pairing_codes(client_id, expires_at DESC)`;

  // Notifications — единая шина уведомлений для партнёров/клиентов/админа
  await db`CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_role TEXT NOT NULL,
    user_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    payload JSONB,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await db`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_role, user_id, read_at, created_at DESC)`;

  // Project reviews — рейтинг + отзыв клиента после завершения проекта
  await db`CREATE TABLE IF NOT EXISTS project_reviews (
    id SERIAL PRIMARY KEY,
    project_id TEXT UNIQUE NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await db`CREATE INDEX IF NOT EXISTS idx_project_reviews_project ON project_reviews(project_id)`;

  // Lazy ALTER на invites — partner_id для отслеживания кто пригласил
  const inviteCol = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'invites' AND column_name = 'partner_id'`;
  if (inviteCol.length === 0) {
    await getPool().query(`ALTER TABLE invites ADD COLUMN partner_id TEXT`);
  }

  // Lazy ALTER на clients — статус и phone (для leads + duplicate-check)
  const clientCols = [
    { name: "status", def: "TEXT DEFAULT 'lead'" }, // lead → active → churned
    { name: "phone", def: "TEXT" },
    { name: "partner_id", def: "TEXT" },
  ];
  for (const col of clientCols) {
    const exists = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = ${col.name}`;
    if (exists.length === 0) {
      await getPool().query(`ALTER TABLE clients ADD COLUMN ${col.name} ${col.def}`);
    }
  }
  await db`CREATE INDEX IF NOT EXISTS idx_clients_partner ON clients(partner_id, status)`;

  // asystem_requests.assigned_partner_id + lead_status + partner_note (lazy)
  const reqExists = await db`SELECT 1 FROM information_schema.tables WHERE table_name = 'asystem_requests'`;
  if (reqExists.length > 0) {
    const reqCol = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'asystem_requests' AND column_name = 'assigned_partner_id'`;
    if (reqCol.length === 0) {
      await getPool().query(`ALTER TABLE asystem_requests ADD COLUMN assigned_partner_id TEXT`);
    }
    const leadStatusCol = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'asystem_requests' AND column_name = 'lead_status'`;
    if (leadStatusCol.length === 0) {
      // new | contacted | qualified | won | lost
      await getPool().query(`ALTER TABLE asystem_requests ADD COLUMN lead_status TEXT DEFAULT 'new'`);
    }
    const partnerNoteCol = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'asystem_requests' AND column_name = 'partner_note'`;
    if (partnerNoteCol.length === 0) {
      await getPool().query(`ALTER TABLE asystem_requests ADD COLUMN partner_note TEXT`);
    }
  }

  // Knowledge base — документы для партнёров (грузит админ)
  await db`CREATE TABLE IF NOT EXISTS knowledge_docs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_size BIGINT DEFAULT 0,
    mime_type TEXT,
    category TEXT DEFAULT 'general',
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await db`CREATE INDEX IF NOT EXISTS idx_knowledge_pinned ON knowledge_docs(pinned DESC, created_at DESC)`;

  await db`CREATE INDEX IF NOT EXISTS idx_project_stages_project ON project_stages(project_id, order_index)`;
  await db`CREATE INDEX IF NOT EXISTS idx_projects_partner ON projects(partner_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_project_developers_project ON project_developers(project_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_project_developers_developer ON project_developers(developer_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_partner_payouts_project ON partner_payouts(project_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner ON partner_payouts(partner_id, paid_at DESC)`;
  await db`CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token)`;
  await db`CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email)`;
  await db`CREATE INDEX IF NOT EXISTS idx_project_comments_project ON project_comments(project_id, created_at DESC)`;
  await db`CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id)`;

  // Lazy migration: ensure partner_commission_percent column exists on legacy DBs
  await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'partner_commission_percent'`.then(async (rows) => {
    if (rows.length === 0) {
      await getPool().query(`ALTER TABLE projects ADD COLUMN partner_commission_percent NUMERIC(5,2) DEFAULT 0`);
    }
  });

  // Lazy migration: переводим INT → NUMERIC(5,2) для tier-decay дробных процентов
  const colType = await db`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'partner_commission_percent' LIMIT 1
  `;
  if (colType.length > 0 && colType[0].data_type === "integer") {
    await getPool().query(`ALTER TABLE projects ALTER COLUMN partner_commission_percent TYPE NUMERIC(5,2)`);
  }

  // Lazy migration: price_confirmed_at — момент когда админ зафиксировал стоимость
  const confirmCol = await db`SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'price_confirmed_at'`;
  if (confirmCol.length === 0) {
    await getPool().query(`ALTER TABLE projects ADD COLUMN price_confirmed_at TIMESTAMP`);
  }

  // Журнал оплат: каждый транш отдельная запись с датой и заметкой
  await db`CREATE TABLE IF NOT EXISTS project_payments (
    id SERIAL PRIMARY KEY,
    project_id TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    note TEXT,
    paid_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
  )`;
  await db`CREATE INDEX IF NOT EXISTS idx_project_payments_project ON project_payments(project_id, paid_at DESC)`;
}
