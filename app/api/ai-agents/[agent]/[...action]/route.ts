import { requireAccess } from "@/lib/agents/token";
import { isForcePkAgent, agentSummary, agentActivity, agentStats } from "@/lib/agents/data";
import { assistantAnswer } from "@/lib/integrations/ai";
import { json, preflight } from "@/lib/agents/http";

export const dynamic = "force-dynamic";

// Single dispatcher for every ForcePK AI agent the command center drives:
//   GET  /api/ai-agents/<agent>/summary
//   GET  /api/ai-agents/<agent>/stats
//   GET  /api/ai-agents/<agent>/activity
//   POST /api/ai-agents/<agent>/chat
// All bearer-protected with the access token minted by /api/auth/login.

type Ctx = { params: Promise<{ agent: string; action: string[] }> };

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request, { params }: Ctx) {
  if (!(await requireAccess(req))) return json(req, { success: false, error: { message: "Unauthorized.", code: "UNAUTHORIZED" } }, 401);
  const { agent, action } = await params;
  if (!isForcePkAgent(agent)) return json(req, { success: false, error: { message: "Unknown agent." } }, 404);
  const act = action?.[0] ?? "summary";

  if (act === "stats") return json(req, { success: true, data: agentStats(agent), meta: {} });
  if (act === "activity") {
    const rows = await agentActivity(agent);
    return json(req, { success: true, data: rows, meta: { page: 1, pageSize: rows.length, total: rows.length, totalPages: 1 } });
  }
  // summary (and any other GET) returns the live summary so the dashboard fills.
  return json(req, { success: true, data: await agentSummary(agent), meta: {} });
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await requireAccess(req))) return json(req, { success: false, error: { message: "Unauthorized.", code: "UNAUTHORIZED" } }, 401);
  const { agent, action } = await params;
  if (!isForcePkAgent(agent)) return json(req, { success: false, error: { message: "Unknown agent." } }, 404);
  const act = action?.[0] ?? "";

  if (act === "chat") {
    const body = await req.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message : "";
    if (!message) return json(req, { success: false, error: { message: "A message is required." } }, 400);
    const context = await agentSummary(agent);
    const { answer } = await assistantAnswer(message, context as Record<string, unknown>);
    return json(req, { success: true, data: { reply: answer, toolCallsExecuted: [] }, meta: {} });
  }
  return json(req, { success: false, error: { message: "Unsupported action." } }, 404);
}
