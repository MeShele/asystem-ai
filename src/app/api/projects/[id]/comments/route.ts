import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

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
  return NextResponse.json(inserted[0]);
}
