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
    const ALLOWED = ["new", "contacted", "qualified", "won", "lost"];
    if (!status || !ALLOWED.includes(status)) {
      return NextResponse.json({ error: "Status invalid (allowed: " + ALLOWED.join(", ") + ")" }, { status: 400 });
    }

    const db = getDb();
    await db`UPDATE asystem_requests SET status = ${status}, lead_status = ${status} WHERE request_id = ${requestId}`;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to update request:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
