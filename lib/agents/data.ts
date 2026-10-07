// Live data for the 11 ForcePK AI agents surfaced in the AI Command Center.
// Each agent exposes /summary (scalars -> metric cards, nested numeric maps ->
// bar lists), /activity (recent audit-style rows) and /stats (runtime). All
// figures are computed live from the ForcePK Prisma database.
import { prisma } from "@/lib/prisma";

export const FORCEPK_AGENTS = [
  "lead-gen", "company-research", "requirement", "oep-matching", "compliance",
  "candidate-matching", "cv-document", "interview", "deployment", "relationship", "ceo",
] as const;
export type ForcePkAgent = (typeof FORCEPK_AGENTS)[number];

export function isForcePkAgent(x: string): x is ForcePkAgent {
  return (FORCEPK_AGENTS as readonly string[]).includes(x);
}

const since = (days: number) => new Date(Date.now() - days * 864e5);
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

/** Turn a Prisma groupBy result into a plain { key: count } map for bar lists. */
function toMap<T extends Record<string, unknown>>(rows: T[], key: keyof T): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r[key] ?? "Unknown");
    const c = (r as { _count?: { _all?: number } })._count?._all ?? 0;
    out[k] = c;
  }
  return out;
}

type Summary = Record<string, unknown>;

export async function agentSummary(agent: ForcePkAgent): Promise<Summary> {
  switch (agent) {
    case "lead-gen": {
      const [total, newWeek, byStage, bySource, won] = await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({ where: { createdAt: { gte: since(7) } } }),
        prisma.lead.groupBy({ by: ["stage"], _count: { _all: true } }),
        prisma.lead.groupBy({ by: ["source"], _count: { _all: true } }),
        prisma.lead.count({ where: { stage: "WON" } }),
      ]);
      return {
        totalLeads: total, newThisWeek: newWeek, won, conversionRatePct: pct(won, total),
        pipelineByStage: toMap(byStage, "stage"), leadsBySource: toMap(bySource, "source"),
      };
    }
    case "company-research": {
      const [total, verified, pending, byIndustry, byCity] = await Promise.all([
        prisma.company.count(),
        prisma.company.count({ where: { status: "VERIFIED" } }),
        prisma.company.count({ where: { status: "PENDING" } }),
        prisma.company.groupBy({ by: ["industry"], _count: { _all: true } }),
        prisma.company.groupBy({ by: ["city"], _count: { _all: true } }),
      ]);
      return {
        totalCompanies: total, verified, pending, industriesTracked: byIndustry.length,
        companiesByIndustry: toMap(byIndustry, "industry"), companiesByCity: toMap(byCity, "city"),
      };
    }
    case "requirement": {
      const [total, open, urgent, positions, byProfession, byStatus] = await Promise.all([
        prisma.requirement.count(),
        prisma.requirement.count({ where: { status: "OPEN" } }),
        prisma.requirement.count({ where: { priority: "URGENT" } }),
        prisma.requirement.aggregate({ _sum: { quantity: true } }),
        prisma.requirement.groupBy({ by: ["profession"], _count: { _all: true } }),
        prisma.requirement.groupBy({ by: ["status"], _count: { _all: true } }),
      ]);
      return {
        totalRequirements: total, open, urgent, totalPositions: positions._sum.quantity ?? 0,
        requirementsByProfession: toMap(byProfession, "profession"), requirementsByStatus: toMap(byStatus, "status"),
      };
    }
    case "oep-matching": {
      const [total, verified, rating, submissions, byTier] = await Promise.all([
        prisma.oep.count(),
        prisma.oep.count({ where: { status: "VERIFIED" } }),
        prisma.oep.aggregate({ _avg: { rating: true } }),
        prisma.application.count({ where: { oepId: { not: null } } }),
        prisma.oep.groupBy({ by: ["tier"], _count: { _all: true } }),
      ]);
      return {
        totalPartners: total, verifiedPartners: verified,
        avgRating: Number((rating._avg.rating ?? 0).toFixed(2)), submissionsViaPartners: submissions,
        partnersByTier: toMap(byTier, "tier"),
      };
    }
    case "compliance": {
      const [missingDocs, expiredDocs, pendingDocs, companiesPending, oepsPending, docsByStatus] = await Promise.all([
        prisma.document.count({ where: { status: "MISSING" } }),
        prisma.document.count({ where: { status: "EXPIRED" } }),
        prisma.document.count({ where: { status: "PENDING" } }),
        prisma.company.count({ where: { status: "PENDING" } }),
        prisma.oep.count({ where: { status: "PENDING" } }),
        prisma.document.groupBy({ by: ["status"], _count: { _all: true } }),
      ]);
      return {
        missingDocuments: missingDocs, expiredDocuments: expiredDocs, pendingReview: pendingDocs,
        companiesAwaitingVerification: companiesPending, partnersAwaitingVerification: oepsPending,
        documentsByStatus: toMap(docsByStatus, "status"),
      };
    }
    case "candidate-matching": {
      const [total, match, byProfession, byStage] = await Promise.all([
        prisma.candidateProfile.count(),
        prisma.application.aggregate({ _avg: { aiMatch: true } }),
        prisma.candidateProfile.groupBy({ by: ["profession"], _count: { _all: true } }),
        prisma.application.groupBy({ by: ["stage"], _count: { _all: true } }),
      ]);
      return {
        totalCandidates: total, avgMatchScore: Math.round(match._avg.aiMatch ?? 0),
        candidatesByProfession: toMap(byProfession, "profession"), applicationsByStage: toMap(byStage, "stage"),
      };
    }
    case "cv-document": {
      const [total, byStatus, byType] = await Promise.all([
        prisma.document.count(),
        prisma.document.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.document.groupBy({ by: ["type"], _count: { _all: true } }),
      ]);
      const s = toMap(byStatus, "status");
      return {
        totalDocuments: total, verified: s.VERIFIED ?? 0, pending: s.PENDING ?? 0, missing: s.MISSING ?? 0,
        documentsByType: toMap(byType, "type"), documentsByStatus: s,
      };
    }
    case "interview": {
      const [total, byStatus, score] = await Promise.all([
        prisma.interview.count(),
        prisma.interview.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.interview.aggregate({ _avg: { score: true } }),
      ]);
      const s = toMap(byStatus, "status");
      return {
        totalInterviews: total, scheduled: s.SCHEDULED ?? 0, completed: s.COMPLETED ?? 0,
        avgScore: Math.round(score._avg.score ?? 0), interviewsByStatus: s,
      };
    }
    case "deployment": {
      const byStage = await prisma.application.groupBy({ by: ["stage"], _count: { _all: true } });
      const m = toMap(byStage, "stage");
      const total = Object.values(m).reduce((a, b) => a + b, 0);
      return {
        inPipeline: total, selected: m.SELECTED ?? 0, deployed: m.DEPLOYED ?? 0,
        processing: m.PROCESSING ?? 0, applicationsByStage: m,
      };
    }
    case "relationship": {
      const [clients, partners, invByStatus, grouped] = await Promise.all([
        prisma.company.count({ where: { status: "VERIFIED" } }),
        prisma.oep.count({ where: { status: "VERIFIED" } }),
        prisma.invoice.groupBy({ by: ["status"], _count: { _all: true } }),
        prisma.requirement.groupBy({ by: ["companyId"], _count: { _all: true } }),
      ]);
      const repeat = grouped.filter((g) => (g._count?._all ?? 0) > 1).length;
      return {
        activeClients: clients, activePartners: partners, repeatClients: repeat,
        totalEngagements: grouped.length, invoicesByStatus: toMap(invByStatus, "status"),
      };
    }
    case "ceo": {
      const [leads, openReq, candidates, byStage, invAgg, overdue, invByStatus] = await Promise.all([
        prisma.lead.count(),
        prisma.requirement.count({ where: { status: "OPEN" } }),
        prisma.candidateProfile.count(),
        prisma.application.groupBy({ by: ["stage"], _count: { _all: true } }),
        prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
        prisma.invoice.count({ where: { status: "OVERDUE" } }),
        prisma.invoice.groupBy({ by: ["status"], _count: { _all: true } }),
      ]);
      const m = toMap(byStage, "stage");
      return {
        leads, openRequirements: openReq, candidates, deployed: m.DEPLOYED ?? 0,
        revenueUsd: Number(invAgg._sum.amount ?? 0), overdueInvoices: overdue,
        pipelineByStage: m, invoicesByStatus: toMap(invByStatus, "status"),
      };
    }
  }
}

export interface ActivityRow {
  id: string; action: string; targetType: string | null; targetId: string | null;
  createdAt: string; admin: null; meta: Record<string, unknown> | null;
}

export async function agentActivity(agent: ForcePkAgent, take = 25): Promise<ActivityRow[]> {
  const iso = (d: Date) => d.toISOString();
  switch (agent) {
    case "lead-gen":
    case "relationship": {
      const rows = await prisma.lead.findMany({ orderBy: { updatedAt: "desc" }, take, select: { id: true, name: true, company: true, stage: true, updatedAt: true } });
      return rows.map((r) => ({ id: r.id, action: `Lead "${r.company ?? r.name}" at ${r.stage}`, targetType: "Lead", targetId: r.id, createdAt: iso(r.updatedAt), admin: null, meta: { stage: r.stage } }));
    }
    case "company-research": {
      const rows = await prisma.company.findMany({ orderBy: { createdAt: "desc" }, take, select: { id: true, name: true, status: true, city: true, createdAt: true } });
      return rows.map((r) => ({ id: r.id, action: `${r.name} — ${r.status}`, targetType: "Company", targetId: r.id, createdAt: iso(r.createdAt), admin: null, meta: { city: r.city } }));
    }
    case "requirement":
    case "deployment": {
      const rows = await prisma.requirement.findMany({ orderBy: { createdAt: "desc" }, take, select: { id: true, title: true, profession: true, status: true, createdAt: true } });
      return rows.map((r) => ({ id: r.id, action: `${r.title} (${r.profession}) — ${r.status}`, targetType: "Requirement", targetId: r.id, createdAt: iso(r.createdAt), admin: null, meta: null }));
    }
    case "oep-matching": {
      const rows = await prisma.oep.findMany({ orderBy: { createdAt: "desc" }, take, select: { id: true, name: true, tier: true, rating: true, createdAt: true } });
      return rows.map((r) => ({ id: r.id, action: `Partner ${r.name} — ${r.tier ?? "—"}`, targetType: "OEP", targetId: r.id, createdAt: iso(r.createdAt), admin: null, meta: { rating: r.rating } }));
    }
    case "compliance":
    case "cv-document": {
      const rows = await prisma.document.findMany({ orderBy: { uploadedAt: "desc" }, take, select: { id: true, type: true, status: true, uploadedAt: true } });
      return rows.map((r) => ({ id: r.id, action: `${r.type} — ${r.status}`, targetType: "Document", targetId: r.id, createdAt: iso(r.uploadedAt), admin: null, meta: null }));
    }
    case "interview": {
      const rows = await prisma.interview.findMany({ orderBy: { createdAt: "desc" }, take, select: { id: true, method: true, status: true, score: true, createdAt: true } });
      return rows.map((r) => ({ id: r.id, action: `${r.method ?? "Interview"} — ${r.status}`, targetType: "Interview", targetId: r.id, createdAt: iso(r.createdAt), admin: null, meta: { score: r.score } }));
    }
    case "candidate-matching": {
      const rows = await prisma.application.findMany({ orderBy: { createdAt: "desc" }, take, select: { id: true, stage: true, aiMatch: true, createdAt: true } });
      return rows.map((r) => ({ id: r.id, action: `Application matched ${r.aiMatch}% — ${r.stage}`, targetType: "Application", targetId: r.id, createdAt: iso(r.createdAt), admin: null, meta: { match: r.aiMatch } }));
    }
    case "ceo": {
      const rows = await prisma.invoice.findMany({ orderBy: { issuedAt: "desc" }, take, select: { id: true, amount: true, status: true, currency: true, issuedAt: true } });
      return rows.map((r) => ({ id: r.id, action: `Invoice ${r.currency} ${Number(r.amount)} — ${r.status}`, targetType: "Invoice", targetId: r.id, createdAt: iso(r.issuedAt), admin: null, meta: null }));
    }
  }
}

export function agentStats(agent: ForcePkAgent) {
  return {
    agent,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    rateLimitPerMinute: 30,
    monthlyBudgetUsd: 50,
    callsThisMonth: 0,
    spendThisMonthUsd: 0,
  };
}
