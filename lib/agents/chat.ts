// Agentic chat for the ForcePK AI agents: OpenAI function-calling loop that lets
// an agent actually DO work by invoking its tools (real CRUD), then report back.
// Shared by the chat endpoint and the task runner.
import { toolsForAgent, openAiTools, runTool } from "@/lib/agents/actions";
import { agentSummary, type ForcePkAgent } from "@/lib/agents/data";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const AGENT_TITLES: Record<ForcePkAgent, string> = {
  "lead-gen": "Lead Generation Agent",
  "company-research": "Company Research Agent",
  requirement: "Manpower Requirement Agent",
  "oep-matching": "OEP Matching Agent",
  compliance: "Compliance Agent",
  "candidate-matching": "Candidate Matching Agent",
  "cv-document": "CV & Document Agent",
  interview: "Interview & Trade-Test Agent",
  deployment: "Deployment Tracking Agent",
  relationship: "Client & OEP Relationship Agent",
  ceo: "CEO Intelligence Agent",
};

function systemPrompt(agent: ForcePkAgent, summary: unknown): string {
  const base = `You are the ForcePK ${AGENT_TITLES[agent]}, an autonomous operations agent for a global manpower-recruitment platform. You have FULL control over your niche and can read AND modify real platform data by calling your tools. When the user asks you to do something, actually DO it by calling the right tool(s) — do not just describe it. After acting, report exactly what you did with real numbers and ids. Be concise and operational.`;
  const ceo = agent === "ceo"
    ? ` You are the CEO agent: all other agents are your subordinates. You can run any of their actions directly, and you can schedule work with schedule_task — use kind "UNTIL" with a targetCount for goals like "collect leads until 500", "RECURRING" with intervalSec for ongoing jobs, and "ONCE" for one-off actions. You can also list_tasks and cancel_task.`
    : "";
  return `${base}${ceo}\n\nCurrent snapshot of your area (live): ${JSON.stringify(summary)}`;
}

export interface ChatTurn { role: "user" | "assistant"; content: string }
export interface ChatResult { reply: string; toolCallsExecuted: Array<{ name: string; result: unknown }> }

async function openAiCall(messages: unknown[], tools: unknown[]): Promise<{ content: string | null; toolCalls: Array<{ id: string; name: string; args: Record<string, unknown> }> } | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages, tools: tools.length ? tools : undefined, tool_choice: tools.length ? "auto" : undefined, max_tokens: 900, temperature: 0.2 }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const msg = data?.choices?.[0]?.message;
    if (!msg) return null;
    const toolCalls = Array.isArray(msg.tool_calls)
      ? msg.tool_calls.map((tc: { id: string; function: { name: string; arguments: string } }) => {
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(tc.function.arguments || "{}"); } catch { /* ignore */ }
          return { id: tc.id, name: tc.function.name, args };
        })
      : [];
    return { content: msg.content ?? null, toolCalls, raw: msg } as never;
  } catch {
    return null;
  }
}

/**
 * Run one agent "command": the model may call tools several times before giving
 * a final answer. maxRounds caps the loop. Returns the final reply plus every
 * tool it executed (so the UI can show real actions taken).
 */
export async function runAgentChat(agent: ForcePkAgent, message: string, history: ChatTurn[] = [], maxRounds = 6): Promise<ChatResult> {
  const tools = toolsForAgent(agent);
  const summary = await agentSummary(agent === "ceo" ? "ceo" : agent);
  const schemas = openAiTools(tools);

  const messages: Record<string, unknown>[] = [
    { role: "system", content: systemPrompt(agent, summary) },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  const executed: Array<{ name: string; result: unknown }> = [];

  for (let round = 0; round < maxRounds; round++) {
    const out = await openAiCall(messages, schemas);
    if (!out) {
      return { reply: executed.length ? `Done. Executed ${executed.length} action(s).` : "AI is not configured (missing OpenAI key).", toolCallsExecuted: executed };
    }
    if (out.toolCalls.length === 0) {
      return { reply: out.content ?? "Done.", toolCallsExecuted: executed };
    }
    // Append the assistant message carrying the tool calls, then each result.
    messages.push({ role: "assistant", content: out.content ?? "", tool_calls: out.toolCalls.map((t) => ({ id: t.id, type: "function", function: { name: t.name, arguments: JSON.stringify(t.args) } })) });
    for (const tc of out.toolCalls) {
      const result = await runTool(tools, tc.name, tc.args);
      executed.push({ name: tc.name, result });
      messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(result).slice(0, 4000) });
    }
  }
  return { reply: `Completed ${executed.length} action(s) (reached step limit).`, toolCallsExecuted: executed };
}
