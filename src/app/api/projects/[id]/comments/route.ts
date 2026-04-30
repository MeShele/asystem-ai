import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";
import { notify, notifyAdmins } from "@/lib/notify";

interface AuthCheck {
  role: "admin" | "partner" | "client";
  id: string;
  name: string;
}

async function authorize(req: NextRequest, projectId: string): Promise<AuthCheck | null> {
  const adminSession = req.cookies.get("admin_session")?.value;
  if (adminSession) {
    return { role: "admin", id: "admin", name: "Администратор" };
  }
  const partnerSession = req.cookies.get("partner_session")?.value;
  if (partnerSession) {
    const db = getDb();
    const rows = (await db`
      SELECT p.partner_id, p.name FROM partners p
      JOIN projects pr ON pr.partner_id = p.partner_id
      WHERE p.partner_id = ${partnerSession} AND pr.project_id = ${projectId}
      LIMIT 1
    `) as Record<string, unknown>[];
    if (rows.length > 0) {
      return { role: "partner", id: rows[0].partner_id as string, name: rows[0].name as string };
    }
  }
  const clientSession = req.cookies.get("client_session")?.value;
  if (clientSession) {
    const db = getDb();
    const rows = (await db`
      SELECT c.client_id, c.name FROM clients c
      JOIN projects pr ON pr.client_id = c.client_id
      WHERE c.client_id = ${clientSession} AND pr.project_id = ${projectId}
      LIMIT 1
    `) as Record<string, unknown>[];
    if (rows.length > 0) {
      return { role: "client", id: rows[0].client_id as string, name: rows[0].name as string };
    }
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize(req, id);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = getDb();
  await initProjectTables();

  const rows = await db`
    SELECT * FROM project_comments WHERE project_id = ${id} ORDER BY created_at ASC
  `;
  return NextResponse.json(rows);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await authorize(req, id);
  if (!auth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();
  const message = String(data.message || "").trim();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const db = getDb();
  await initProjectTables();

  const inserted = await db`
    INSERT INTO project_comments (project_id, author_role, author_id, author_name, message)
    VALUES (${id}, ${auth.role}, ${auth.id}, ${auth.name}, ${message})
    RETURNING *
  `;

  // Уведомления остальным участникам проекта (кто НЕ автор)
  const proj = (await db`SELECT name, partner_id, client_id FROM projects WHERE project_id = ${id} LIMIT 1`) as Record<string, unknown>[];
  if (proj.length > 0) {
    const projectName = String(proj[0].name || id);
    const partnerId = proj[0].partner_id ? String(proj[0].partner_id) : null;
    const clientId = proj[0].client_id ? String(proj[0].client_id) : null;
    const preview = message.length > 80 ? message.slice(0, 80) + "…" : message;
    const body = `${auth.name}: ${preview}`;

    if (auth.role !== "partner" && partnerId) {
      await notify({ userRole: "partner", userId: partnerId, kind: "comment_added", title: `Новый комментарий в «${projectName}»`, body, link: `/partner/projects/${id}`, payload: { projectId: id } });
    }
    if (auth.role !== "client" && clientId) {
      await notify({ userRole: "client", userId: clientId, kind: "comment_added", title: `Новый комментарий в «${projectName}»`, body, link: `/client/projects/${id}`, payload: { projectId: id } });
    }
    if (auth.role !== "admin") {
      await notifyAdmins({ kind: "comment_added", title: `Комментарий в «${projectName}»`, body, link: `/admin/projects/${id}`, payload: { projectId: id } });
    }
  }

  return NextResponse.json(inserted[0]);
}
