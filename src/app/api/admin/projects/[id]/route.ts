import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { recomputePartnerLevel, bumpPartnerActivity, recomputeSingleProjectCommission } from "@/lib/partner-stats";
import { createOverrideIfApplicable } from "@/lib/partner-overrides";
import { notify } from "@/lib/notify";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const projects = (await db`
    SELECT p.*, pt.name AS partner_name, pt.company AS partner_company, pt.telegram_id AS partner_telegram_id,
           c.name AS client_name, c.email AS client_email, c.phone AS client_phone
    FROM projects p
    LEFT JOIN partners pt ON pt.partner_id = p.partner_id
    LEFT JOIN clients c ON c.client_id = p.client_id
    WHERE p.project_id = ${id} OR p.id::text = ${id}
    LIMIT 1
  `) as Record<string, unknown>[];

  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const project = projects[0];

  const stages = await db`
    SELECT * FROM project_stages
    WHERE project_id = ${project.project_id as string}
    ORDER BY order_index ASC, id ASC
  `;

  const developers = await db`
    SELECT d.*, pd.id AS link_id
    FROM developers d
    JOIN project_developers pd ON pd.developer_id = d.id
    WHERE pd.project_id = ${project.project_id as string}
    ORDER BY pd.created_at ASC
  `;

  // Commission breakdown for transparency
  let commissionBreakdown = null;
  if (project.partner_id) {
    const partners = (await db`SELECT level, is_founding FROM partners WHERE partner_id = ${project.partner_id as string} LIMIT 1`) as Record<string, unknown>[];
    if (partners.length > 0) {
      const { computeCommissionPct } = await import("@/lib/partner-levels");
      commissionBreakdown = computeCommissionPct({
        level: Number(partners[0].level || 1),
        isFounding: Boolean(partners[0].is_founding),
        deliveredIn30Days: Boolean(project.delivered_in_30_days),
        hasRetentionBonus: Boolean(project.has_retention_bonus),
        hasChurnPenalty: Boolean(project.has_churn_penalty),
        projectAmount: Number(project.total_price || 0),
      });
    }
  }

  return NextResponse.json({ project, stages, developers, commissionBreakdown });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  const db = getDb();
  await initProjectTables();

  // Снимок состояния ДО апдейта — нужен чтобы понимать "впервые привязали партнёра / подтвердили контракт"
  const beforeRows = (await db`
    SELECT partner_id, contract_signed_at, total_price, paid_amount, progress_percent,
           partner_commission_percent, status, client_id, name
    FROM projects WHERE project_id = ${id} OR id::text = ${id} LIMIT 1
  `) as Record<string, unknown>[];
  const before = beforeRows[0] || {};
  const hadPartner = Boolean(before.partner_id);
  const hadContract = Boolean(before.contract_signed_at);
  const oldStatus = before.status ? String(before.status) : null;
  const oldProgress = Number(before.progress_percent || 0);
  const oldPaid = Number(before.paid_amount || 0);
  const oldPartnerId = before.partner_id ? String(before.partner_id) : null;
  const oldClientId = before.client_id ? String(before.client_id) : null;
  const projName = String(before.name || "");

  if ("name" in data) {
    await db`UPDATE projects SET name = ${String(data.name)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("description" in data) {
    await db`UPDATE projects SET description = ${data.description ?? null}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("logo_url" in data) {
    await db`UPDATE projects SET logo_url = ${data.logo_url ?? null}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("total_price" in data) {
    await db`UPDATE projects SET total_price = ${Number(data.total_price)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("paid_amount" in data) {
    await db`UPDATE projects SET paid_amount = ${Number(data.paid_amount)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("partner_id" in data) {
    await db`UPDATE projects SET partner_id = ${data.partner_id ?? null}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("progress_percent" in data) {
    await db`UPDATE projects SET progress_percent = ${Number(data.progress_percent)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("status" in data) {
    await db`UPDATE projects SET status = ${String(data.status)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }

  // Если статус действительно изменился — уведомляем клиента и партнёра
  if ("status" in data && oldStatus !== String(data.status)) {
    const newStatus = String(data.status);
    const STATUS_RU: Record<string, string> = {
      planning: "Планирование", active: "В работе", review: "На проверке",
      completed: "Готов", paused: "Пауза", cancelled: "Отменён",
    };
    const statusRu = STATUS_RU[newStatus] || newStatus;
    if (oldClientId) {
      await notify({
        userRole: "client", userId: oldClientId,
        kind: "project_status_changed",
        title: `Статус проекта обновлён: ${statusRu}`,
        body: `«${projName}» → ${statusRu}`,
        link: `/client/projects/${id}`,
        payload: { projectId: id, status: newStatus },
      });
    }
    if (oldPartnerId) {
      await notify({
        userRole: "partner", userId: oldPartnerId,
        kind: "project_status_changed",
        title: `Статус проекта: ${statusRu}`,
        body: `«${projName}» → ${statusRu}`,
        link: `/partner/projects/${id}`,
        payload: { projectId: id, status: newStatus },
      });
    }
  }

  // progress_percent изменился — уведомляем клиента и партнёра (только если изменение значимое ≥5%)
  if ("progress_percent" in data) {
    const newProgress = Number(data.progress_percent);
    const delta = newProgress - oldProgress;
    if (Math.abs(delta) >= 5) {
      const arrow = delta > 0 ? "↑" : "↓";
      if (oldClientId) {
        await notify({
          userRole: "client", userId: oldClientId,
          kind: "stage_updated",
          title: `Прогресс ${arrow} ${newProgress}%`,
          body: `«${projName}» — было ${oldProgress}%, стало ${newProgress}%`,
          link: `/client/projects/${id}`,
          payload: { projectId: id, progress: newProgress },
        });
      }
      if (oldPartnerId) {
        await notify({
          userRole: "partner", userId: oldPartnerId,
          kind: "stage_updated",
          title: `Прогресс ${arrow} ${newProgress}%`,
          body: `«${projName}» — было ${oldProgress}%, стало ${newProgress}%`,
          link: `/partner/projects/${id}`,
          payload: { projectId: id, progress: newProgress },
        });
      }
    }
  }

  // paid_amount изменился — уведомляем партнёра (его комиссия растёт)
  if ("paid_amount" in data) {
    const newPaid = Number(data.paid_amount);
    if (newPaid > oldPaid && oldPartnerId) {
      const deltaPaid = newPaid - oldPaid;
      const pct = Number(before.partner_commission_percent || 0);
      const yourShare = Math.round((deltaPaid * pct) / 100);
      await notify({
        userRole: "partner", userId: oldPartnerId,
        kind: "payout_paid",
        title: `Оплата по проекту: +$${deltaPaid.toLocaleString("ru-RU")}`,
        body: `«${projName}» — клиент оплатил ещё $${deltaPaid.toLocaleString("ru-RU")}. Твоя доля по ${pct}% ≈ $${yourShare.toLocaleString("ru-RU")}`,
        link: `/partner/projects/${id}`,
        payload: { projectId: id, paidDelta: deltaPaid },
      });
    }
  }

  // Контракт впервые подписан — уведомляем партнёра (его комиссия теперь зафиксирована)
  if ("contract_signed_at" in data && !hadContract && data.contract_signed_at) {
    if (oldPartnerId) {
      const pct = Number(before.partner_commission_percent || 0);
      const total = Number(before.total_price || 0);
      const yourTotal = Math.round((total * pct) / 100);
      await notify({
        userRole: "partner", userId: oldPartnerId,
        kind: "milestone_paid",
        title: `Контракт подписан 🎉`,
        body: `«${projName}» — твоя комиссия ${pct}% зафиксирована. Полная сумма ≈ $${yourTotal.toLocaleString("ru-RU")} при чеке $${total.toLocaleString("ru-RU")}`,
        link: `/partner/projects/${id}`,
        payload: { projectId: id, pct, total },
      });
    }
  }
  if ("developers" in data) {
    await db`UPDATE projects SET developers = ${JSON.stringify(data.developers)}::jsonb, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  // partner_commission_percent больше не принимается ручным значением — всегда auto-recompute ниже
  if ("tier" in data) {
    const t = ["S", "M", "L", "XL"].includes(data.tier) ? data.tier : "S";
    await db`UPDATE projects SET tier = ${t}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("contract_signed_at" in data) {
    await db`UPDATE projects SET contract_signed_at = ${data.contract_signed_at || null}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("contract_type" in data) {
    const ct = ["fix", "hourly", "retainer", "equity"].includes(data.contract_type) ? data.contract_type : "fix";
    await db`UPDATE projects SET contract_type = ${ct}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("delivered_in_30_days" in data) {
    await db`UPDATE projects SET delivered_in_30_days = ${Boolean(data.delivered_in_30_days)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("has_retention_bonus" in data) {
    await db`UPDATE projects SET has_retention_bonus = ${Boolean(data.has_retention_bonus)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("has_churn_penalty" in data) {
    await db`UPDATE projects SET has_churn_penalty = ${Boolean(data.has_churn_penalty)}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }
  if ("client_id" in data) {
    await db`UPDATE projects SET client_id = ${data.client_id ?? null}, updated_at = NOW() WHERE project_id = ${id} OR id::text = ${id}`;
  }

  const project = (await db`SELECT partner_id, project_id, total_price, partner_commission_percent, contract_signed_at, name FROM projects WHERE project_id = ${id} OR id::text = ${id} LIMIT 1`) as Record<string, unknown>[];
  if (project.length > 0 && project[0].partner_id) {
    const pid = project[0].partner_id as string;
    const projId = project[0].project_id as string;
    // Активность партнёра bump при контракте/оплате/тире — это влияет на уровень
    if ("contract_signed_at" in data || "tier" in data || "paid_amount" in data) {
      await bumpPartnerActivity(pid);
      await recomputePartnerLevel(pid);
    }
    // Если флаги множителей изменились — пересчёт ТОЛЬКО этого проекта
    if ("delivered_in_30_days" in data || "has_retention_bonus" in data || "has_churn_penalty" in data) {
      await recomputeSingleProjectCommission(projId);
    }

    // Sub-partner override: триггерим если впервые привязали партнёра ИЛИ впервые подтвердили контракт
    const partnerJustAttached = !hadPartner && Boolean(project[0].partner_id);
    const contractJustSigned = !hadContract && Boolean(project[0].contract_signed_at);
    if (partnerJustAttached || contractJustSigned) {
      // Берём свежие данные после recompute
      const fresh = (await db`SELECT total_price, partner_commission_percent, name FROM projects WHERE project_id = ${projId} LIMIT 1`) as Record<string, unknown>[];
      const totalPrice = Number(fresh[0]?.total_price || 0);
      const pct = Number(fresh[0]?.partner_commission_percent || 0);
      const subCommission = Math.round((totalPrice * pct) / 100);
      const partnerLevelRow = (await db`SELECT level FROM partners WHERE partner_id = ${pid} LIMIT 1`) as Record<string, unknown>[];
      const newLevel = Number(partnerLevelRow[0]?.level || 1);

      const overrideResult = await createOverrideIfApplicable({
        subPartnerId: pid,
        projectId: projId,
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
          payload: { projectId: projId, subPartnerId: pid },
        });
      }
    }
  }

  const updated = await db`SELECT * FROM projects WHERE project_id = ${id} OR id::text = ${id} LIMIT 1`;
  return NextResponse.json(updated[0] || {});
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  await initProjectTables();

  const proj = (await db`SELECT project_id FROM projects WHERE project_id = ${id} OR id::text = ${id} LIMIT 1`) as Record<string, unknown>[];
  if (proj.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  const pid = proj[0].project_id as string;

  await db`DELETE FROM project_stages WHERE project_id = ${pid}`;
  await db`DELETE FROM projects WHERE project_id = ${pid}`;
  return NextResponse.json({ success: true });
}
