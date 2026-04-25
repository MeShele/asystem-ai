import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables, initProjectTables } from "@/lib/db";

export async function GET(req: NextRequest) {
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  await initPartnerTables();
  await initProjectTables();

  // Unique developers across all partner's projects with project counts
  const rows = await db`
    SELECT
      d.id, d.name, d.role, d.avatar_url,
      COUNT(DISTINCT p.project_id) AS projects_count
    FROM developers d
    JOIN project_developers pd ON pd.developer_id = d.id
    JOIN projects p ON p.project_id = pd.project_id
    WHERE p.partner_id = ${partnerId}
    GROUP BY d.id, d.name, d.role, d.avatar_url
    ORDER BY projects_count DESC, d.name ASC
  `;

  return NextResponse.json(rows);
}
