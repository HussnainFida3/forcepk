import { requireAccess } from "@/lib/agents/token";
import { isForcePkAgent, agentSummary, agentActivity, agentStats } from "@/lib/agents/data";
import { runAgentChat } from "@/lib/agents/chat";
import { ensureRunner } from "@/lib/agents/runner";
import { prisma } from "@/lib/prisma";
import { json, preflight } from "@/lib/agents/http";

export const dynamic = "force-dynamic";

// Dispatcher for every ForcePK AI agent the command center drives:
//   GET  /api/ai-agents/<agent>/summary | stats | activity | tasks
//   POST /api/ai-agents/<agent>/chat   { message, history }   (agentic, runs tools)
//   POST /api/ai-agents/<agent>/tasks  { command, kind, targetCount, intervalSec }
//   POST /api/ai-agents/<agent>/cancel { id }
// All bearer-protected with the access token minted by /api/auth/login.

type Ctx = { params: Promise<{ agent: string; action: string[] }> };

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request, { params }: Ctx) {
  if (!(await requireAccess(req))) return json(req, { success: false, error: { message: "Unauthorized.", code: "UNAUTHORIZED" } }, 401);
  ensureRunner();
  const { agent, action } = await params;
  if (!isForcePkAgent(agent)) return json(req, { success: false, error: { message: "Unknown agent." } }, 404);
  const act = action?.[0] ?? "summary";

  if (act === "stats") return json(req, { success: true, data: agentStats(agent), meta: {} });

  if (act === "activity") {
    const [logs, domain] = await Promise.all([
      prisma.agentActionLog.findMany({ where: { agent }, orderBy: { createdAt: "desc" }, take: 15 }),
      agentActivity(agent),
    ]);
    const logRows = logs.map((l) => ({ id: l.id, action: `${l.action}: ${l.detail ?? ""}`.trim(), targetType: "Agent action", targetId: null, createdAt: l.createdAt.toISOString(), admin: null, meta: { ok: l.ok } }));
    const rows = [...logRows, ...domain].slice(0, 40);
    return json(req, { success: true, data: rows, meta: { page: 1, pageSize: rows.length, total: rows.length, totalPages: 1 } });
  }

  if (act === "tasks") {
    const where = agent === "ceo" ? {} : { agent };
    const tasks = await prisma.agentTask.findMany({ where, orderBy: { createdAt: "desc" }, take: 40 });
    return json(req, { success: true, data: tasks, meta: {} });
  }

  return json(req, { success: true, data: await agentSummary(agent), meta: {} });
}

export async function POST(req: Request, { params }: Ctx) {
  if (!(await requireAccess(req))) return json(req, { success: false, error: { message: "Unauthorized.", code: "UNAUTHORIZED" } }, 401);
  ensureRunner();
  const { agent, action } = await params;
  if (!isForcePkAgent(agent)) return json(req, { success: false, error: { message: "Unknown agent." } }, 404);
  const act = action?.[0] ?? "";
  const body = await req.json().catch(() => null);

  if (act === "chat") {
    const message = typeof body?.message === "string" ? body.message : "";
    if (!message) return json(req, { success: false, error: { message: "A message is required." } }, 400);
    const history = Array.isArray(body?.history) ? body.history : [];
    const result = await runAgentChat(agent, message, history);
    return json(req, { success: true, data: result, meta: {} });
  }

  if (act === "tasks") {
    const command = typeof body?.command === "string" ? body.command : "";
    if (!command) return json(req, { success: false, error: { message: "A command is required." } }, 400);
    const kind = ["ONCE", "UNTIL", "RECURRING"].includes(body?.kind) ? body.kind : "ONCE";
    const task = await prisma.agentTask.create({
      data: {
        agent: agent === "ceo" && typeof body?.agent === "string" ? body.agent : agent,
        command, kind,
        targetCount: typeof body?.targetCount === "number" ? body.targetCount : null,
        intervalSec: typeof body?.intervalSec === "number" ? body.intervalSec : null,
        status: "PENDING", nextRunAt: new Date(),
      },
    });
    return json(req, { success: true, data: task, meta: {} });
  }

  if (act === "cancel") {
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return json(req, { success: false, error: { message: "A task id is required." } }, 400);
    const task = await prisma.agentTask.update({ where: { id }, data: { status: "CANCELLED" } });
    return json(req, { success: true, data: task, meta: {} });
  }

  return json(req, { success: false, error: { message: "Unsupported action." } }, 404);
}
