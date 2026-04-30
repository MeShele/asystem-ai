import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";

/**
 * Прогноз дохода партнёра по месяцам.
 *
 * Алгоритм:
 *  Для каждого активного проекта (status != completed/cancelled):
 *    fullCommission = total_price * partner_commission_percent / 100
 *    paidSoFar = SUM(paid status) на проекте
 *    pendingRequested = SUM(requested status) на проекте
 *    remaining = fullCommission - paidSoFar - pendingRequested  (то что ещё не запрошено)
 *
 *  Распределяем remaining:
 *    - 50% — в следующий месяц (старт месяца + базовый платёж)
 *    - оставшиеся 50% — равномерно между следующих 1-3 месяцев в зависимости от срока проекта
 *    Проще: разносим remaining по 2-3 ближайшим месяцам пропорционально (1 - progress_percent).
 *
 *  Для уже-requested (ожидается одобрение) — кладём в текущий месяц.
 *
 * Возвращаем массив { month: 'YYYY-MM', forecast: number, breakdown: { projectId, amount }[] }
 * на ближайшие 6 месяцев + текущий.
 */

type Row = Record<string, unknown>;

interface MonthBucket {
  month: string;
  forecast: number;
  breakdown: { projectId: string; projectName: string; amount: number }[];
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initPartnerTables();
  const db = getDb();

  // Активные проекты партнёра
  const projects = (await db`
    SELECT project_id, name, total_price, paid_amount, partner_commission_percent, progress_percent, status
    FROM projects
    WHERE partner_id = ${partnerId}
      AND status NOT IN ('completed', 'cancelled')
  `) as Row[];

  // Подготовим 6 месяцев вперёд начиная с текущего
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = 0; i < 7; i++) {
    buckets.push({ month: monthKey(addMonths(now, i)), forecast: 0, breakdown: [] });
  }
  const bucketIdx = new Map<string, number>(buckets.map((b, i) => [b.month, i]));

  // Для каждого проекта считаем remaining, распределяем
  for (const p of projects) {
    const projectId = String(p.project_id);
    const projectName = String(p.name || projectId);
    const totalPrice = Number(p.total_price || 0);
    const pct = Number(p.partner_commission_percent || 0);
    const fullCommission = Math.round((totalPrice * pct) / 100);
    if (fullCommission <= 0) continue;
    const progress = Math.max(0, Math.min(100, Number(p.progress_percent || 0)));

    // Что уже выплачено / в обработке по этому проекту
    const sumRow = (await db`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS paid_sum,
        COALESCE(SUM(CASE WHEN status = 'requested' THEN amount ELSE 0 END), 0) AS pending_sum
      FROM partner_payouts
      WHERE project_id = ${projectId}
    `) as Row[];
    const paidSum = Number(sumRow[0]?.paid_sum || 0);
    const pendingSum = Number(sumRow[0]?.pending_sum || 0);
    const remaining = Math.max(0, fullCommission - paidSum - pendingSum);

    // pendingSum (requested) — ожидается в текущем месяце
    if (pendingSum > 0) {
      const idx = bucketIdx.get(buckets[0].month)!;
      buckets[idx].forecast += pendingSum;
      buckets[idx].breakdown.push({ projectId, projectName, amount: pendingSum });
    }

    // Распределяем remaining:
    //  - текущий месяц: 30% от remaining (если progress > 50% — 50%, чтобы быстрее)
    //  - следующий месяц: 40% (или больше если близко к завершению)
    //  - +1 месяц: 30%
    //  - +2..+3 месяца: остаток
    if (remaining > 0) {
      const distribution = progress >= 70
        ? [0.5, 0.4, 0.1, 0]
        : progress >= 30
        ? [0.3, 0.4, 0.2, 0.1]
        : [0.15, 0.3, 0.3, 0.25];

      let dropped = 0;
      for (let i = 0; i < distribution.length; i++) {
        const share = distribution[i];
        const amount = Math.round(remaining * share);
        if (amount > 0 && i < buckets.length) {
          buckets[i].forecast += amount;
          buckets[i].breakdown.push({ projectId, projectName, amount });
          dropped += amount;
        }
      }
      // Округление: остаток скидываем в первый bucket
      const leftover = remaining - dropped;
      if (leftover !== 0 && buckets.length > 0) {
        buckets[0].forecast += leftover;
      }
    }
  }

  return NextResponse.json({
    months: buckets,
    totals: {
      sum: buckets.reduce((s, b) => s + b.forecast, 0),
      // Проекты в работе с положительным remaining
      activeProjectsWithCommission: projects.filter((p) => Number(p.partner_commission_percent || 0) > 0).length,
    },
  });
}
