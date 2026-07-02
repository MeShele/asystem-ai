import { getDb } from "./db";
import { getOverridePct } from "./partner-levels";

type Row = Record<string, unknown>;

/**
 * Создаёт override-запись если у sub-партнёра есть referrer и тот активен.
 * Условия: проект — реальная сделка (contract_signed_at IS NOT NULL);
 * у referrer'а хотя бы 1 подписанная сделка за 90 дней (активность).
 *
 * Override считается от commission sub-партнёра по этому проекту, не от total_price.
 * @param subPartnerId — кто закрыл сделку
 * @param projectId — id проекта
 * @param subCommissionAmount — заработок sub-партнёра по проекту в долларах (round)
 * @param subLevel — уровень sub-партнёра на момент сделки
 */
export async function createOverrideIfApplicable({
  subPartnerId,
  projectId,
  subCommissionAmount,
  subLevel,
}: {
  subPartnerId: string;
  projectId: string;
  subCommissionAmount: number;
  subLevel: number;
}): Promise<{ created: boolean; override?: { referrer_partner_id: string; override_amount: number; override_pct: number } }> {
  if (subCommissionAmount <= 0) return { created: false };

  const db = getDb();
  const subRows = (await db`SELECT referrer_partner_id FROM partners WHERE partner_id = ${subPartnerId} LIMIT 1`) as Row[];
  if (subRows.length === 0) return { created: false };
  const referrerId = subRows[0].referrer_partner_id ? String(subRows[0].referrer_partner_id) : null;
  if (!referrerId) return { created: false };

  // Override — только за реальную сделку: проект с подписанным контрактом.
  // Иначе override мог начислиться преждевременно (при простой привязке партнёра).
  const projectRows = (await db`SELECT contract_signed_at FROM projects WHERE project_id = ${projectId} LIMIT 1`) as Row[];
  if (projectRows.length === 0 || !projectRows[0].contract_signed_at) return { created: false };

  // Проверяем активность referrer'а — нужна сделка за последние 90 дней
  const activityRow = (await db`
    SELECT 1 FROM projects
    WHERE partner_id = ${referrerId}
      AND contract_signed_at IS NOT NULL
      AND contract_signed_at >= (CURRENT_DATE - INTERVAL '90 days')
    LIMIT 1
  `) as Row[];
  if (activityRow.length === 0) return { created: false };

  const overridePct = getOverridePct(subLevel);
  const overrideAmount = Math.round((subCommissionAmount * overridePct) / 100);
  if (overrideAmount <= 0) return { created: false };

  // Не дублируем override на тот же проект
  const existing = (await db`
    SELECT id FROM partner_overrides
    WHERE referrer_partner_id = ${referrerId} AND project_id = ${projectId}
    LIMIT 1
  `) as Row[];
  if (existing.length > 0) return { created: false };

  await db`
    INSERT INTO partner_overrides (referrer_partner_id, sub_partner_id, project_id, sub_commission_amount, override_pct, override_amount, sub_level, status)
    VALUES (${referrerId}, ${subPartnerId}, ${projectId}, ${subCommissionAmount}, ${overridePct}, ${overrideAmount}, ${subLevel}, 'pending')
  `;

  return {
    created: true,
    override: { referrer_partner_id: referrerId, override_amount: overrideAmount, override_pct: overridePct },
  };
}
