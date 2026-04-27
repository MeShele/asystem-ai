import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";
import { randomBytes } from "crypto";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const rows = await db`
    SELECT * FROM invites
    ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("admin_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const role = data.role === "partner" || data.role === "client" ? data.role : null;
  if (!role) return NextResponse.json({ error: "role must be partner or client" }, { status: 400 });

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  const token = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000); // 30 days

  const inserted = await db`
    INSERT INTO invites (token, role, project_id, email, name, expires_at)
    VALUES (
      ${token},
      ${role},
      ${data.project_id ?? null},
      ${data.email ?? null},
      ${data.name ?? null},
      ${expiresAt.toISOString()}::timestamp
    )
    RETURNING *
  `;
  return NextResponse.json(inserted[0]);
}
