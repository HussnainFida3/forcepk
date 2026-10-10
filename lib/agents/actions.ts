// The "hands" of the ForcePK AI agents. Each agent owns a set of tools
// (OpenAI function schemas + handlers) that perform REAL create/read/update/
// delete work on its niche in the ForcePK database. The chat endpoint gives an
// agent its tools and lets the model call them; the CEO agent additionally owns
// cross-agent delegation and the task scheduler.
import { prisma } from "@/lib/prisma";
import { collectLeadsBatch } from "@/lib/agents/leadsource";
import { scanCompany, discoverHiringBatch } from "@/lib/agents/careerscan";
import type { ForcePkAgent } from "@/lib/agents/data";

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  run: (args: Record<string, unknown>) => Promise<unknown>;
}

const S = (v: unknown) => (typeof v === "string" ? v : v == null ? undefined : String(v));
const N = (v: unknown) => (typeof v === "number" ? v : v == null || v === "" ? undefined : Number(v));
const obj = (props: Record<string, unknown>, required: string[] = []) => ({ type: "object", properties: props, required });
const str = (description: string) => ({ type: "string", description });
const int = (description: string) => ({ type: "integer", description });

async function logAction(agent: string, action: string, detail: string, ok = true) {
  try { await prisma.agentActionLog.create({ data: { agent, action, detail, ok } }); } catch { /* non-fatal */ }
}

/* ───────────────────────── Lead Gen ───────────────────────── */

function leadWhere(a: Record<string, unknown>) {
  const where: Record<string, unknown> = {};
  const and: unknown[] = [];
  if (S(a.stage)) where.stage = S(a.stage)!.toUpperCase();
  if (S(a.source)) where.source = { contains: S(a.source), mode: "insensitive" };
  if (S(a.company_contains)) and.push({ company: { contains: S(a.company_contains), mode: "insensitive" } });
  if (S(a.text_contains)) {
    const t = S(a.text_contains)!;
    and.push({ OR: [{ company: { contains: t, mode: "insensitive" } }, { notes: { contains: t, mode: "insensitive" } }, { name: { contains: t, mode: "insensitive" } }] });
  }
  if (and.length) where.AND = and;
  return where;
}

const leadGenTools: Tool[] = [
  {
    name: "list_leads", description: "List sales leads, optionally filtered by stage, source, company name or free text.",
    parameters: obj({ stage: str("NEW|CONTACTED|MEETING|PROPOSAL|AGREEMENT|WON|LOST"), source: str("source filter"), company_contains: str("company name contains"), text_contains: str("match company/name/notes"), limit: int("max rows, default 20") }),
    run: async (a) => {
      const rows = await prisma.lead.findMany({ where: leadWhere(a), take: Math.min(N(a.limit) ?? 20, 100), orderBy: { updatedAt: "desc" }, select: { id: true, name: true, company: true, email: true, phone: true, stage: true, source: true } });
      return { count: rows.length, leads: rows };
    },
  },
  {
    name: "count_leads", description: "Count leads matching an optional filter.",
    parameters: obj({ stage: str("stage"), source: str("source"), company_contains: str("company contains"), text_contains: str("free text") }),
    run: async (a) => ({ count: await prisma.lead.count({ where: leadWhere(a) }) }),
  },
  {
    name: "create_lead", description: "Create a new sales lead.",
    parameters: obj({ company: str("company name"), name: str("contact person"), email: str("email"), phone: str("phone"), source: str("source"), stage: str("stage"), notes: str("notes") }, ["company"]),
    run: async (a) => {
      const lead = await prisma.lead.create({ data: { company: S(a.company)!, name: S(a.name) ?? S(a.company)!, email: S(a.email), phone: S(a.phone), source: S(a.source) ?? "Lead Gen Agent", stage: (S(a.stage)?.toUpperCase() as never) ?? "NEW", notes: S(a.notes) } });
      await logAction("lead-gen", "create_lead", `${lead.company}`);
      return { created: lead.id, company: lead.company };
    },
  },
  {
    name: "update_lead", description: "Update a lead's fields (stage, contact, notes).",
    parameters: obj({ id: str("lead id"), stage: str("stage"), email: str("email"), phone: str("phone"), notes: str("notes"), company: str("company") }, ["id"]),
    run: async (a) => {
      const data: Record<string, unknown> = {};
      for (const f of ["email", "phone", "notes", "company"]) if (S(a[f]) !== undefined) data[f] = S(a[f]);
      if (S(a.stage)) data.stage = S(a.stage)!.toUpperCase();
      const lead = await prisma.lead.update({ where: { id: S(a.id)! }, data });
      await logAction("lead-gen", "update_lead", `${lead.company}`);
      return { updated: lead.id };
    },
  },
  {
    name: "delete_lead", description: "Delete a single lead by id.",
    parameters: obj({ id: str("lead id") }, ["id"]),
    run: async (a) => { const l = await prisma.lead.delete({ where: { id: S(a.id)! } }); await logAction("lead-gen", "delete_lead", l.company ?? l.id); return { deleted: l.id }; },
  },
  {
    name: "bulk_delete_leads", description: "Delete ALL leads matching a filter, e.g. all 'Qatar' or 'construction' leads. Requires at least one filter.",
    parameters: obj({ stage: str("stage"), source: str("source"), company_contains: str("company contains"), text_contains: str("free text, e.g. 'Qatar' or 'construction'") }),
    run: async (a) => {
      const where = leadWhere(a);
      if (!Object.keys(where).length) return { error: "Refusing to delete all leads without a filter." };
      const res = await prisma.lead.deleteMany({ where });
      await logAction("lead-gen", "bulk_delete_leads", `${res.count} leads · ${JSON.stringify(a)}`);
      return { deleted: res.count };
    },
  },
  {
    name: "collect_leads", description: "Collect NEW company leads for a country or city (real businesses from OpenStreetMap). Use schedule_task for large 'until N' collection; this does one batch now.",
    parameters: obj({ region: str("country or city, e.g. 'Saudi Arabia', 'Qatar', 'Dubai'"), limit: int("how many to collect this batch, default 25, max 100") }),
    run: async (a) => {
      const r = await collectLeadsBatch({ region: S(a.region), limit: N(a.limit) });
      await logAction("lead-gen", "collect_leads", `+${r.inserted} (${r.fromOsm} OSM/${r.generated} gen) ${r.region}`);
      return r;
    },
  },
];

/* ───────────────────────── Companies ───────────────────────── */

const companyTools: Tool[] = [
  {
    name: "list_companies", description: "List employer companies, optional filters.",
    parameters: obj({ status: str("PENDING|VERIFIED|SUSPENDED|REJECTED"), industry: str("industry"), city: str("city"), name_contains: str("name contains"), limit: int("default 20") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.status)) where.status = S(a.status)!.toUpperCase();
      if (S(a.industry)) where.industry = { contains: S(a.industry), mode: "insensitive" };
      if (S(a.city)) where.city = { contains: S(a.city), mode: "insensitive" };
      if (S(a.name_contains)) where.name = { contains: S(a.name_contains), mode: "insensitive" };
      const rows = await prisma.company.findMany({ where, take: Math.min(N(a.limit) ?? 20, 100), orderBy: { createdAt: "desc" }, select: { id: true, name: true, industry: true, city: true, status: true } });
      return { count: rows.length, companies: rows };
    },
  },
  {
    name: "set_company_status", description: "Verify / suspend / reactivate / reject / set-pending a company.",
    parameters: obj({ id: str("company id"), status: str("VERIFIED|SUSPENDED|PENDING|REJECTED") }, ["id", "status"]),
    run: async (a) => { const c = await prisma.company.update({ where: { id: S(a.id)! }, data: { status: S(a.status)!.toUpperCase() as never } }); await logAction("company-research", "set_company_status", `${c.name} -> ${c.status}`); return { id: c.id, status: c.status }; },
  },
  {
    name: "update_company", description: "Update company fields (industry, city, website, contact).",
    parameters: obj({ id: str("id"), industry: str(""), city: str(""), website: str(""), contactName: str(""), phone: str("") }, ["id"]),
    run: async (a) => {
      const data: Record<string, unknown> = {};
      for (const f of ["industry", "city", "website", "contactName", "phone"]) if (S(a[f]) !== undefined) data[f] = S(a[f]);
      const c = await prisma.company.update({ where: { id: S(a.id)! }, data });
      await logAction("company-research", "update_company", c.name);
      return { updated: c.id };
    },
  },
  {
    name: "bulk_set_company_status", description: "Set status for ALL companies matching a filter (industry/city/current status).",
    parameters: obj({ status: str("new status"), industry: str("filter industry"), city: str("filter city"), current_status: str("filter current status") }, ["status"]),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.industry)) where.industry = { contains: S(a.industry), mode: "insensitive" };
      if (S(a.city)) where.city = { contains: S(a.city), mode: "insensitive" };
      if (S(a.current_status)) where.status = S(a.current_status)!.toUpperCase();
      if (!Object.keys(where).length) return { error: "Provide a filter." };
      const res = await prisma.company.updateMany({ where, data: { status: S(a.status)!.toUpperCase() as never } });
      await logAction("company-research", "bulk_set_company_status", `${res.count} -> ${S(a.status)}`);
      return { updated: res.count };
    },
  },
];

/* ───────────────────────── Requirements ───────────────────────── */

const requirementTools: Tool[] = [
  {
    name: "list_requirements", description: "List manpower requirements.",
    parameters: obj({ status: str("OPEN|..."), profession: str("profession"), priority: str("NORMAL|URGENT"), limit: int("default 20") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.status)) where.status = S(a.status)!.toUpperCase();
      if (S(a.priority)) where.priority = S(a.priority)!.toUpperCase();
      if (S(a.profession)) where.profession = { contains: S(a.profession), mode: "insensitive" };
      const rows = await prisma.requirement.findMany({ where, take: Math.min(N(a.limit) ?? 20, 100), orderBy: { createdAt: "desc" }, select: { id: true, title: true, profession: true, quantity: true, status: true, priority: true, location: true } });
      return { count: rows.length, requirements: rows };
    },
  },
  {
    name: "set_requirement_status", description: "Change a requirement's status.",
    parameters: obj({ id: str("id"), status: str("OPEN|CLOSED|FILLED|DRAFT") }, ["id", "status"]),
    run: async (a) => { const r = await prisma.requirement.update({ where: { id: S(a.id)! }, data: { status: S(a.status)!.toUpperCase() as never } }); await logAction("requirement", "set_requirement_status", `${r.title} -> ${r.status}`); return { id: r.id, status: r.status }; },
  },
  {
    name: "set_requirement_priority", description: "Mark a requirement NORMAL or URGENT.",
    parameters: obj({ id: str("id"), priority: str("NORMAL|URGENT") }, ["id", "priority"]),
    run: async (a) => { const r = await prisma.requirement.update({ where: { id: S(a.id)! }, data: { priority: S(a.priority)!.toUpperCase() as never } }); await logAction("requirement", "set_requirement_priority", `${r.title} -> ${r.priority}`); return { id: r.id, priority: r.priority }; },
  },
];

/* ───────────────────────── OEP / Partners ───────────────────────── */

// Hiring Signals agent — scans company career pages, flags who's actively
// hiring, saves the jobs, and turns active companies into CRM leads.
const hiringTools: Tool[] = [
  {
    name: "scan_company", description: "Visit one company's career page and decide if it is actively hiring; saves its open jobs and (if hiring) adds it as a CRM lead.",
    parameters: obj({ name: str("company name"), website: str("company domain or website, e.g. aramco.com"), careerUrl: str("direct careers URL if known"), country: str("country") }, ["name"]),
    run: async (a) => {
      const r = await scanCompany({ name: S(a.name)!, website: S(a.website), careerUrl: S(a.careerUrl), country: S(a.country) });
      await logAction("oep-matching", "scan_company", `${r.company} -> ${r.status} (${r.jobsFound} jobs)`);
      return r;
    },
  },
  {
    name: "discover_hiring_companies", description: "Scan the career pages of major companies in a country (e.g. 'Saudi Arabia', 'UAE', 'Qatar') and return which ones are actively hiring. Use schedule_task (kind UNTIL) for large targets.",
    parameters: obj({ country: str("country to scan"), limit: int("how many actively-hiring companies to find this batch, default 5, max 15") }),
    run: async (a) => {
      const r = await discoverHiringBatch({ country: S(a.country), limit: N(a.limit) });
      await logAction("oep-matching", "discover_hiring_companies", `${r.country}: ${r.hiring} hiring / ${r.scanned} scanned`);
      return r;
    },
  },
  {
    name: "list_hiring_companies", description: "List scanned companies and their hiring signal. Filter by status (ACTIVELY_HIRING|QUIET|UNREACHABLE) or country.",
    parameters: obj({ status: str("status filter"), country: str("country filter"), limit: int("default 25") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.status)) where.status = S(a.status)!.toUpperCase();
      if (S(a.country)) where.country = { contains: S(a.country), mode: "insensitive" };
      const rows = await prisma.hiringCompany.findMany({ where, take: Math.min(N(a.limit) ?? 25, 100), orderBy: [{ status: "asc" }, { jobsFound: "desc" }], select: { id: true, name: true, status: true, jobsFound: true, country: true, careerUrl: true } });
      return { count: rows.length, companies: rows };
    },
  },
  {
    name: "list_discovered_jobs", description: "List the open jobs discovered on scanned career pages, optionally filtered by company name.",
    parameters: obj({ company_contains: str("company name contains"), limit: int("default 25") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.company_contains)) where.company = { name: { contains: S(a.company_contains), mode: "insensitive" } };
      const rows = await prisma.discoveredJob.findMany({ where, take: Math.min(N(a.limit) ?? 25, 100), orderBy: { createdAt: "desc" }, select: { id: true, title: true, location: true, url: true, company: { select: { name: true } } } });
      return { count: rows.length, jobs: rows.map((j) => ({ id: j.id, title: j.title, location: j.location, company: j.company.name, url: j.url })) };
    },
  },
  {
    name: "delete_hiring_company", description: "Remove a scanned company (and its jobs) by id.",
    parameters: obj({ id: str("hiring company id") }, ["id"]),
    run: async (a) => { const c = await prisma.hiringCompany.delete({ where: { id: S(a.id)! } }); await logAction("oep-matching", "delete_hiring_company", c.name); return { deleted: c.id }; },
  },
];

/* ───────────────────────── Documents / Compliance ───────────────────────── */

const documentTools: Tool[] = [
  {
    name: "list_documents", description: "List candidate documents by status/type.",
    parameters: obj({ status: str("VERIFIED|PENDING|MISSING|EXPIRED"), type: str("doc type"), limit: int("default 20") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.status)) where.status = S(a.status)!.toUpperCase();
      if (S(a.type)) where.type = S(a.type)!.toUpperCase();
      const rows = await prisma.document.findMany({ where, take: Math.min(N(a.limit) ?? 20, 100), orderBy: { uploadedAt: "desc" }, select: { id: true, type: true, status: true, candidateId: true } });
      return { count: rows.length, documents: rows };
    },
  },
  {
    name: "set_document_status", description: "Verify / reject / mark-missing a document.",
    parameters: obj({ id: str("id"), status: str("VERIFIED|PENDING|MISSING|EXPIRED") }, ["id", "status"]),
    run: async (a) => { const d = await prisma.document.update({ where: { id: S(a.id)! }, data: { status: S(a.status)!.toUpperCase() as never } }); await logAction("cv-document", "set_document_status", `${d.type} -> ${d.status}`); return { id: d.id, status: d.status }; },
  },
  {
    name: "bulk_verify_documents", description: "Set status for ALL documents matching a type/current-status filter.",
    parameters: obj({ status: str("new status"), type: str("filter type"), current_status: str("filter current status") }, ["status"]),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.type)) where.type = S(a.type)!.toUpperCase();
      if (S(a.current_status)) where.status = S(a.current_status)!.toUpperCase();
      if (!Object.keys(where).length) return { error: "Provide a filter." };
      const res = await prisma.document.updateMany({ where, data: { status: S(a.status)!.toUpperCase() as never } });
      await logAction("compliance", "bulk_verify_documents", `${res.count} -> ${S(a.status)}`);
      return { updated: res.count };
    },
  },
];

/* ───────────────────────── Candidates / Applications ───────────────────────── */

const candidateTools: Tool[] = [
  {
    name: "list_candidates", description: "List candidate profiles.",
    parameters: obj({ profession: str("profession"), city: str("city"), limit: int("default 20") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.profession)) where.profession = { contains: S(a.profession), mode: "insensitive" };
      if (S(a.city)) where.city = { contains: S(a.city), mode: "insensitive" };
      const rows = await prisma.candidateProfile.findMany({ where, take: Math.min(N(a.limit) ?? 20, 100), orderBy: { profileStrength: "desc" }, select: { id: true, profession: true, city: true, experienceYrs: true, profileStrength: true } });
      return { count: rows.length, candidates: rows };
    },
  },
  {
    name: "set_application_stage", description: "Move an application/candidate through the pipeline (shortlist, interview, select, deploy, reject).",
    parameters: obj({ id: str("application id"), stage: str("SUBMITTED|SHORTLISTED|INTERVIEW|SELECTED|DEPLOYED|PROCESSING|REJECTED") }, ["id", "stage"]),
    run: async (a) => { const ap = await prisma.application.update({ where: { id: S(a.id)! }, data: { stage: S(a.stage)!.toUpperCase() as never } }); await logAction("candidate-matching", "set_application_stage", `${ap.id} -> ${ap.stage}`); return { id: ap.id, stage: ap.stage }; },
  },
];

/* ───────────────────────── Interviews ───────────────────────── */

const interviewTools: Tool[] = [
  {
    name: "list_interviews", description: "List interviews by status.",
    parameters: obj({ status: str("SCHEDULED|COMPLETED|CANCELLED|NO_SHOW"), limit: int("default 20") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.status)) where.status = S(a.status)!.toUpperCase();
      const rows = await prisma.interview.findMany({ where, take: Math.min(N(a.limit) ?? 20, 100), orderBy: { createdAt: "desc" }, select: { id: true, method: true, status: true, score: true, scheduledAt: true } });
      return { count: rows.length, interviews: rows };
    },
  },
  {
    name: "set_interview_status", description: "Update an interview's status.",
    parameters: obj({ id: str("id"), status: str("SCHEDULED|COMPLETED|CANCELLED|NO_SHOW") }, ["id", "status"]),
    run: async (a) => { const iv = await prisma.interview.update({ where: { id: S(a.id)! }, data: { status: S(a.status)!.toUpperCase() as never } }); await logAction("interview", "set_interview_status", `${iv.id} -> ${iv.status}`); return { id: iv.id, status: iv.status }; },
  },
  {
    name: "record_interview_score", description: "Record an interview score and mark it completed.",
    parameters: obj({ id: str("id"), score: int("0-100"), feedback: str("notes") }, ["id", "score"]),
    run: async (a) => { const iv = await prisma.interview.update({ where: { id: S(a.id)! }, data: { score: N(a.score), feedback: S(a.feedback), status: "COMPLETED" } }); await logAction("interview", "record_interview_score", `${iv.id} = ${iv.score}`); return { id: iv.id, score: iv.score }; },
  },
];

/* ───────────────────────── Deployment ───────────────────────── */

const deploymentTools: Tool[] = [
  {
    name: "list_pipeline", description: "List applications by stage (the deployment pipeline).",
    parameters: obj({ stage: str("stage"), limit: int("default 20") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.stage)) where.stage = S(a.stage)!.toUpperCase();
      const rows = await prisma.application.findMany({ where, take: Math.min(N(a.limit) ?? 20, 100), orderBy: { updatedAt: "desc" }, select: { id: true, stage: true, aiMatch: true } });
      return { count: rows.length, applications: rows };
    },
  },
  {
    name: "advance_application", description: "Advance an application to the next/next-named stage.",
    parameters: obj({ id: str("id"), stage: str("target stage") }, ["id", "stage"]),
    run: async (a) => { const ap = await prisma.application.update({ where: { id: S(a.id)! }, data: { stage: S(a.stage)!.toUpperCase() as never } }); await logAction("deployment", "advance_application", `${ap.id} -> ${ap.stage}`); return { id: ap.id, stage: ap.stage }; },
  },
];

/* ───────────────────────── Relationship / Finance ───────────────────────── */

const relationshipTools: Tool[] = [
  {
    name: "list_invoices", description: "List client invoices by status.",
    parameters: obj({ status: str("PAID|PENDING|OVERDUE|VOID"), limit: int("default 20") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.status)) where.status = S(a.status)!.toUpperCase();
      const rows = await prisma.invoice.findMany({ where, take: Math.min(N(a.limit) ?? 20, 100), orderBy: { issuedAt: "desc" }, select: { id: true, amount: true, currency: true, status: true, companyId: true } });
      return { count: rows.length, invoices: rows.map((r) => ({ ...r, amount: Number(r.amount) })) };
    },
  },
  {
    name: "set_invoice_status", description: "Mark an invoice PAID / PENDING / OVERDUE / VOID.",
    parameters: obj({ id: str("id"), status: str("PAID|PENDING|OVERDUE|VOID") }, ["id", "status"]),
    run: async (a) => { const inv = await prisma.invoice.update({ where: { id: S(a.id)! }, data: { status: S(a.status)!.toUpperCase() } }); await logAction("relationship", "set_invoice_status", `${inv.id} -> ${inv.status}`); return { id: inv.id, status: inv.status }; },
  },
  {
    name: "create_invoice", description: "Create a client invoice for a company.",
    parameters: obj({ companyId: str("company id"), amount: int("amount"), currency: str("default USD") }, ["companyId", "amount"]),
    run: async (a) => { const inv = await prisma.invoice.create({ data: { companyId: S(a.companyId)!, amount: (N(a.amount) ?? 0).toFixed(2), currency: S(a.currency) ?? "USD", status: "PENDING" } }); await logAction("relationship", "create_invoice", `${inv.currency} ${inv.amount}`); return { created: inv.id }; },
  },
];

/* ───────────────────────── Per-agent tool registry ───────────────────────── */

const BY_AGENT: Record<Exclude<ForcePkAgent, "ceo">, Tool[]> = {
  "lead-gen": leadGenTools,
  "company-research": companyTools,
  requirement: requirementTools,
  "oep-matching": hiringTools,
  compliance: documentTools,
  "candidate-matching": candidateTools,
  "cv-document": documentTools,
  interview: interviewTools,
  deployment: deploymentTools,
  relationship: relationshipTools,
};

/* ───────────────────────── CEO: delegation + scheduler ───────────────────────── */

export const SUBORDINATES = Object.keys(BY_AGENT) as Exclude<ForcePkAgent, "ceo">[];

const ceoTools: Tool[] = [
  // The CEO can run any subordinate agent's tools directly.
  ...SUBORDINATES.flatMap((agent) => BY_AGENT[agent]),
  {
    name: "schedule_task",
    description: "Schedule work for a subordinate agent. kind ONCE runs now; UNTIL repeats until targetCount is met (e.g. collect leads until 500); RECURRING repeats every intervalSec. The command is a natural-language instruction the agent will execute.",
    parameters: obj({
      agent: str("subordinate agent key: lead-gen, company-research, requirement, oep-matching, compliance, candidate-matching, cv-document, interview, deployment, relationship"),
      command: str("what the agent should do, e.g. 'collect leads of Saudi companies with contact info'"),
      kind: str("ONCE | UNTIL | RECURRING"),
      targetCount: int("for UNTIL: the goal count, e.g. 500"),
      intervalSec: int("for RECURRING: seconds between runs"),
    }, ["agent", "command"]),
    run: async (a) => {
      const kind = (S(a.kind)?.toUpperCase() as "ONCE" | "UNTIL" | "RECURRING") ?? "ONCE";
      const task = await prisma.agentTask.create({
        data: {
          agent: S(a.agent)!, command: S(a.command)!, kind,
          targetCount: N(a.targetCount) ?? null, intervalSec: N(a.intervalSec) ?? null,
          status: "PENDING", nextRunAt: new Date(),
        },
      });
      await logAction("ceo", "schedule_task", `${task.agent}: ${task.command} [${task.kind}]`);
      return { scheduled: task.id, agent: task.agent, kind: task.kind, targetCount: task.targetCount };
    },
  },
  {
    name: "list_tasks", description: "List scheduled agent tasks and their progress.",
    parameters: obj({ status: str("PENDING|RUNNING|DONE|FAILED|CANCELLED") }),
    run: async (a) => {
      const where: Record<string, unknown> = {};
      if (S(a.status)) where.status = S(a.status)!.toUpperCase();
      const rows = await prisma.agentTask.findMany({ where, orderBy: { createdAt: "desc" }, take: 30 });
      return { count: rows.length, tasks: rows.map((t) => ({ id: t.id, agent: t.agent, command: t.command, kind: t.kind, status: t.status, progress: t.progress, targetCount: t.targetCount, result: t.result })) };
    },
  },
  {
    name: "cancel_task", description: "Cancel a scheduled task by id.",
    parameters: obj({ id: str("task id") }, ["id"]),
    run: async (a) => { await prisma.agentTask.update({ where: { id: S(a.id)! }, data: { status: "CANCELLED" } }); await logAction("ceo", "cancel_task", S(a.id)!); return { cancelled: S(a.id) }; },
  },
];

export function toolsForAgent(agent: ForcePkAgent): Tool[] {
  if (agent === "ceo") return ceoTools;
  return BY_AGENT[agent] ?? [];
}

/** OpenAI function-tool schema for a set of tools. */
export function openAiTools(tools: Tool[]) {
  return tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } }));
}

/** Execute one tool by name with args; never throws. */
export async function runTool(tools: Tool[], name: string, args: Record<string, unknown>): Promise<unknown> {
  const tool = tools.find((t) => t.name === name);
  if (!tool) return { error: `Unknown tool: ${name}` };
  try {
    return await tool.run(args || {});
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Tool failed." };
  }
}
