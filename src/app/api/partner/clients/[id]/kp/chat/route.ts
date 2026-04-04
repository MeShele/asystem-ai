import { NextRequest, NextResponse } from "next/server";
import { getDb, initPartnerTables } from "@/lib/db";
import { chatWithAi } from "@/lib/ai-client";
import { buildSystemPrompt } from "@/lib/kp-prompt";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const partnerId = req.cookies.get("partner_session")?.value;
  if (!partnerId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string" || message.length > 2000) {
    return NextResponse.json({ error: "Message required (max 2000 chars)" }, { status: 400 });
  }

  const db = getDb();
  await initPartnerTables();

  // Fetch project
  const projects = await db`
    SELECT pc.*, p.name as partner_name, p.company as partner_company
    FROM partner_clients pc
    JOIN partners p ON p.partner_id = pc.partner_id
    WHERE pc.id = ${Number(id)} AND pc.partner_id = ${partnerId}
  `;
  if (projects.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  const project = projects[0];

  // Fetch existing messages (limit last 20)
  const existingMessages = await db`
    SELECT role, content FROM kp_messages
    WHERE project_id = ${Number(id)}
    ORDER BY created_at ASC
  `;

  // Fetch partner stats (total projects, completed, types)
  const partnerStatsRows = await db`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'completed')::int as completed,
      ARRAY_AGG(DISTINCT project_type) FILTER (WHERE project_type IS NOT NULL) as types
    FROM partner_clients WHERE partner_id = ${partnerId}
  `;
  const pStats = partnerStatsRows[0] || {};

  // Fetch approved KPs from this partner (learning from past successes)
  const approvedKps = await db`
    SELECT project_type, client_company, kp_content
    FROM partner_clients
    WHERE partner_id = ${partnerId}
      AND kp_status = 'approved'
      AND kp_content IS NOT NULL
      AND id != ${Number(id)}
    ORDER BY kp_reviewed_at DESC
    LIMIT 3
  `;

  // Build system prompt with project context + partner history
  const calcConfig = project.calculator_config as { selected?: string[]; quantities?: Record<string, number>; discount?: number } | null;
  const systemPrompt = buildSystemPrompt({
    partnerName: String(project.partner_name || ""),
    partnerCompany: String(project.partner_company || ""),
    clientName: String(project.client_name || ""),
    clientCompany: String(project.client_company || ""),
    projectType: String(project.project_type || ""),
    selectedServices: calcConfig?.selected || [],
    quantities: calcConfig?.quantities || {},
    discount: calcConfig?.discount || 0,
    partnerPrice: Number(project.partner_price) || 0,
    description: String(project.description || ""),
    partnerStats: {
      totalProjects: Number(pStats.total) || 0,
      completedProjects: Number(pStats.completed) || 0,
      projectTypes: Array.isArray(pStats.types) ? pStats.types.filter(Boolean).map(String) : [],
    },
    approvedKps: approvedKps.map((kp) => ({
      projectType: String(kp.project_type || ""),
      clientCompany: String(kp.client_company || ""),
      kpContent: String(kp.kp_content || ""),
    })),
  });

  // Build messages array for AI
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  // Add last 20 messages from history
  const recentMessages = existingMessages.slice(-20);
  for (const msg of recentMessages) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: String(msg.content),
    });
  }

  // Add current user message
  messages.push({ role: "user", content: message });

  try {
    // Save user message
    await db`INSERT INTO kp_messages (project_id, role, content) VALUES (${Number(id)}, 'user', ${message})`;

    // Call AI
    const aiResponse = await chatWithAi(messages);

    // Save assistant message
    await db`INSERT INTO kp_messages (project_id, role, content) VALUES (${Number(id)}, 'assistant', ${aiResponse})`;

    // Extract KP content if present (wrapped in ```kp ... ```)
    const kpMatch = aiResponse.match(/```kp\n([\s\S]*?)```/);
    if (kpMatch) {
      const kpContent = kpMatch[1].trim();
      await db`UPDATE partner_clients SET kp_content = ${kpContent}, kp_status = 'draft' WHERE id = ${Number(id)}`;
    }

    // Update kp_status to draft if it was 'none'
    if (String(project.kp_status) === "none") {
      await db`UPDATE partner_clients SET kp_status = 'draft' WHERE id = ${Number(id)} AND kp_status = 'none'`;
    }

    return NextResponse.json({
      message: aiResponse,
      kpExtracted: !!kpMatch,
    });
  } catch (e) {
    console.error("AI chat error:", e);
    const errorMsg = e instanceof Error ? e.message : "AI service error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
