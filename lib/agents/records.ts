import { prisma } from "@/lib/prisma";

// Real record lists behind each agent's dashboard numbers — so clicking a count
// opens the actual rows (candidates, companies, requirements…), searchable,
// sortable and paginated. Nothing fabricated. Keyed by ForcePK agent.

export interface Column { key: string; label: string; sortable?: boolean }
export interface RecordsResult {
  title: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : d ?? null);

export async function agentRecords(agent: string, sp: URLSearchParams): Promise<RecordsResult | null> {
  const page = Math.max(parseInt(sp.get("page") ?? "1", 10) || 1, 1);
  const pageSize = Math.min(Math.max(parseInt(sp.get("pageSize") ?? "25", 10) || 25, 1), 100);
  const q = (sp.get("q") ?? "").trim();
  const sortDir = sp.get("sortDir") === "asc" ? "asc" : "desc";
  const skip = (page - 1) * pageSize;
  const ci = { contains: q, mode: "insensitive" as const };
  // Only allow sorting by a known scalar field; otherwise fall back to a default.
  const sortBy = (allowed: string[], def: string) => ({ [allowed.includes(sp.get("sortBy") ?? "") ? (sp.get("sortBy") as string) : def]: sortDir });
  const pack = (title: string, columns: Column[], rows: Record<string, unknown>[], total: number): RecordsResult =>
    ({ title, columns, rows, total, page, pageSize, totalPages: Math.max(Math.ceil(total / pageSize), 1) });

  switch (agent) {
    case "company-research": {
      const lower = q.toLowerCase().trim();
      const isRoutingKw = lower.includes("total") || lower.includes("compan") || lower.includes("verified") || lower.includes("prospect") || lower.includes("contacted");
      const statusKws: Record<string, string> = { verified: "VERIFIED", prospect: "PROSPECT", contacted: "CONTACTED", pending: "PENDING" };
      const statusMatch = Object.entries(statusKws).find(([k]) => lower.includes(k));
      const where = isRoutingKw
        ? (statusMatch ? { status: statusMatch[1] as never } : {})
        : q ? { OR: [{ name: ci }, { city: ci }, { industry: ci }, { contactName: ci }] } : {};
      const [total, rows] = await Promise.all([
        prisma.company.count({ where }),
        prisma.company.findMany({ where, orderBy: sortBy(["name", "city", "industry", "status", "createdAt"], "createdAt"), skip, take: pageSize,
          select: { id: true, name: true, industry: true, city: true, status: true, contactName: true, phone: true, email: true, createdAt: true } }),
      ]);
      return pack("Companies", [
        { key: "name", label: "Company", sortable: true }, { key: "industry", label: "Industry", sortable: true },
        { key: "city", label: "City", sortable: true }, { key: "status", label: "Status", sortable: true },
        { key: "contactName", label: "Contact" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" },
      ], rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) })), total);
    }

    case "candidate-matching": {
      // Routing keywords ("Total Candidates", "Candidates By Profession", profession names) → show all or filter by profession
      const lower = q.toLowerCase().trim();
      const isRoutingKw = lower.includes("total") || lower.includes("candidate") || lower.includes("avg") || lower.includes("match") || lower.includes("score");
      const where = (q && !isRoutingKw) ? { OR: [{ profession: ci }, { city: ci }, { user: { name: ci } }] } : {};
      const [total, rows] = await Promise.all([
        prisma.candidateProfile.count({ where }),
        prisma.candidateProfile.findMany({ where, orderBy: sortBy(["profession", "city", "experienceYrs"], "experienceYrs"), skip, take: pageSize,
          select: { id: true, profession: true, city: true, experienceYrs: true, user: { select: { name: true } } } }),
      ]);
      return pack("Candidates", [
        { key: "candidateId", label: "Candidate ID" }, { key: "name", label: "Name" },
        { key: "profession", label: "Profession", sortable: true },
        { key: "city", label: "City", sortable: true }, { key: "experienceYrs", label: "Experience (yrs)", sortable: true },
      ], rows.map((r) => ({ id: r.id, candidateId: r.id, name: r.user?.name ?? "—", profession: r.profession, city: r.city, experienceYrs: r.experienceYrs })), total);
    }

    case "cv-document": {
      // Bar-list clicks send the label as-is (e.g. "EDUCATION CERT" with a space).
      // Enum values use underscores (EDUCATION_CERT). Normalise before matching.
      const normalised = q.toUpperCase().trim().replace(/\s+/g, "_");
      const lower = q.toLowerCase().trim();
      // Routing keywords → show all documents
      const isRoutingKw = lower.includes("total") || lower.includes("document") || lower.includes("verified") || lower.includes("pending") || lower.includes("missing");
      const cvStatusKws: Record<string, string> = { verified: "VERIFIED", pending: "PENDING", missing: "MISSING" };
      const cvStatusMatch = Object.entries(cvStatusKws).find(([k]) => lower.includes(k));
      const build = (where: Record<string, unknown>) => Promise.all([
        prisma.document.count({ where }),
        prisma.document.findMany({ where, orderBy: sortBy(["type", "status", "uploadedAt"], "uploadedAt"), skip, take: pageSize,
          select: { id: true, type: true, status: true, expiryDate: true, uploadedAt: true,
            candidate: { select: { id: true, user: { select: { name: true } } } } } }),
      ]);
      const tryList = isRoutingKw || !q
        ? [cvStatusMatch ? { status: cvStatusMatch[1] as never } : {}]
        : [{ status: { equals: normalised as never } }, { type: { equals: normalised as never } }, {}];
      let total = 0, rows: Awaited<ReturnType<typeof build>>[1] = [];
      for (const w of tryList) {
        try { [total, rows] = await build(w); break; } catch { /* invalid enum — try next */ }
      }
      return pack("Documents", [
        { key: "type", label: "Type", sortable: true }, { key: "status", label: "Status", sortable: true },
        { key: "candidateId", label: "Candidate ID" }, { key: "candidateName", label: "Candidate Name" },
        { key: "expiryDate", label: "Expires", sortable: true }, { key: "uploadedAt", label: "Uploaded", sortable: true },
      ], rows.map((r) => ({ ...r, expiryDate: iso(r.expiryDate), uploadedAt: iso(r.uploadedAt),
        candidateId: r.candidate?.id ?? "—", candidateName: r.candidate?.user?.name ?? "—" })), total);
    }

    case "requirement": {
      const lower = q.toLowerCase().trim();
      const isRoutingKw = lower.includes("total") || lower.includes("requirement") || lower.includes("position") || lower.includes("open") || lower.includes("progress") || lower.includes("filled") || lower.includes("cancelled") || lower.includes("urgent");
      const statusMap: Record<string, string> = { open: "OPEN", "in progress": "IN_PROGRESS", "in_progress": "IN_PROGRESS", filled: "FILLED", cancelled: "CANCELLED" };
      const statusMatch = Object.entries(statusMap).find(([k]) => lower.includes(k));
      const where = isRoutingKw
        ? (statusMatch ? { status: statusMatch[1] as never } : {})
        : q ? { OR: [{ title: ci }, { profession: ci }, { refCode: ci }] } : {};
      const [total, rows] = await Promise.all([
        prisma.requirement.count({ where }),
        prisma.requirement.findMany({ where, orderBy: sortBy(["title", "profession", "quantity", "status", "createdAt"], "createdAt"), skip, take: pageSize,
          select: { id: true, refCode: true, title: true, profession: true, quantity: true, status: true, createdAt: true } }),
      ]);
      return pack("Requirements", [
        { key: "refCode", label: "Ref" }, { key: "title", label: "Title", sortable: true }, { key: "profession", label: "Profession", sortable: true },
        { key: "quantity", label: "Qty", sortable: true }, { key: "status", label: "Status", sortable: true },
      ], rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) })), total);
    }

    case "oep-matching": {
      const lower = q.toLowerCase().trim();
      // Routing keywords like "Total Companies", "Active Companies", "Jobs Found" etc.
      const isRoutingKw = lower.includes("total") || lower.includes("compan") || lower.includes("oep") || lower.includes("job") || lower.includes("scanned") || lower.includes("hiring") || lower.includes("quiet") || lower.includes("active");
      const statusKws: Record<string, string> = { active: "ACTIVELY_HIRING", hiring: "ACTIVELY_HIRING", quiet: "QUIET", verified: "VERIFIED", pending: "PENDING", contacted: "CONTACTED", unreachable: "UNREACHABLE" };
      const statusMatch = Object.entries(statusKws).find(([k]) => lower.includes(k));
      const where = isRoutingKw
        ? (statusMatch ? { status: statusMatch[1] as never } : {})
        : q ? { OR: [{ name: ci }, { country: ci }, { status: ci }] } : {};
      const [total, rows] = await Promise.all([
        prisma.hiringCompany.count({ where }),
        prisma.hiringCompany.findMany({ where, orderBy: sortBy(["name", "country", "status", "jobsFound"], "jobsFound"), skip, take: pageSize,
          select: { id: true, name: true, country: true, status: true, jobsFound: true, website: true, signal: true } }),
      ]);
      return pack("Hiring Companies", [
        { key: "name", label: "Company", sortable: true }, { key: "country", label: "Country", sortable: true },
        { key: "status", label: "Status", sortable: true }, { key: "jobsFound", label: "Jobs", sortable: true }, { key: "signal", label: "Signal" },
      ], rows, total);
    }

    case "compliance": {
      const normalised = q.toUpperCase().trim().replace(/\s+/g, "_");
      const lower = q.toLowerCase().trim();
      const isRoutingKw = lower.includes("total") || lower.includes("document") || lower.includes("compliance") || lower.includes("missing") || lower.includes("expired") || lower.includes("pending") || lower.includes("awaiting") || lower.includes("verification");
      const build = (where: Record<string, unknown>) => Promise.all([
        prisma.document.count({ where }),
        prisma.document.findMany({ where, orderBy: sortBy(["status", "uploadedAt", "expiryDate"], "uploadedAt"), skip, take: pageSize,
          select: { id: true, type: true, status: true, expiryDate: true, uploadedAt: true,
            candidate: { select: { id: true, user: { select: { name: true } } } } } }),
      ]);
      const compStatusKws: Record<string, string> = { missing: "MISSING", expired: "EXPIRED", pending: "PENDING", verified: "VERIFIED" };
      const compStatusMatch = Object.entries(compStatusKws).find(([k]) => lower.includes(k));
      const tryList = isRoutingKw || !q
        ? [compStatusMatch ? { status: compStatusMatch[1] as never } : {}]
        : [{ status: { equals: normalised as never } }, { type: { equals: normalised as never } }, {}];
      let total = 0, rows: Awaited<ReturnType<typeof build>>[1] = [];
      for (const w of tryList) {
        try { [total, rows] = await build(w); break; } catch { /* invalid enum — fall back to unfiltered */ }
      }
      return pack("Documents", [
        { key: "candidateId", label: "Candidate ID" }, { key: "candidateName", label: "Candidate Name" },
        { key: "type", label: "Type", sortable: true }, { key: "status", label: "Status", sortable: true },
        { key: "expiryDate", label: "Expires", sortable: true }, { key: "uploadedAt", label: "Uploaded", sortable: true },
      ], rows.map((r) => ({ ...r, expiryDate: iso(r.expiryDate), uploadedAt: iso(r.uploadedAt),
        candidateId: r.candidate?.id ?? "—", candidateName: r.candidate?.user?.name ?? "—" })), total);
    }

    case "interview": {
      const normalised = q.toUpperCase().trim().replace(/\s+/g, "_");
      const lower = q.toLowerCase().trim();
      const isRoutingKw = lower.includes("total") || lower.includes("interview") || lower.includes("scheduled") || lower.includes("upcoming") || lower.includes("completed") || lower.includes("avg") || lower.includes("score");
      const intStatusKws: Record<string, string> = { scheduled: "SCHEDULED", completed: "COMPLETED", cancelled: "CANCELLED" };
      const intStatusMatch = Object.entries(intStatusKws).find(([k]) => lower.includes(k));
      const build = (where: Record<string, unknown>) => Promise.all([
        prisma.interview.count({ where }),
        prisma.interview.findMany({ where, orderBy: sortBy(["status", "scheduledAt", "score"], "scheduledAt"), skip, take: pageSize,
          select: { id: true, status: true, scheduledAt: true, method: true, score: true,
            application: { select: { candidate: { select: { id: true, user: { select: { name: true } } } } } } } }),
      ]);
      const tryList = isRoutingKw || !q ? [intStatusMatch ? { status: intStatusMatch[1] as never } : {}] : [{ status: { equals: normalised as never } }, {}];
      let total = 0, rows: Awaited<ReturnType<typeof build>>[1] = [];
      for (const w of tryList) {
        try { [total, rows] = await build(w); break; } catch { /* fall back to unfiltered */ }
      }
      return pack("Interviews", [
        { key: "candidateId", label: "Candidate ID" }, { key: "candidateName", label: "Candidate Name" },
        { key: "status", label: "Status", sortable: true },
        { key: "scheduledAt", label: "When", sortable: true }, { key: "method", label: "Method" }, { key: "score", label: "Score", sortable: true },
      ], rows.map((r) => ({ ...r, scheduledAt: iso(r.scheduledAt),
        candidateId: r.application?.candidate?.id ?? "—",
        candidateName: r.application?.candidate?.user?.name ?? "—" })), total);
    }

    case "deployment": {
      const lower = q.toLowerCase().trim();
      const isRoutingKw = lower.includes("pipeline") || lower.includes("selected") || lower.includes("deployed") || lower.includes("processing") || lower.includes("total") || lower.includes("application");
      const depStageKws: Record<string, string> = { selected: "SELECTED", deployed: "DEPLOYED", processing: "PROCESSING" };
      const depStageMatch = Object.entries(depStageKws).find(([k]) => lower.includes(k));
      const build = (where: Record<string, unknown>) => Promise.all([
        prisma.application.count({ where }),
        prisma.application.findMany({ where, orderBy: sortBy(["stage", "aiMatch"], "stage"), skip, take: pageSize,
          select: { id: true, stage: true, aiMatch: true,
            candidate: { select: { id: true, profession: true, city: true, user: { select: { name: true } } } },
            requirement: { select: { id: true, title: true, refCode: true } } } }),
      ]);
      let total = 0, rows: Awaited<ReturnType<typeof build>>[1] = [];
      const normalStage = q.toUpperCase().trim().replace(/\s+/g, "_");
      for (const w of (isRoutingKw ? [depStageMatch ? { stage: depStageMatch[1] as never } : {}] : q ? [{ stage: { equals: normalStage as never } }, {}] : [{}])) {
        try { [total, rows] = await build(w); break; } catch { /* fall back to unfiltered */ }
      }
      return pack("Deployment Pipeline", [
        { key: "candidateId", label: "Candidate ID" }, { key: "candidateName", label: "Name" },
        { key: "profession", label: "Profession", sortable: true }, { key: "city", label: "City", sortable: true },
        { key: "stage", label: "Stage", sortable: true }, { key: "aiMatch", label: "AI Match", sortable: true },
        { key: "requirementRef", label: "Req Ref" }, { key: "requirementTitle", label: "Requirement" },
      ], rows.map((r) => ({
        id: r.id,
        candidateId: r.candidate?.id ?? "—",
        candidateName: r.candidate?.user?.name ?? "—",
        profession: r.candidate?.profession ?? "—",
        city: r.candidate?.city ?? "—",
        stage: r.stage,
        aiMatch: r.aiMatch,
        requirementRef: r.requirement?.refCode ?? "—",
        requirementTitle: r.requirement?.title ?? "—",
      })), total);
    }

    case "relationship": {
      const lower = q.toLowerCase().trim();

      // "Active Clients" / "Repeat Clients" / "Engagements" → company table
      if (lower.includes("client") || lower.includes("engagement")) {
        const isRepeat = lower.includes("repeat");
        // repeat = companies that have >1 requirement; engagements = any company with a requirement
        let companyIds: string[] | undefined;
        if (isRepeat || lower.includes("engagement")) {
          const grouped = await prisma.requirement.groupBy({ by: ["companyId"], _count: { _all: true } });
          companyIds = isRepeat
            ? grouped.filter((g) => (g._count?._all ?? 0) > 1).map((g) => String(g.companyId))
            : grouped.map((g) => String(g.companyId));
        }
        const cWhere: Record<string, unknown> = lower.includes("active")
          ? { status: "VERIFIED", ...(companyIds ? { id: { in: companyIds } } : {}) }
          : companyIds ? { id: { in: companyIds } } : {};
        const [total, rows] = await Promise.all([
          prisma.company.count({ where: cWhere }),
          prisma.company.findMany({ where: cWhere, orderBy: sortBy(["name","city","status","createdAt"],"createdAt"), skip, take: pageSize,
            select: { id: true, name: true, industry: true, city: true, status: true, contactName: true, phone: true } }),
        ]);
        const label = isRepeat ? "Repeat Clients" : lower.includes("engagement") ? "Total Engagements" : "Active Clients";
        return pack(label, [
          { key: "name", label: "Company", sortable: true }, { key: "industry", label: "Industry", sortable: true },
          { key: "city", label: "City", sortable: true }, { key: "status", label: "Status", sortable: true },
          { key: "contactName", label: "Contact" }, { key: "phone", label: "Phone" },
        ], rows, total);
      }

      // Default: OEP / partners (also catches "Active Partners", "partner")
      const oepWhere: Record<string, unknown> = lower.includes("active")
        ? { status: "VERIFIED", ...(q && !lower.includes("partner") ? { OR: [{ name: ci }, { city: ci }] } : {}) }
        : q && !lower.includes("partner") ? { OR: [{ name: ci }, { city: ci }] } : {};
      const [total, rows] = await Promise.all([
        prisma.oep.count({ where: oepWhere }),
        prisma.oep.findMany({ where: oepWhere, orderBy: sortBy(["name","city","licenseExpiry"],"name"), skip, take: pageSize,
          select: { id: true, name: true, licenseNo: true, city: true, phone: true, email: true, licenseExpiry: true } }),
      ]);
      return pack("Partners & OEPs", [
        { key: "name", label: "Partner", sortable: true }, { key: "licenseNo", label: "License" },
        { key: "city", label: "City", sortable: true }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" },
        { key: "licenseExpiry", label: "License Expiry", sortable: true },
      ], rows.map((r) => ({ ...r, licenseExpiry: iso(r.licenseExpiry) })), total);
    }

    case "ceo": {
      // CEO is a cross-table executive view. Route by query keyword so clicking any
      // metric card or bar-list row opens the right underlying table.
      const LEAD_STAGES = new Set(["NEW","CONTACTED","MEETING","PROPOSAL","AGREEMENT","WON","LOST"]);
      const up = q.toUpperCase().trim();
      const lower = q.toLowerCase().trim();

      if (lower.includes("candidate")) {
        // q is a routing keyword ("Candidates") — show all; user can search after
        const [total, rows] = await Promise.all([
          prisma.candidateProfile.count(),
          prisma.candidateProfile.findMany({ orderBy: sortBy(["profession","city","experienceYrs"],"experienceYrs"), skip, take: pageSize,
            select: { id: true, profession: true, city: true, experienceYrs: true, user: { select: { name: true } } } }),
        ]);
        return pack("Candidates", [
          { key: "name", label: "Name" }, { key: "profession", label: "Profession", sortable: true },
          { key: "city", label: "City", sortable: true }, { key: "experienceYrs", label: "Exp (yrs)", sortable: true },
        ], rows.map((r) => ({ id: r.id, name: r.user?.name ?? "—", profession: r.profession, city: r.city, experienceYrs: r.experienceYrs })), total);
      }

      if (lower.includes("requirement")) {
        const isOpen = lower.includes("open");
        const rWhere: Record<string, unknown> = isOpen ? { status: "OPEN" } : {};
        const [total, rows] = await Promise.all([
          prisma.requirement.count({ where: rWhere }),
          prisma.requirement.findMany({ where: rWhere, orderBy: sortBy(["title","profession","status","createdAt"],"createdAt"), skip, take: pageSize,
            select: { id: true, refCode: true, title: true, profession: true, quantity: true, status: true, createdAt: true } }),
        ]);
        return pack(isOpen ? "Open Requirements" : "Requirements", [
          { key: "refCode", label: "Ref" }, { key: "title", label: "Title", sortable: true },
          { key: "profession", label: "Profession", sortable: true }, { key: "quantity", label: "Qty", sortable: true }, { key: "status", label: "Status", sortable: true },
        ], rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) })), total);
      }

      if (lower.includes("deploy")) {
        const dWhere: Record<string, unknown> = { stage: "DEPLOYED" };
        const [total, rows] = await Promise.all([
          prisma.application.count({ where: dWhere }),
          prisma.application.findMany({ where: dWhere, orderBy: sortBy(["aiMatch","stage"],"aiMatch"), skip, take: pageSize,
            select: { id: true, stage: true, aiMatch: true,
              candidate: { select: { id: true, profession: true, city: true, user: { select: { name: true } } } },
              requirement: { select: { id: true, title: true, refCode: true } } } }),
        ]);
        return pack("Deployed Candidates", [
          { key: "candidateId", label: "Candidate ID" }, { key: "candidateName", label: "Name" },
          { key: "profession", label: "Profession", sortable: true }, { key: "city", label: "City", sortable: true },
          { key: "aiMatch", label: "AI Match", sortable: true },
          { key: "requirementRef", label: "Req Ref" }, { key: "requirementTitle", label: "Requirement" },
        ], rows.map((r) => ({
          id: r.id,
          candidateId: r.candidate?.id ?? "—",
          candidateName: r.candidate?.user?.name ?? "—",
          profession: r.candidate?.profession ?? "—",
          city: r.candidate?.city ?? "—",
          aiMatch: r.aiMatch,
          requirementRef: r.requirement?.refCode ?? "—",
          requirementTitle: r.requirement?.title ?? "—",
        })), total);
      }

      if (lower.includes("invoice") || lower.includes("revenue") || lower.includes("overdue")) {
        const invStatus = lower.includes("overdue") ? "OVERDUE" : lower.includes("revenue") ? "PAID" : undefined;
        const iWhere: Record<string, unknown> = invStatus ? { status: invStatus } : {};
        const [total, rows] = await Promise.all([
          prisma.invoice.count({ where: iWhere }),
          prisma.invoice.findMany({ where: iWhere, orderBy: sortBy(["status","amount","issuedAt"],"issuedAt"), skip, take: pageSize,
            select: { id: true, companyId: true, amount: true, currency: true, status: true, issuedAt: true, dueAt: true } }),
        ]);
        return pack(invStatus === "OVERDUE" ? "Overdue Invoices" : invStatus === "PAID" ? "Revenue — Paid Invoices" : "Invoices", [
          { key: "companyId", label: "Company" }, { key: "amount", label: "Amount", sortable: true },
          { key: "currency", label: "Currency" }, { key: "status", label: "Status", sortable: true },
          { key: "issuedAt", label: "Issued", sortable: true }, { key: "dueAt", label: "Due", sortable: true },
        ], rows.map((r) => ({ ...r, companyId: String(r.companyId).slice(0, 8), amount: Number(r.amount), issuedAt: iso(r.issuedAt), dueAt: iso(r.dueAt) })), total);
      }

      // Stage filter (from leadsByStage bar list clicks like "New", "Agreement")
      if (LEAD_STAGES.has(up)) {
        const [total, rows] = await Promise.all([
          prisma.lead.count({ where: { stage: { equals: up as never } } }),
          prisma.lead.findMany({ where: { stage: { equals: up as never } }, orderBy: sortBy(["company","createdAt"],"createdAt"), skip, take: pageSize,
            select: { id: true, company: true, name: true, phone: true, stage: true, source: true, createdAt: true } }),
        ]);
        return pack(`Leads — ${up}`, [
          { key: "company", label: "Company", sortable: true }, { key: "name", label: "Contact" }, { key: "phone", label: "Phone" },
          { key: "stage", label: "Stage", sortable: true }, { key: "source", label: "Source" },
        ], rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) })), total);
      }

      // Source filter (from leadsBySource bar list) or general text search
      const isLeadRoutingKw = lower.includes("lead") || lower.includes("total") || lower.includes("conversion") || lower.includes("week") || lower.includes("won") || lower.includes("new this");
      const leadWhere = q && !isLeadRoutingKw ? { OR: [{ company: ci }, { name: ci }, { source: ci }] } : {};
      const [total, rows] = await Promise.all([
        prisma.lead.count({ where: leadWhere }),
        prisma.lead.findMany({ where: leadWhere, orderBy: sortBy(["company","stage","createdAt"],"createdAt"), skip, take: pageSize,
          select: { id: true, company: true, name: true, phone: true, stage: true, source: true, createdAt: true } }),
      ]);
      return pack("All Leads", [
        { key: "company", label: "Company", sortable: true }, { key: "name", label: "Contact" }, { key: "phone", label: "Phone" },
        { key: "stage", label: "Stage", sortable: true }, { key: "source", label: "Source" },
      ], rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) })), total);
    }

    case "lead-gen": {
      const LEAD_STAGES = new Set(["NEW","CONTACTED","MEETING","PROPOSAL","AGREEMENT","WON","LOST"]);
      const up = q.toUpperCase().trim();
      const lower = q.toLowerCase().trim();
      const isRoutingKw = lower.includes("total") || lower.includes("lead") || lower.includes("conversion") || lower.includes("week") || lower.includes("won");
      const stageFromKw = lower.includes("won") ? "WON" : lower.includes("new") ? "NEW" : undefined;
      const where = !q || isRoutingKw
        ? (stageFromKw ? { stage: { equals: stageFromKw as never } } : {})
        : LEAD_STAGES.has(up)
          ? { stage: { equals: up as never } }
          : { OR: [{ company: ci }, { name: ci }, { source: ci }] };
      const [total, rows] = await Promise.all([
        prisma.lead.count({ where }),
        prisma.lead.findMany({ where, orderBy: sortBy(["company","stage","createdAt"],"createdAt"), skip, take: pageSize,
          select: { id: true, company: true, name: true, phone: true, stage: true, source: true, createdAt: true } }),
      ]);
      return pack("Leads", [
        { key: "company", label: "Company", sortable: true }, { key: "name", label: "Contact" }, { key: "phone", label: "Phone" },
        { key: "stage", label: "Stage", sortable: true }, { key: "source", label: "Source" },
      ], rows.map((r) => ({ ...r, createdAt: iso(r.createdAt) })), total);
    }

    default:
      return null;
  }
}
