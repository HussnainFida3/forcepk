import { requireAccess } from "@/lib/agents/token";
import { isForcePkAgent, agentSummary, agentActivity, agentStats } from "@/lib/agents/data";
import { runAgentChat } from "@/lib/agents/chat";
import { ensureRunner } from "@/lib/agents/runner";
import { collectLeadsBatch } from "@/lib/agents/leadsource";
import { discoverHiringBatch } from "@/lib/agents/careerscan";
import { prisma } from "@/lib/prisma";
import { json, preflight } from "@/lib/agents/http";

const LEAD_STAGES = ["NEW", "CONTACTED", "MEETING", "PROPOSAL", "AGREEMENT", "WON", "LOST"] as const;
function leadWhereFrom(url: URL) {
  const stage = url.searchParams.get("stage")?.toUpperCase();
  const source = url.searchParams.get("source");
  const q = url.searchParams.get("q") || url.searchParams.get("search");
  const where: Record<string, unknown> = {};
  if (stage && (LEAD_STAGES as readonly string[]).includes(stage)) where.stage = stage;
  if (source) where.source = source;
  if (q) where.OR = [
    { company: { contains: q, mode: "insensitive" } },
    { name: { contains: q, mode: "insensitive" } },
    { email: { contains: q, mode: "insensitive" } },
    { notes: { contains: q, mode: "insensitive" } },
  ];
  return where;
}

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

  // Full leads list with filters + pagination (for the Lead Gen agent's Leads tab).
  if (act === "leads") {
    const url = new URL(req.url);
    const where = leadWhereFrom(url);
    const page = Math.max(parseInt(url.searchParams.get("page") ?? "1", 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(url.searchParams.get("pageSize") ?? "25", 10) || 25, 1), 100);
    const [total, rows, byStage, bySource] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, name: true, company: true, email: true, phone: true, source: true, stage: true, notes: true, createdAt: true } }),
      prisma.lead.groupBy({ by: ["stage"], _count: { _all: true } }),
      prisma.lead.groupBy({ by: ["source"], _count: { _all: true } }),
    ]);
    const map = <T extends { _count?: { _all?: number } }>(arr: T[], k: keyof T) => Object.fromEntries(arr.map((r) => [String(r[k] ?? "Unknown"), r._count?._all ?? 0]));
    return json(req, {
      success: true,
      data: { rows: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })), total, page, pageSize, totalPages: Math.max(Math.ceil(total / pageSize), 1), byStage: map(byStage, "stage"), bySource: map(bySource, "source") },
      meta: { page, pageSize, total, totalPages: Math.max(Math.ceil(total / pageSize), 1) },
    });
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

  // ── Leads CRUD + deterministic collectors (Lead Gen agent) ──
  const str = (k: string) => (typeof body?.[k] === "string" ? body[k].trim() : undefined);

  if (act === "lead-create") {
    const company = str("company");
    if (!company) return json(req, { success: false, error: { message: "Company is required." } }, 400);
    const stage = (str("stage")?.toUpperCase() ?? "NEW");
    const lead = await prisma.lead.create({ data: { company, name: str("name") || company, email: str("email") || null, phone: str("phone") || null, source: str("source") || "Manual", stage: (LEAD_STAGES as readonly string[]).includes(stage) ? stage as never : "NEW", notes: str("notes") || null } });
    return json(req, { success: true, data: lead, meta: {} });
  }

  if (act === "lead-update") {
    const id = str("id");
    if (!id) return json(req, { success: false, error: { message: "A lead id is required." } }, 400);
    const data: Record<string, unknown> = {};
    for (const f of ["company", "name", "email", "phone", "source", "notes"]) if (str(f) !== undefined) data[f] = str(f) || null;
    const stage = str("stage")?.toUpperCase();
    if (stage && (LEAD_STAGES as readonly string[]).includes(stage)) data.stage = stage;
    const lead = await prisma.lead.update({ where: { id }, data });
    return json(req, { success: true, data: lead, meta: {} });
  }

  if (act === "lead-delete") {
    const id = str("id");
    if (!id) return json(req, { success: false, error: { message: "A lead id is required." } }, 400);
    await prisma.lead.delete({ where: { id } });
    return json(req, { success: true, data: { deleted: id }, meta: {} });
  }

  if (act === "collect") {
    const r = await collectLeadsBatch({ region: str("region"), limit: typeof body?.limit === "number" ? body.limit : 25 });
    return json(req, { success: true, data: r, meta: {} });
  }

  if (act === "scan") {
    const r = await discoverHiringBatch({ country: str("country"), limit: typeof body?.limit === "number" ? body.limit : 6 });
    return json(req, { success: true, data: r, meta: {} });
  }

  return json(req, { success: false, error: { message: "Unsupported action." } }, 404);
}
