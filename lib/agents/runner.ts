// Task scheduler runner for the ForcePK AI agents.
//
// A single in-process loop (started lazily on the first agent API call, kept
// alive by PM2) picks up due AgentTask rows and executes them:
//   ONCE      run the command once, mark DONE.
//   UNTIL     run a batch each tick until the agent's entity count reaches
//             targetCount (e.g. "collect leads until 500"), then DONE.
//   RECURRING run every intervalSec forever, until cancelled.
import { prisma } from "@/lib/prisma";
import { runAgentChat } from "@/lib/agents/chat";
import { collectLeadsBatch } from "@/lib/agents/leadsource";
import { isForcePkAgent, type ForcePkAgent } from "@/lib/agents/data";

let started = false;
let ticking = false;

const TICK_MS = 4000;
const MAX_RUNS = 400; // safety cap for UNTIL/RECURRING

async function progressCount(agent: ForcePkAgent): Promise<number> {
  switch (agent) {
    case "lead-gen": return prisma.lead.count();
    case "company-research": return prisma.company.count();
    case "candidate-matching": return prisma.candidateProfile.count();
    case "requirement": return prisma.requirement.count();
    case "oep-matching": return prisma.oep.count();
    case "compliance":
    case "cv-document": return prisma.document.count();
    case "interview": return prisma.interview.count();
    case "deployment": return prisma.application.count();
    case "relationship": return prisma.invoice.count();
    default: return 0;
  }
}

const COUNTRY_WORDS = ["saudi arabia", "saudi", "uae", "united arab emirates", "dubai", "abu dhabi", "qatar", "doha", "kuwait", "oman", "muscat", "bahrain", "manama", "riyadh", "jeddah", "dammam"];
function regionFromCommand(cmd: string): string | undefined {
  const l = cmd.toLowerCase();
  for (const w of COUNTRY_WORDS) if (l.includes(w)) return w;
  return undefined;
}

async function processTask(task: { id: string; agent: string; command: string; kind: string; targetCount: number | null; intervalSec: number | null; runs: number }) {
  if (!isForcePkAgent(task.agent)) {
    await prisma.agentTask.update({ where: { id: task.id }, data: { status: "FAILED", result: `Unknown agent ${task.agent}` } });
    return;
  }
  const agent = task.agent;

  if (task.runs >= MAX_RUNS) {
    await prisma.agentTask.update({ where: { id: task.id }, data: { status: "DONE", result: `Stopped at safety cap (${MAX_RUNS} runs).` } });
    return;
  }

  await prisma.agentTask.update({ where: { id: task.id }, data: { status: "RUNNING", lastRunAt: new Date(), runs: { increment: 1 } } });

  try {
    if (task.kind === "UNTIL") {
      const target = task.targetCount ?? 0;
      let count = await progressCount(agent);
      if (target && count >= target) {
        await prisma.agentTask.update({ where: { id: task.id }, data: { status: "DONE", progress: count, result: `Target reached: ${count}/${target}.` } });
        return;
      }
      // Do one batch of work.
      let note = "";
      if (agent === "lead-gen") {
        const remaining = target ? Math.min(30, target - count) : 30;
        const r = await collectLeadsBatch({ region: regionFromCommand(task.command), limit: remaining });
        note = `+${r.inserted} leads (${r.fromOsm} OSM / ${r.generated} gen) from ${r.region}`;
      } else {
        const res = await runAgentChat(agent, `${task.command}\n\nThis is a repeating job toward a target of ${target}. Perform ONE batch of work now (create/collect roughly 20 items) and stop.`);
        note = res.reply.slice(0, 160);
      }
      count = await progressCount(agent);
      const done = target ? count >= target : true;
      await prisma.agentTask.update({
        where: { id: task.id },
        data: { progress: count, result: `${note} · ${count}/${target}`, status: done ? "DONE" : "RUNNING", nextRunAt: done ? null : new Date(Date.now() + 1500) },
      });
      return;
    }

    if (task.kind === "RECURRING") {
      const res = await runAgentChat(agent, task.command);
      await prisma.agentTask.update({ where: { id: task.id }, data: { result: res.reply.slice(0, 200), status: "RUNNING", nextRunAt: new Date(Date.now() + (task.intervalSec ?? 3600) * 1000) } });
      return;
    }

    // ONCE
    const res = await runAgentChat(agent, task.command);
    await prisma.agentTask.update({ where: { id: task.id }, data: { status: "DONE", result: `${res.reply.slice(0, 180)} (${res.toolCallsExecuted.length} actions)` } });
  } catch (e) {
    await prisma.agentTask.update({ where: { id: task.id }, data: { status: "FAILED", result: e instanceof Error ? e.message : "Task failed." } });
  }
}

async function tick() {
  if (ticking) return;
  ticking = true;
  try {
    const due = await prisma.agentTask.findMany({
      where: { status: { in: ["PENDING", "RUNNING"] }, OR: [{ nextRunAt: null }, { nextRunAt: { lte: new Date() } }] },
      orderBy: { nextRunAt: "asc" }, take: 3,
    });
    for (const t of due) await processTask(t);
  } catch { /* swallow — next tick retries */ } finally {
    ticking = false;
  }
}

/** Start the scheduler loop once. Safe to call on every request. */
export function ensureRunner() {
  if (started) return;
  started = true;
  setInterval(() => { void tick(); }, TICK_MS);
}
