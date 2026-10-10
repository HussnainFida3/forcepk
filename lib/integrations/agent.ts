// ForcePK AI Agents — an agentic tool-use loop over the Anthropic Messages API.
// The agent can take real actions on the platform (CRUD), send email, and (for
// the lead agent) search public business sources via the server-side web_search
// tool. Everything is env-gated: with no ANTHROPIC_API_KEY the runner returns a
// clear "connect a key" result and takes no action.
//
// Safety: tools only touch this platform's own database and the configured email
// provider. The lead agent uses Anthropic's hosted web_search over PUBLIC business
// listings — it does not log in anywhere, bypass access controls, or collect data
// from behind authentication.

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/integrations/channels";

const API = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_AGENT_MODEL ?? process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

export type AgentStep =
  | { kind: "tool"; name: string; input: Record<string, unknown>; summary: string; ok: boolean }
  | { kind: "search"; query: string }
  | { kind: "text"; text: string };

export type AgentResult = { ok: boolean; ai: boolean; answer: string; steps: AgentStep[]; error?: string };

type ToolHandler = (input: Record<string, unknown>, ctx: { userId?: string }) => Promise<{ summary: string; data?: unknown }>;
type ToolDef = { name: string; description: string; input_schema: Record<string, unknown>; handler: ToolHandler };

const s = (v: unknown) => (v === undefined || v === null ? undefined : String(v));
async function audit(userId: string | undefined, action: string, entity: string, entityId: string) {
  await prisma.auditLog.create({ data: { userId: userId ?? null, action, entity, entityId } }).catch(() => {});
}

// ── Tool registry ─────────────────────────────────────────────────
const TOOLS: Record<string, ToolDef> = {
  platform_stats: {
    name: "platform_stats",
    description: "Get live counts across the platform (companies, partners, candidates, requirements, applications, leads, pending verifications, missing documents). Use this to answer analytics questions.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
    handler: async () => {
      const [companies, pendingCompanies, oeps, candidates, openReqs, apps, leads, missingDocs] = await Promise.all([
        prisma.company.count(), prisma.company.count({ where: { status: "PENDING" } }), prisma.oep.count(),
        prisma.candidateProfile.count(), prisma.requirement.count({ where: { status: "OPEN" } }),
        prisma.application.count(), prisma.lead.count(), prisma.document.count({ where: { status: { in: ["MISSING", "EXPIRED"] } } }),
      ]);
      return { summary: `Read platform stats (${companies} companies, ${leads} leads)`, data: { companies, pendingCompanies, oeps, candidates, openReqs, applications: apps, leads, missingDocs } };
    },
  },
  list_leads: {
    name: "list_leads",
    description: "List recent CRM leads, optionally filtered by stage. Returns names, companies, contact info and stage.",
    input_schema: { type: "object", properties: { stage: { type: "string", enum: ["NEW", "CONTACTED", "MEETING", "PROPOSAL", "AGREEMENT", "WON", "LOST"] }, limit: { type: "number" } }, additionalProperties: false },
    handler: async (i) => {
      const leads = await prisma.lead.findMany({ where: i.stage ? { stage: i.stage as never } : {}, take: Math.min(Number(i.limit ?? 25), 100), orderBy: { updatedAt: "desc" }, select: { id: true, name: true, company: true, email: true, phone: true, stage: true, source: true } });
      return { summary: `Listed ${leads.length} leads`, data: leads };
    },
  },
  create_lead: {
    name: "create_lead",
    description: "Create a new CRM lead. Use this to save a prospect (e.g. a company discovered via web search that needs manpower).",
    input_schema: { type: "object", properties: { name: { type: "string", description: "Contact name or company contact" }, company: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, source: { type: "string", description: "Where the lead came from, e.g. 'Web search', 'LinkedIn'" }, notes: { type: "string" }, stage: { type: "string", enum: ["NEW", "CONTACTED", "MEETING", "PROPOSAL", "AGREEMENT", "WON", "LOST"] } }, required: ["name"], additionalProperties: false },
    handler: async (i, ctx) => {
      const lead = await prisma.lead.create({ data: { name: String(i.name), company: s(i.company) ?? null, email: s(i.email) ?? null, phone: s(i.phone) ?? null, source: s(i.source) ?? "AI Agent", notes: s(i.notes) ?? null, stage: (s(i.stage) ?? "NEW") as never, ownerId: ctx.userId ?? null } });
      await audit(ctx.userId, "lead.agent.create", "Lead", lead.id);
      return { summary: `Created lead: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`, data: { id: lead.id } };
    },
  },
  update_lead: {
    name: "update_lead",
    description: "Update an existing lead by id (change stage, add notes, fix contact info).",
    input_schema: { type: "object", properties: { leadId: { type: "string" }, name: { type: "string" }, company: { type: "string" }, email: { type: "string" }, phone: { type: "string" }, notes: { type: "string" }, stage: { type: "string", enum: ["NEW", "CONTACTED", "MEETING", "PROPOSAL", "AGREEMENT", "WON", "LOST"] } }, required: ["leadId"], additionalProperties: false },
    handler: async (i, ctx) => {
      await prisma.lead.update({ where: { id: String(i.leadId) }, data: { name: s(i.name), company: s(i.company), email: s(i.email), phone: s(i.phone), notes: s(i.notes), stage: i.stage ? (String(i.stage) as never) : undefined } });
      await audit(ctx.userId, "lead.agent.update", "Lead", String(i.leadId));
      return { summary: `Updated lead ${String(i.leadId).slice(-6)}` };
    },
  },
  delete_lead: {
    name: "delete_lead",
    description: "Delete a lead by id. Use only when explicitly asked.",
    input_schema: { type: "object", properties: { leadId: { type: "string" } }, required: ["leadId"], additionalProperties: false },
    handler: async (i, ctx) => {
      await prisma.lead.delete({ where: { id: String(i.leadId) } });
      await audit(ctx.userId, "lead.agent.delete", "Lead", String(i.leadId));
      return { summary: `Deleted lead ${String(i.leadId).slice(-6)}` };
    },
  },
  list_companies: {
    name: "list_companies",
    description: "List employer companies, optionally by status (PENDING/VERIFIED/SUSPENDED/REJECTED).",
    input_schema: { type: "object", properties: { status: { type: "string", enum: ["PENDING", "VERIFIED", "SUSPENDED", "REJECTED"] }, limit: { type: "number" } }, additionalProperties: false },
    handler: async (i) => {
      const companies = await prisma.company.findMany({ where: i.status ? { status: i.status as never } : {}, take: Math.min(Number(i.limit ?? 25), 100), orderBy: { createdAt: "desc" }, select: { id: true, name: true, crNumber: true, city: true, industry: true, status: true } });
      return { summary: `Listed ${companies.length} companies`, data: companies };
    },
  },
  create_company: {
    name: "create_company",
    description: "Create an employer company record.",
    input_schema: { type: "object", properties: { name: { type: "string" }, crNumber: { type: "string" }, city: { type: "string" }, industry: { type: "string" }, email: { type: "string" }, phone: { type: "string" } }, required: ["name"], additionalProperties: false },
    handler: async (i, ctx) => {
      const company = await prisma.company.create({ data: { name: String(i.name), crNumber: s(i.crNumber) ?? `CR-${Date.now()}`, city: s(i.city) ?? null, industry: s(i.industry) ?? null, email: s(i.email) ?? null, phone: s(i.phone) ?? null, status: "PENDING" } });
      await audit(ctx.userId, "company.agent.create", "Company", company.id);
      return { summary: `Created company: ${company.name}`, data: { id: company.id } };
    },
  },
  set_company_status: {
    name: "set_company_status",
    description: "Set a company's verification status by id.",
    input_schema: { type: "object", properties: { companyId: { type: "string" }, status: { type: "string", enum: ["PENDING", "VERIFIED", "SUSPENDED", "REJECTED"] } }, required: ["companyId", "status"], additionalProperties: false },
    handler: async (i, ctx) => {
      await prisma.company.update({ where: { id: String(i.companyId) }, data: { status: String(i.status) as never } });
      await audit(ctx.userId, "company.agent.status", "Company", String(i.companyId));
      return { summary: `Set company ${String(i.companyId).slice(-6)} → ${i.status}` };
    },
  },
  list_requirements: {
    name: "list_requirements",
    description: "List manpower requirements (job orders), optionally by status.",
    input_schema: { type: "object", properties: { status: { type: "string" }, limit: { type: "number" } }, additionalProperties: false },
    handler: async (i) => {
      const reqs = await prisma.requirement.findMany({ where: i.status ? { status: String(i.status) as never } : {}, take: Math.min(Number(i.limit ?? 25), 100), orderBy: { createdAt: "desc" }, select: { id: true, refCode: true, title: true, profession: true, location: true, quantity: true, status: true, company: { select: { name: true } } } });
      return { summary: `Listed ${reqs.length} requirements`, data: reqs };
    },
  },
  list_candidates: {
    name: "list_candidates",
    description: "List candidate profiles, optionally filtered by profession.",
    input_schema: { type: "object", properties: { profession: { type: "string" }, limit: { type: "number" } }, additionalProperties: false },
    handler: async (i) => {
      const cands = await prisma.candidateProfile.findMany({ where: i.profession ? { profession: { contains: String(i.profession), mode: "insensitive" } } : {}, take: Math.min(Number(i.limit ?? 25), 100), orderBy: { createdAt: "desc" }, select: { id: true, profession: true, city: true, experienceYrs: true, user: { select: { name: true, email: true } } } });
      return { summary: `Listed ${cands.length} candidates`, data: cands };
    },
  },
  send_email: {
    name: "send_email",
    description: "Send an email via the platform's email provider (Resend). Use for outreach to leads, notifications, or follow-ups. Provide clean HTML in the body.",
    input_schema: { type: "object", properties: { to: { type: "string" }, subject: { type: "string" }, html: { type: "string", description: "HTML email body" } }, required: ["to", "subject", "html"], additionalProperties: false },
    handler: async (i, ctx) => {
      const res = await sendEmail(String(i.to), String(i.subject), String(i.html));
      await audit(ctx.userId, "email.agent.send", "Email", String(i.to));
      return { summary: `${res.stub ? "Queued (stub — add RESEND_API_KEY to send live)" : "Sent"} email to ${i.to}: “${i.subject}”`, data: res };
    },
  },
};

// Which tools each agent persona may use.
const PERSONAS: Record<string, { label: string; system: string; tools: string[]; webSearch: boolean }> = {
  ops: {
    label: "Operations Agent",
    system: "You are ForcePK's Operations Agent for the platform owner. You can read and modify the platform: companies, leads, requirements, candidates, and send email. When asked to do something, use the tools to actually do it, then confirm what you did in 1-3 sentences. Be careful with destructive actions (deletes, status changes) — do exactly what is asked, nothing more. For analytics questions, call platform_stats or the list tools and answer from real data.",
    tools: ["platform_stats", "list_leads", "create_lead", "update_lead", "delete_lead", "list_companies", "create_company", "set_company_status", "list_requirements", "list_candidates", "send_email"],
    webSearch: false,
  },
  leadgen: {
    label: "Lead Generation Agent",
    system: "You are ForcePK's Lead Generation Agent. ForcePK supplies verified overseas manpower to employers worldwide. Given a brief (industry, region, role type, count), use web_search to find PUBLICLY LISTED businesses that hire workers and would plausibly need manpower (construction firms, facilities, logistics, hospitality, staffing agencies, etc.). For each real company you find, call create_lead with its name, any public business email/phone/website you found, source set to 'Web search', and notes summarising why they're a fit and where you found them. Only save genuine, real organisations from public sources — never invent contacts. Aim for the number requested. When done, summarise how many leads you added and who they are. Do not attempt to access anything behind a login.",
    tools: ["create_lead", "list_leads", "platform_stats"],
    webSearch: true,
  },
  outreach: {
    label: "Outreach Agent",
    system: "You are ForcePK's Outreach Agent. You draft and send professional B2B outreach emails to leads. Use list_leads to find who to contact (respect any stage/filter the user gives), write a concise, friendly, professional email introducing ForcePK's verified-manpower service, and send it with send_email. After sending, you may update the lead's stage to CONTACTED with update_lead. Summarise who you contacted.",
    tools: ["list_leads", "update_lead", "send_email", "platform_stats"],
    webSearch: true,
  },
};

export const AGENT_PERSONAS = Object.entries(PERSONAS).map(([key, p]) => ({ key, label: p.label }));

function toolResultText(data: unknown, summary: string) {
  if (data === undefined) return summary;
  const json = JSON.stringify(data);
  return `${summary}\n${json.length > 6000 ? json.slice(0, 6000) + "…(truncated)" : json}`;
}

// ── Agentic loop ──────────────────────────────────────────────────
export async function runAgent(personaKey: string, command: string, ctx: { userId?: string } = {}): Promise<AgentResult> {
  const persona = PERSONAS[personaKey] ?? PERSONAS.ops;
  const key = process.env.ANTHROPIC_API_KEY;
  const steps: AgentStep[] = [];

  if (!key) {
    return { ok: false, ai: false, answer: "AI is not connected yet. Add ANTHROPIC_API_KEY in the server environment to activate the agents — then I can run commands, do CRUD, send email, and generate leads from public sources.", steps };
  }

  const tools: Record<string, unknown>[] = persona.tools.map((t) => {
    const d = TOOLS[t];
    return { name: d.name, description: d.description, input_schema: d.input_schema };
  });
  if (persona.webSearch) tools.push({ type: "web_search_20250305", name: "web_search", max_uses: 8 });

  const messages: { role: string; content: unknown }[] = [{ role: "user", content: command }];

  try {
    for (let turn = 0; turn < 12; turn++) {
      const res = await fetch(API, {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: MODEL, max_tokens: 4096, system: persona.system, messages, tools }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { ok: false, ai: true, answer: `The AI request failed (HTTP ${res.status}). ${body.slice(0, 200)}`, steps, error: `HTTP ${res.status}` };
      }
      const data = await res.json();
      const content: { type: string; [k: string]: unknown }[] = data.content ?? [];
      messages.push({ role: "assistant", content });

      // Record search + text blocks for the activity feed.
      for (const b of content) {
        if (b.type === "server_tool_use" && (b as { name?: string }).name === "web_search") {
          steps.push({ kind: "search", query: String((b.input as { query?: string })?.query ?? "") });
        }
        if (b.type === "text" && String(b.text).trim()) steps.push({ kind: "text", text: String(b.text) });
      }

      const toolUses = content.filter((b) => b.type === "tool_use");
      const stop = data.stop_reason;

      if (stop === "tool_use" && toolUses.length) {
        const results: unknown[] = [];
        for (const tu of toolUses) {
          const def = TOOLS[String(tu.name)];
          const input = (tu.input as Record<string, unknown>) ?? {};
          if (!def) {
            results.push({ type: "tool_result", tool_use_id: tu.id, content: "Unknown tool", is_error: true });
            continue;
          }
          try {
            const out = await def.handler(input, ctx);
            steps.push({ kind: "tool", name: def.name, input, summary: out.summary, ok: true });
            results.push({ type: "tool_result", tool_use_id: tu.id, content: toolResultText(out.data, out.summary) });
          } catch (e) {
            steps.push({ kind: "tool", name: def.name, input, summary: `Failed: ${String(e).slice(0, 120)}`, ok: false });
            results.push({ type: "tool_result", tool_use_id: tu.id, content: `Error: ${String(e).slice(0, 200)}`, is_error: true });
          }
        }
        messages.push({ role: "user", content: results });
        continue;
      }

      if (stop === "pause_turn") continue; // server tool in progress — resend to resume

      // Done — collect the final text.
      const answer = content.filter((b) => b.type === "text").map((b) => String(b.text)).join("\n").trim();
      return { ok: true, ai: true, answer: answer || "Done.", steps };
    }
    return { ok: true, ai: true, answer: "Reached the step limit. Here's what I completed so far — run the command again to continue.", steps };
  } catch (e) {
    return { ok: false, ai: true, answer: `The agent hit an error: ${String(e).slice(0, 200)}`, steps, error: String(e) };
  }
}
