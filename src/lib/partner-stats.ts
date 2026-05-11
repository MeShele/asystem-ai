import { getDb } from "./db";
import { computeLevel, computeCommissionPct, type PartnerStats } from "./partner-levels";

type Row = Record<string, unknown>;

export async function getPartnerStats(partnerId: string): Promise<PartnerStats> {
  const db = getDb();

  // All "deals" = projects with contract_signed_at IS NOT NULL
  const allDeals = (await db`
    SELECT contract_signed_at, paid_amount, tier, total_price
    FROM projects
    WHERE partner_id = ${partnerId} AND contract_signed_at IS NOT NULL
  `) as Row[];

  const now = Date.now();
  const ms60d = 60 * 24 * 3600 * 1000;
  const ms90d = 90 * 24 * 3600 * 1000;
  const ms6mo = 180 * 24 * 3600 * 1000;

  let dealsLast60Days = 0;
  let dealsLast90Days = 0;
  let dealsLast6Months = 0;
  let hasT2Project = false;
  let totalRevenue = 0;
  for (const d of allDeals) {
    const signedAt = d.contract_signed_at ? new Date(d.contract_signed_at as string).getTime() : 0;
    if (now - signedAt <= ms60d) dealsLast60Days++;
    if (now - signedAt <= ms90d) dealsLast90Days++;
    if (now - signedAt <= ms6mo) dealsLast6Months++;
    // Класс L/XL ($30K+) засчитывается в acceptance L3 как «T2-проект».
    // Старое значение 'T2' оставлено для обратной совместимости.
    if (d.tier === "L" || d.tier === "XL" || d.tier === "T2") hasT2Project = true;
    totalRevenue += Number(d.paid_amount || 0);
  }

  // Только фактически выплаченные (status='paid') —
  // запрошенные/отклонённые в "Заработано" не учитываются.
  const earnedRow = (await db`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM partner_payouts
    WHERE partner_id = ${partnerId} AND status = 'paid'
  `) as Row[];
  const totalEarned = Number(earnedRow[0]?.total || 0);

  return {
    totalDeals: allDeals.length,
    dealsLast60Days,
    dealsLast90Days,
    dealsLast6Months,
    totalRevenue,
    hasT2Project,
    totalEarned,
  };
}

/**
 * Проверяет retention-условие на момент вызова (3 сделки за 60 дней).
 * Возвращает true если партнёр квалифицирован для +5% retention-бонуса
 * и авто-продления эксклюзива.
 */
export async function checkRetentionQualified(partnerId: string): Promise<boolean> {
  const stats = await getPartnerStats(partnerId);
  return stats.dealsLast60Days >= 3;
}

/**
 * Авто-продление эксклюзива на 12 месяцев при выполнении retention-условия.
 * Вызывается при создании нового проекта (новая сделка может закрыть условие).
 * Если условие выполнено — продлевает exclusivity_until на 12 мес от текущей даты
 * (если уже стоит дата позже — не трогает).
 * Возвращает true если продлили в этом вызове.
 */
export async function autoRenewExclusivity(partnerId: string): Promise<boolean> {
  const db = getDb();
  const stats = await getPartnerStats(partnerId);
  if (stats.dealsLast60Days < 3) return false;

  const rows = (await db`SELECT exclusivity_until FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Row[];
  if (rows.length === 0) return false;

  const newUntil = new Date();
  newUntil.setFullYear(newUntil.getFullYear() + 1);
  const current = rows[0].exclusivity_until ? new Date(rows[0].exclusivity_until as string) : null;
  // Если текущая дата эксклюзива позже — не сокращаем
  if (current && current.getTime() >= newUntil.getTime()) return false;

  const iso = newUntil.toISOString().slice(0, 10);
  await db`UPDATE partners SET exclusivity_until = ${iso} WHERE partner_id = ${partnerId}`;
  await db`INSERT INTO partner_level_history (partner_id, level, reason)
    SELECT ${partnerId}, level, ${`retention auto-renewed: ${stats.dealsLast60Days} сделок за 60 дн → exclusivity до ${iso}`}
    FROM partners WHERE partner_id = ${partnerId}`;
  return true;
}

/**
 * Recompute and store partner level. Called whenever a project changes.
 * Writes to partner_level_history if level changed.
 */
export async function recomputePartnerLevel(partnerId: string): Promise<number> {
  const db = getDb();
  const stats = await getPartnerStats(partnerId);
  const newLevel = computeLevel(stats);

  const partners = (await db`SELECT level FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Row[];
  if (partners.length === 0) return newLevel;
  const oldLevel = Number(partners[0].level || 1);

  if (newLevel !== oldLevel) {
    await db`UPDATE partners SET level = ${newLevel} WHERE partner_id = ${partnerId}`;
    const reason = `auto: deals=${stats.totalDeals}, last90=${stats.dealsLast90Days}, last6mo=${stats.dealsLast6Months}, revenue=${stats.totalRevenue}, hasT2=${stats.hasT2Project}`;
    await db`INSERT INTO partner_level_history (partner_id, level, reason) VALUES (${partnerId}, ${newLevel}, ${reason})`;
    // Старые проекты остаются на своих %. Новые получат новый.
  }

  return newLevel;
}

/**
 * Update partner.last_activity_at to today. Call when a new project is created or signed.
 */
export async function bumpPartnerActivity(partnerId: string) {
  const db = getDb();
  await db`UPDATE partners SET last_activity_at = CURRENT_DATE WHERE partner_id = ${partnerId}`;
}

/**
 * Recompute commission for a SINGLE project (used when admin manually toggles multiplier flags on it).
 * Old projects of the partner stay frozen at their saved percent — only new projects use new level.
 */
export async function recomputeSingleProjectCommission(projectId: string) {
  const db = getDb();
  const rows = (await db`
    SELECT p.partner_id, p.total_price, p.delivered_in_30_days, p.has_retention_bonus, p.has_churn_penalty,
           pt.level, pt.is_founding
    FROM projects p
    LEFT JOIN partners pt ON pt.partner_id = p.partner_id
    WHERE p.project_id = ${projectId} LIMIT 1
  `) as Row[];
  if (rows.length === 0 || !rows[0].partner_id) return;

  const calc = computeCommissionPct({
    level: Number(rows[0].level || 1),
    isFounding: Boolean(rows[0].is_founding),
    deliveredIn30Days: Boolean(rows[0].delivered_in_30_days),
    hasRetentionBonus: Boolean(rows[0].has_retention_bonus),
    hasChurnPenalty: Boolean(rows[0].has_churn_penalty),
    projectAmount: Number(rows[0].total_price || 0),
  });
  await db`UPDATE projects SET partner_commission_percent = ${calc.total}, updated_at = NOW() WHERE project_id = ${projectId}`;
}

/**
 * Returns days since partner's last activity (last project signed).
 * null if never active.
 */
export async function getDaysSinceLastActivity(partnerId: string): Promise<number | null> {
  const db = getDb();
  const rows = (await db`SELECT last_activity_at FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Row[];
  if (rows.length === 0) return null;
  const last = rows[0].last_activity_at as string | null;
  if (!last) return null;
  return Math.floor((Date.now() - new Date(last as string).getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Inactivity penalty:
 * Если 60+ дней без новой сделки → партнёр падает на 1 уровень вниз (но не ниже L1).
 * Эквивалентно −5% к будущим проектам (каждый уровень = 5% шаг).
 * Старые проекты остаются на своих %. Только новые получат новый (пониженный) уровень.
 *
 * Применяется автоматически при загрузке /api/partner/me и при создании нового проекта.
 * Один раз за период неактивности (если уже понижен — не понижает повторно).
 *
 * Returns true if downgraded this call.
 */
export async function enforceInactivityDowngrade(partnerId: string): Promise<boolean> {
  const db = getDb();
  const rows = (await db`SELECT level, last_activity_at FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Row[];
  if (rows.length === 0) return false;
  const level = Number(rows[0].level || 1);
  if (level <= 1) return false; // ниже L1 не падают

  const last = rows[0].last_activity_at as string | null;
  if (!last) return false; // никогда не был активен — нечего понижать
  const days = Math.floor((Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 60) return false;

  // Чтобы не понижать многократно за один период неактивности —
  // проверяем последнюю auto-downgrade запись в history
  const lastDown = (await db`
    SELECT created_at FROM partner_level_history
    WHERE partner_id = ${partnerId} AND reason LIKE 'inactivity downgrade%'
    ORDER BY id DESC LIMIT 1
  `) as Row[];
  if (lastDown.length > 0) {
    const sinceLastDown = Math.floor((Date.now() - new Date(lastDown[0].created_at as string).getTime()) / (1000 * 60 * 60 * 24));
    // не понижаем чаще раз в 60 дней
    if (sinceLastDown < 60) return false;
  }

  const newLevel = Math.max(1, level - 1);
  await db`UPDATE partners SET level = ${newLevel} WHERE partner_id = ${partnerId}`;
  await db`INSERT INTO partner_level_history (partner_id, level, reason) VALUES (${partnerId}, ${newLevel}, ${`inactivity downgrade: ${days} дней без сделки, L${level} → L${newLevel} (−5%)`})`;
  return true;
}

// Backward-compat alias (used in older imports)
export const enforceExclusivityRule = enforceInactivityDowngrade;
