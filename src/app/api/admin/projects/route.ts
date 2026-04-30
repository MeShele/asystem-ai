import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { recomputePartnerLevel, bumpPartnerActivity, enforceExclusivityRule, checkRetentionQualified, autoRenewExclusivity } from "@/lib/partner-stats";
import { computeCommissionPct } from "@/lib/partner-levels";
import { notify } from "@/lib/notify";
import { createOverrideIfApplicable } from "@/lib/partner-overrides";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const rows = await db`
    SELECT p.*, pt.name AS partner_name, pt.company AS partner_company
    FROM projects p
    LEFT JOIN partners pt ON pt.partner_id = p.partner_id
    ORDER BY p.created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const projectId = "PR-" + String(Date.now()).slice(-6);
  const name = String(data.name || "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const description = data.description ?? null;
  const logoUrl = data.logo_url ?? null;
  const totalPrice = Number(data.total_price || 0);
  const paidAmount = Number(data.paid_amount || 0);
  const partnerId = data.partner_id || null;
  const status = data.status || "planning";
  const tier = ["S", "M", "L", "XL"].includes(data.tier) ? data.tier : "S";
  const contractType = ["fix", "hourly", "retainer", "equity"].includes(data.contract_type) ? data.contract_type : "fix";
  const contractSignedAt = data.contract_signed_at || null;

  // Enforce L3+ exclusivity rule (3 deals/60 days) BEFORE creating new project — может понизить уровень
  if (partnerId) {
    await enforceExclusivityRule(partnerId);
  }

  // Retention: 3 сделки за 60 дней → авто-флаг +5% и продление эксклюзива
  const autoRetention = partnerId ? await checkRetentionQualified(partnerId) : false;
  const hasRetentionBonus = autoRetention || Boolean(data.has_retention_bonus);

  // Commission ALWAYS computed from partner's current level + multipliers
  // Retention — auto от условия (3 сделки/60 дн), быстрая сдача — manual флаг.
  let partnerCommissionPercent = 0;
  if (partnerId) {
    const partners = (await db`SELECT level, is_founding FROM partners WHERE partner_id = ${partnerId} LIMIT 1`) as Record<string, unknown>[];
    if (partners.length > 0) {
      const calc = computeCommissionPct({
        level: Number(partners[0].level || 1),
        isFounding: Boolean(partners[0].is_founding),
        deliveredIn30Days: Boolean(data.delivered_in_30_days),
        hasRetentionBonus,
        hasChurnPenalty: Boolean(data.has_churn_penalty),
      });
      partnerCommissionPercent = calc.total;
    }
  }

  const clientIdField = data.client_id || null;

  const inserted = await db`
    INSERT INTO projects (project_id, name, description, logo_url, total_price, paid_amount, partner_id, status, partner_commission_percent, tier, contract_signed_at, contract_type, client_id, has_churn_penalty, delivered_in_30_days, has_retention_bonus)
    VALUES (${projectId}, ${name}, ${description}, ${logoUrl}, ${totalPrice}, ${paidAmount}, ${partnerId}, ${status}, ${partnerCommissionPercent}, ${tier}, ${contractSignedAt}, ${contractType}, ${clientIdField}, ${Boolean(data.has_churn_penalty)}, ${Boolean(data.delivered_in_30_days)}, ${hasRetentionBonus})
    RETURNING *
  `;


  if (partnerId) {
    await bumpPartnerActivity(partnerId);
    const oldLevelRow = await db`SELECT level FROM partners WHERE partner_id = ${partnerId} LIMIT 1` as Record<string, unknown>[];
    const oldLevel = Number(oldLevelRow[0]?.level || 1);
    const newLevel = await recomputePartnerLevel(partnerId);
    await autoRenewExclusivity(partnerId);

    // Уведомление партнёру: новый проект + комиссия
    await notify({
      userRole: "partner",
      userId: partnerId,
      kind: "project_created",
      title: `Новый проект: ${name}`,
      body: `Ваша комиссия: ${partnerCommissionPercent}% ($${Math.round((totalPrice * partnerCommissionPercent) / 100).toLocaleString("ru-RU")})`,
      link: `/partner/projects/${projectId}`,
      payload: { projectId },
    });

    // Если уровень вырос/упал в результате создания
    if (newLevel > oldLevel) {
      await notify({
        userRole: "partner",
        userId: partnerId,
        kind: "level_up",
        title: `🎉 Повышение до L${newLevel}!`,
        body: `Новая базовая ставка применяется ко всем будущим проектам.`,
        link: `/partner/achievements`,
        payload: { from: oldLevel, to: newLevel },
      });
    }

    // Sub-partner override: если у партнёра есть referrer и тот активен — начисляем
    const subCommission = Math.round((totalPrice * partnerCommissionPercent) / 100);
    const overrideResult = await createOverrideIfApplicable({
      subPartnerId: partnerId,
      projectId,
      subCommissionAmount: subCommission,
      subLevel: newLevel,
    });
    if (overrideResult.created && overrideResult.override) {
      await notify({
        userRole: "partner",
        userId: overrideResult.override.referrer_partner_id,
        kind: "milestone_paid",
        title: `+$${overrideResult.override.override_amount.toLocaleString("ru-RU")} override с твоей сети`,
        body: `Sub-partner закрыл сделку — твоя менторская комиссия ${overrideResult.override.override_pct}% начислена.`,
        link: `/partner/network`,
        payload: { projectId, subPartnerId: partnerId },
      });
    }
  }

  return NextResponse.json(inserted[0]);
}
