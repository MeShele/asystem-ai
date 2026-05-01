import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  const cookie = req.cookies.get("admin_session");
  if (!cookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: "Status required" }, { status: 400 });
    }

    // Admin-status → partner.lead_status (TMA читает lead_status; должны быть синхронны)
    const ADMIN_TO_LEAD: Record<string, string> = {
      new: "new",
      review: "contacted",
      estimate: "qualified",
      progress: "in_progress",
      in_progress: "in_progress",
      completed: "won",
      won: "won",
      lost: "lost",
      closed: "lost",
    };
    const leadStatus = ADMIN_TO_LEAD[status] || "new";

    const db = getDb();
    await db`UPDATE asystem_requests SET status = ${status}, lead_status = ${leadStatus} WHERE request_id = ${requestId}`;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to update request:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
