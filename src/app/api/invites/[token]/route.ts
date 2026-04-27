import { NextRequest, NextResponse } from "next/server";
import { getDb, initProjectTables } from "@/lib/db";

// Public: preview an invite by token. Returns role + pre-fill data, or 404/expired.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const db = getDb();
  await initProjectTables();

  const rows = (await db`
    SELECT id, token, role, project_id, email, name, used_at, expires_at, created_at
    FROM invites WHERE token = ${token} LIMIT 1
  `) as Record<string, unknown>[];
  if (rows.length === 0) return NextResponse.json({ error: "not found" }, { status: 404 });

  const inv = rows[0];
  if (inv.used_at) return NextResponse.json({ error: "already used" }, { status: 410 });
  if (inv.expires_at && new Date(inv.expires_at as string).getTime() < Date.now()) {
    return NextResponse.json({ error: "expired" }, { status: 410 });
  }

  return NextResponse.json({
    role: inv.role,
    email: inv.email,
    name: inv.name,
    project_id: inv.project_id,
  });
}
