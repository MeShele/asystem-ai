import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { notifyAdmin, createProjectTopic, createGroupInvite } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await req.json();
  const db = getDb();
  await initPartnerTables();

  const requestId = "PA-" + String(Date.now()).slice(-6);

  // Get partner info
  const partners = await db`SELECT name, telegram_id FROM partners WHERE partner_id = ${partnerId}` as Record<string, unknown>[];
  const partnerName = partners.length > 0 ? String(partners[0].name) : partnerId;

  // Create forum topic for the project
  let topicId: number | null = null;
  let inviteLink: string | null = null;
  try {
    topicId = await createProjectTopic(requestId, data.clientName, partnerName);
    inviteLink = await createGroupInvite();
  } catch {
    // Group not configured yet, skip
  }

  // Save to DB
  await db`INSERT INTO partner_clients (
    partner_id, request_id, client_name, client_phone, client_company,
    project_type, budget, base_price, partner_price, status, notes
  ) VALUES (
    ${partnerId},
    ${requestId},
    ${data.clientName},
    ${data.clientPhone || null},
    ${data.clientCompany || null},
    ${data.projectType},
    ${data.budget || null},
    ${0},
    ${Number(data.partnerPrice) || 0},
    'new',
    ${topicId ? `topic:${topicId}` : null}
  )`;

  // Notify admin
  const topicInfo = topicId ? `\nТопик создан: #${topicId}` : "";
  await notifyAdmin(
    `📥 Новый проект от партнёра\n\nID: *${requestId}*\nПартнёр: ${partnerName} (${partnerId})\nКлиент: ${data.clientName}\nТелефон: ${data.clientPhone || "—"}\nТип: ${data.projectType}\nЦена партнёра: $${data.partnerPrice || "не указана"}${topicInfo}\n\n⚠️ Нужно оценить и назначить базовую цену`
  ).catch(() => {});

  // Notify partner if they have telegram
  if (partners.length > 0 && partners[0].telegram_id) {
    const { sendMessage } = await import("@/lib/telegram");
    const inviteText = inviteLink
      ? `\n\n📎 Присоединяйтесь к рабочей группе проекта:\n${inviteLink}`
      : "";
    await sendMessage(
      String(partners[0].telegram_id),
      `✅ Проект *${requestId}* создан!\n\nКлиент: ${data.clientName}\nТип: ${data.projectType}\nСтатус: *Новый*\n\nМы оценим проект и начнём работу.${inviteText}`
    ).catch(() => {});
  }

  return NextResponse.json({ success: true, requestId, topicId, inviteLink });
}
