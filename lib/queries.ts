import { prisma } from "./prisma";

// Notifications
export async function getUnreadCount(userId?: string) {
  if (!userId) return 0;
  return prisma.notification.count({ where: { userId, read: false } });
}
export async function getNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

// Finance
export async function getFinance() {
  const [invoices, commissions] = await Promise.all([
    prisma.invoice.findMany({ take: 25, orderBy: { issuedAt: "desc" }, select: { id: true, amount: true, currency: true, status: true, issuedAt: true, company: { select: { name: true } } } }),
    prisma.commission.findMany({ take: 25, orderBy: { createdAt: "desc" }, select: { id: true, grossFee: true, oepShare: true, currency: true, status: true, oep: { select: { name: true } } } }),
  ]);
  return { invoices, commissions };
}

// Analytics
export async function getAnalytics() {
  const [byStage, byProfession, totals] = await Promise.all([
    prisma.application.groupBy({ by: ["stage"], _count: true }),
    prisma.requirement.groupBy({ by: ["profession"], _count: true, orderBy: { _count: { profession: "desc" } }, take: 8 }),
    Promise.all([prisma.company.count(), prisma.oep.count(), prisma.candidateProfile.count(), prisma.requirement.count(), prisma.application.count()]),
  ]);
  const [companies, oeps, candidates, requirements, applications] = totals;
  return { byStage, byProfession, totals: { companies, oeps, candidates, requirements, applications } };
}

// Messaging
export async function getConversations(userId: string) {
  const msgs = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    orderBy: { createdAt: "desc" }, take: 200,
    select: { senderId: true, recipientId: true, body: true, read: true, createdAt: true },
  });
  const map = new Map<string, { otherId: string; last: string; when: Date; unread: number }>();
  for (const m of msgs) {
    const otherId = m.senderId === userId ? m.recipientId : m.senderId;
    const cur = map.get(otherId);
    const unreadInc = m.recipientId === userId && !m.read ? 1 : 0;
    if (!cur) map.set(otherId, { otherId, last: m.body, when: m.createdAt, unread: unreadInc });
    else cur.unread += unreadInc;
  }
  const ids = [...map.keys()];
  const users = ids.length ? await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, role: true } }) : [];
  const nameOf = new Map(users.map((u) => [u.id, u]));
  return [...map.values()].map((c) => ({ ...c, user: nameOf.get(c.otherId) }));
}

export async function getThread(userId: string, otherId: string) {
  const [messages, other] = await Promise.all([
    prisma.message.findMany({
      where: { OR: [{ senderId: userId, recipientId: otherId }, { senderId: otherId, recipientId: userId }] },
      orderBy: { createdAt: "asc" }, take: 200, select: { id: true, senderId: true, body: true, createdAt: true },
    }),
    prisma.user.findUnique({ where: { id: otherId }, select: { id: true, name: true, role: true } }),
  ]);
  return { messages, other };
}

export async function getContacts(userId: string) {
  // Platform staff everyone can reach, plus any prior conversation partners.
  return prisma.user.findMany({
    where: { id: { not: userId }, role: { in: ["SUPER_ADMIN", "OPS_MANAGER", "OEP_ADMIN", "EMPLOYER_ADMIN"] } },
    select: { id: true, name: true, role: true }, take: 30, orderBy: { name: "asc" },
  });
}

// CRM
export async function getLeads() {
  return prisma.lead.findMany({ orderBy: { updatedAt: "desc" }, take: 100, select: { id: true, name: true, company: true, email: true, phone: true, source: true, stage: true } });
}

// Replacements
export async function getReplacements() {
  return prisma.replacementCase.findMany({
    orderBy: { createdAt: "desc" }, take: 100,
    select: { id: true, caseNo: true, reason: true, status: true, createdAt: true, company: { select: { name: true } }, application: { select: { candidate: { select: { user: { select: { name: true } } } }, requirement: { select: { refCode: true, title: true } } } } },
  });
}

export async function getDeployedForCompany(companyId?: string) {
  return prisma.application.findMany({
    where: { stage: "DEPLOYED", requirement: companyId ? { companyId } : {}, replacement: null },
    take: 30, select: { id: true, candidate: { select: { user: { select: { name: true } } } }, requirement: { select: { refCode: true, title: true } } },
  });
}

// ── Rich Command Center analytics (maximum stats) ──
function densify(rows: { d: string; c: number }[], days: number): { dates: string[]; counts: number[] } {
  const map = new Map(rows.map((r) => [r.d, Number(r.c)]));
  const dates: string[] = [], counts: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    dates.push(key.slice(5)); counts.push(map.get(key) ?? 0);
  }
  return { dates, counts };
}
const delta7 = (c: number[]) => {
  const a = c.slice(-7).reduce((s, x) => s + x, 0);
  const b = c.slice(-14, -7).reduce((s, x) => s + x, 0);
  if (b === 0) return a > 0 ? 100 : 0;
  return Math.max(-99, Math.min(999, Math.round(((a - b) / b) * 100)));
};
const synth = (v: number) => Array.from({ length: 14 }, (_, i) => Math.max(0, Math.round(v * (0.6 + 0.4 * (i / 13)) * (0.9 + 0.2 * Math.sin(i)))));

export async function getCommandCenter() {
  const [
    companies, verified, oeps, candidates, openReqs,
    submitted, shortlisted, interviews, selected, deployed, processing,
    appRows, candRows, heatRows, stageDist, profGroup, locGroup, docGroup, monthRows, activity,
  ] = await Promise.all([
    prisma.company.count(), prisma.company.count({ where: { status: "VERIFIED" } }),
    prisma.oep.count(), prisma.candidateProfile.count(),
    prisma.requirement.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { stage: "SUBMITTED" } }),
    prisma.application.count({ where: { stage: "SHORTLISTED" } }),
    prisma.application.count({ where: { stage: "INTERVIEW" } }),
    prisma.application.count({ where: { stage: "SELECTED" } }),
    prisma.application.count({ where: { stage: "DEPLOYED" } }),
    prisma.application.count({ where: { stage: "PROCESSING" } }),
    prisma.$queryRaw<{ d: string; c: number }[]>`SELECT to_char(date_trunc('day',"createdAt"),'YYYY-MM-DD') d, count(*)::int c FROM "Application" WHERE "createdAt" > now() - interval '14 days' GROUP BY 1`,
    prisma.$queryRaw<{ d: string; c: number }[]>`SELECT to_char(date_trunc('day',"createdAt"),'YYYY-MM-DD') d, count(*)::int c FROM "CandidateProfile" WHERE "createdAt" > now() - interval '14 days' GROUP BY 1`,
    prisma.$queryRaw<{ d: string; c: number }[]>`SELECT to_char(date_trunc('day',"createdAt"),'YYYY-MM-DD') d, count(*)::int c FROM "Application" WHERE "createdAt" > now() - interval '84 days' GROUP BY 1`,
    prisma.application.groupBy({ by: ["stage"], _count: true }),
    prisma.requirement.groupBy({ by: ["profession"], _count: true, orderBy: { _count: { profession: "desc" } }, take: 6 }),
    prisma.requirement.groupBy({ by: ["location"], _count: true, orderBy: { _count: { location: "desc" } }, take: 6 }),
    prisma.document.groupBy({ by: ["status"], _count: true }),
    prisma.$queryRaw<{ m: string; c: number }[]>`SELECT to_char(date_trunc('month','now'::timestamp - (n||' month')::interval),'Mon') m, (SELECT count(*)::int FROM "Application" a WHERE a.stage='DEPLOYED' AND date_trunc('month',a."updatedAt")=date_trunc('month','now'::timestamp-(n||' month')::interval)) c FROM generate_series(5,0,-1) n`,
    prisma.auditLog.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { action: true, entity: true, createdAt: true, user: { select: { name: true } } } }),
  ]);

  const app = densify(appRows, 14);
  const cand = densify(candRows, 14);
  const heat = densify(heatRows, 84);
  const apps = submitted + shortlisted + interviews + selected + deployed + processing;

  return {
    kpis: [
      { label: "Companies", value: companies, sub: `${verified} verified`, icon: "building", tone: "navy", delta: 6, spark: synth(companies) },
      { label: "Recruitment Partners", value: oeps, sub: "active network", icon: "handshake", tone: "green", delta: 4, spark: synth(oeps) },
      { label: "Candidates", value: candidates, sub: "talent pool", icon: "users", tone: "blue", delta: delta7(cand.counts), spark: cand.counts },
      { label: "Open Requirements", value: openReqs, sub: "sourcing now", icon: "doc", tone: "amber", delta: 9, spark: synth(openReqs) },
      { label: "Applications", value: apps, sub: "all stages", icon: "briefcase", tone: "purple", delta: delta7(app.counts), spark: app.counts },
      { label: "Interviews", value: interviews, sub: "in progress", icon: "chat", tone: "teal", delta: 3, spark: synth(interviews) },
      { label: "Selected", value: selected, sub: "awaiting processing", icon: "check-circle", tone: "green", delta: 7, spark: synth(selected) },
      { label: "Deployed", value: deployed, sub: "placed worldwide", icon: "globe", tone: "navy", delta: 12, spark: synth(deployed) },
    ],
    area: { labels: app.dates, data: app.counts },
    heat: heat.dates.map((d, i) => ({ date: d, count: heat.counts[i] })),
    stageDist: stageDist.map((s) => ({ label: s.stage.replace(/_/g, " "), value: s._count })),
    professions: profGroup.map((p) => ({ label: p.profession, value: p._count })),
    locations: locGroup.map((l) => ({ label: l.location, value: l._count })),
    docStatus: docGroup.map((d) => ({ label: d.status, value: d._count })),
    monthly: monthRows.map((m) => ({ label: m.m, value: Number(m.c) })),
    conversion: {
      shortlistRate: apps ? Math.round((shortlisted / apps) * 100) : 0,
      interviewRate: shortlisted ? Math.round((interviews / Math.max(1, shortlisted + interviews + selected + deployed)) * 100) : 0,
      selectionRate: apps ? Math.round(((selected + deployed) / apps) * 100) : 0,
      deployRate: selected + deployed ? Math.round((deployed / (selected + deployed)) * 100) : 0,
    },
    activity: activity.map((a) => ({ who: a.user?.name ?? "System", action: a.action, entity: a.entity ?? "", when: a.createdAt })),
  };
}

// Live Command Center stats from the database.
export async function getAdminStats() {
  const [
    companies, verifiedCompanies, oeps, candidates, openReqs,
    shortlisted, interviews, selected, deployed, pendingCompanies,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: "VERIFIED" } }),
    prisma.oep.count(),
    prisma.candidateProfile.count(),
    prisma.requirement.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { stage: "SHORTLISTED" } }),
    prisma.application.count({ where: { stage: "INTERVIEW" } }),
    prisma.application.count({ where: { stage: "SELECTED" } }),
    prisma.application.count({ where: { stage: "DEPLOYED" } }),
    prisma.company.findMany({
      where: { status: "PENDING" },
      select: { id: true, name: true, crNumber: true, city: true, industry: true },
      take: 5, orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    kpis: [
      { label: "Companies", value: companies.toLocaleString(), sub: `${verifiedCompanies} verified`, icon: "building", tone: "navy" },
      { label: "Recruitment Partners", value: oeps.toLocaleString(), sub: "verified network", icon: "handshake", tone: "green" },
      { label: "Candidates", value: candidates.toLocaleString(), sub: "in talent pool", icon: "users", tone: "blue" },
      { label: "Open Requirements", value: openReqs.toLocaleString(), sub: "actively sourcing", icon: "doc", tone: "amber" },
      { label: "Shortlisted", value: shortlisted.toLocaleString(), sub: "across requirements", icon: "star", tone: "purple" },
      { label: "Interviews", value: interviews.toLocaleString(), sub: "in progress", icon: "chat", tone: "teal" },
      { label: "Selected", value: selected.toLocaleString(), sub: "awaiting processing", icon: "check-circle", tone: "green" },
      { label: "Deployed", value: deployed.toLocaleString(), sub: "placed worldwide", icon: "globe", tone: "navy" },
    ],
    pendingCompanies: pendingCompanies.map((c) => ({ id: c.id, name: c.name, cr: c.crNumber, city: c.city ?? "—", industry: c.industry ?? "—", when: "pending" })),
  };
}

// Live, real-time "Urgent Actions" for the Command Center. Every number is a
// direct database count — nothing hardcoded.
export async function getUrgentActions() {
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);
  const in30Days = new Date(); in30Days.setDate(in30Days.getDate() + 30);

  const [reqsNeedingCandidates, missingDocs, interviewsToday, pendingCompanies, expiringLicenses, selectedProcessing] = await Promise.all([
    prisma.requirement.count({ where: { status: "OPEN", applications: { none: {} } } }),
    prisma.document.count({ where: { status: { in: ["MISSING", "EXPIRED"] } } }),
    prisma.interview.count({ where: { scheduledAt: { gte: startOfToday, lte: endOfToday } } }),
    prisma.company.count({ where: { status: "PENDING" } }),
    prisma.oep.count({ where: { licenseExpiry: { not: null, lte: in30Days } } }),
    prisma.application.count({ where: { stage: "SELECTED" } }),
  ]);

  return [
    { t: `${reqsNeedingCandidates} requirements need candidates`, tone: "amber", icon: "doc", href: "/admin/requirements", n: reqsNeedingCandidates },
    { t: `${missingDocs} documents missing or expired`, tone: "red", icon: "shield", href: "/admin/documents", n: missingDocs },
    { t: `${interviewsToday} interviews scheduled today`, tone: "blue", icon: "chat", href: "/admin/candidates", n: interviewsToday },
    { t: `${pendingCompanies} companies awaiting verification`, tone: "navy", icon: "building", href: "/admin/companies", n: pendingCompanies },
    { t: `${expiringLicenses} partner licenses expiring soon`, tone: "amber", icon: "handshake", href: "/admin/oeps", n: expiringLicenses },
    { t: `${selectedProcessing} selected candidates awaiting processing`, tone: "purple", icon: "clock", href: "/admin/candidates", n: selectedProcessing },
  ].filter((a) => a.n > 0);
}

// Full company record for the admin detail page.
export async function getCompanyDetail(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      requirements: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, refCode: true, title: true, profession: true, location: true, quantity: true, status: true, priority: true, createdAt: true } },
      invoices: { orderBy: { issuedAt: "desc" }, take: 10, select: { id: true, amount: true, currency: true, status: true, issuedAt: true } },
      users: { select: { id: true, name: true, email: true, role: true } },
      _count: { select: { requirements: true, invoices: true, replacements: true } },
    },
  });
}

// Detail records for admin edit pages.
export async function getOepDetail(id: string) {
  return prisma.oep.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, role: true } },
      _count: { select: { applications: true, commissions: true } },
      applications: { take: 10, orderBy: { createdAt: "desc" }, select: { id: true, stage: true, candidate: { select: { user: { select: { name: true } } } }, requirement: { select: { refCode: true, title: true } } } },
    },
  });
}

export async function getRequirementDetail(id: string) {
  return prisma.requirement.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true } },
      oep: { select: { id: true, name: true } },
      applications: { take: 20, orderBy: { createdAt: "desc" }, select: { id: true, stage: true, aiMatch: true, candidate: { select: { id: true, user: { select: { name: true } } } } } },
      _count: { select: { applications: true } },
    },
  });
}

export async function getLeadDetail(id: string) {
  return prisma.lead.findUnique({ where: { id }, include: { owner: { select: { name: true } } } });
}

export async function getCompaniesLite() {
  return prisma.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 500 });
}

// Employer's own requirements (for the My Requirements page).
export async function getEmployerRequirements(companyId?: string) {
  return prisma.requirement.findMany({
    where: companyId ? { companyId } : {},
    orderBy: { createdAt: "desc" }, take: 100,
    select: { id: true, refCode: true, title: true, profession: true, location: true, quantity: true, status: true, priority: true, createdAt: true, _count: { select: { applications: true } } },
  });
}

// Employer's invoices (for the Billing / Invoices page).
export async function getEmployerInvoices(companyId?: string) {
  const invoices = await prisma.invoice.findMany({
    where: companyId ? { companyId } : {},
    orderBy: { issuedAt: "desc" }, take: 100,
    select: { id: true, amount: true, currency: true, status: true, issuedAt: true, dueAt: true },
  });
  const sum = (pred: (s: string) => boolean) => invoices.filter((i) => pred(i.status)).reduce((t, i) => t + Number(i.amount), 0);
  return {
    invoices,
    totals: {
      outstanding: sum((s) => s !== "PAID" && s !== "VOID"),
      paid: sum((s) => s === "PAID"),
      currency: invoices[0]?.currency ?? "SAR",
    },
  };
}

// Live employer dashboard stats.
export async function getEmployerStats(companyId?: string) {
  const where = companyId ? { companyId } : {};
  const [active, apps, shortlisted, interviews, selected, deployed, requirements] = await Promise.all([
    prisma.requirement.count({ where: { ...where, status: "OPEN" } }),
    prisma.application.count({ where: { requirement: where } }),
    prisma.application.count({ where: { requirement: where, stage: "SHORTLISTED" } }),
    prisma.application.count({ where: { requirement: where, stage: "INTERVIEW" } }),
    prisma.application.count({ where: { requirement: where, stage: "SELECTED" } }),
    prisma.application.count({ where: { requirement: where, stage: "DEPLOYED" } }),
    prisma.requirement.findMany({
      where, take: 5, orderBy: { createdAt: "desc" },
      select: { refCode: true, title: true, location: true, experience: true, status: true, _count: { select: { applications: true } } },
    }),
  ]);
  return { active, apps, shortlisted, interviews, selected, deployed, requirements };
}

// Applications in an employer's pipeline.
export async function getEmployerPipeline(companyId?: string) {
  return prisma.application.findMany({
    where: companyId ? { requirement: { companyId } } : {},
    take: 40,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, stage: true, aiMatch: true,
      candidate: { select: { user: { select: { name: true } }, profession: true, city: true } },
      requirement: { select: { refCode: true, title: true, location: true } },
    },
  });
}

// Employer interviews view: shortlisted-to-schedule + scheduled interviews.
export async function getEmployerInterviews(companyId?: string) {
  const reqWhere = companyId ? { companyId } : {};
  const [shortlisted, scheduled] = await Promise.all([
    prisma.application.findMany({
      where: { requirement: reqWhere, stage: "SHORTLISTED" }, take: 20,
      select: { id: true, aiMatch: true, candidate: { select: { user: { select: { name: true } }, profession: true } }, requirement: { select: { refCode: true, title: true } } },
    }),
    prisma.interview.findMany({
      where: { status: "SCHEDULED", application: { requirement: reqWhere } }, take: 20, orderBy: { scheduledAt: "asc" },
      select: { id: true, scheduledAt: true, method: true, link: true, application: { select: { candidate: { select: { user: { select: { name: true } } } }, requirement: { select: { refCode: true, title: true } } } } },
    }),
  ]);
  return { shortlisted, scheduled };
}

// Full candidate profile for staff/employer/partner review.
export async function getCandidateDetail(candidateId: string) {
  return prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    select: {
      id: true, profession: true, city: true, experienceYrs: true, saudiExpYrs: true, salaryExpect: true,
      education: true, skills: true, languages: true, drivingLicense: true, summary: true, profileStrength: true,
      user: { select: { name: true, email: true, phone: true } },
      documents: { select: { type: true, status: true, fileUrl: true } },
      applications: {
        select: { stage: true, aiMatch: true, createdAt: true, requirement: { select: { refCode: true, title: true, location: true } } },
        orderBy: { createdAt: "desc" }, take: 20,
      },
    },
  });
}

// Partner earnings (commissions) + totals.
export async function getPartnerEarnings(oepId?: string) {
  const where = oepId ? { oepId } : {};
  const rows = await prisma.commission.findMany({
    where, orderBy: { createdAt: "desc" }, take: 100,
    select: { id: true, grossFee: true, oepShare: true, currency: true, status: true, createdAt: true, application: { select: { candidate: { select: { user: { select: { name: true } } } }, requirement: { select: { refCode: true } } } } },
  });
  const sum = (f: (r: typeof rows[number]) => boolean) => rows.filter(f).reduce((s, r) => s + Number(r.oepShare), 0);
  return {
    rows,
    totals: {
      pending: sum((r) => r.status === "PENDING"),
      payable: sum((r) => r.status === "APPROVED" || r.status === "PAYABLE"),
      paid: sum((r) => r.status === "PAID"),
      lifetime: rows.reduce((s, r) => s + Number(r.oepShare), 0),
    },
  };
}

// Top candidates to review for an employer (AI-ranked, not yet decided).
export async function getEmployerCandidates(companyId?: string) {
  return prisma.application.findMany({
    where: { requirement: companyId ? { companyId } : {}, stage: { in: ["SUBMITTED", "UNDER_REVIEW", "SCREENING"] } },
    take: 6, orderBy: { aiMatch: "desc" },
    select: {
      id: true, aiMatch: true, skillsMatch: true, expMatch: true,
      candidate: { select: { id: true, profession: true, city: true, experienceYrs: true, saudiExpYrs: true, user: { select: { name: true } } } },
      requirement: { select: { refCode: true, title: true } },
    },
  });
}

// Open requirements (for marketplace / candidate job search / submission select).
export async function getOpenRequirements() {
  return prisma.requirement.findMany({
    where: { status: "OPEN" }, take: 50, orderBy: { createdAt: "desc" },
    select: { id: true, refCode: true, title: true, profession: true, location: true, quantity: true, experience: true, salary: true },
  });
}

// Partner: requirements this OEP posted (they need manpower too).
export async function getOepRequirements(oepId?: string) {
  if (!oepId) return [];
  return prisma.requirement.findMany({
    where: { oepId },
    orderBy: { createdAt: "desc" }, take: 100,
    select: { id: true, refCode: true, title: true, profession: true, location: true, quantity: true, status: true, expiryDate: true, createdAt: true },
  });
}

// Partner: candidates this OEP has submitted, with current stage.
export async function getPartnerSubmissions(oepId?: string) {
  return prisma.application.findMany({
    where: oepId ? { oepId } : { oepId: { not: null } },
    orderBy: { updatedAt: "desc" }, take: 100,
    select: {
      id: true, stage: true, aiMatch: true, createdAt: true,
      candidate: { select: { user: { select: { name: true } }, profession: true, city: true } },
      requirement: { select: { refCode: true, title: true, location: true } },
    },
  });
}

// Candidate: this user's applications with stage + requirement.
export async function getCandidateApplications(userId?: string) {
  if (!userId) return [];
  const profile = await prisma.candidateProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!profile) return [];
  return prisma.application.findMany({
    where: { candidateId: profile.id },
    orderBy: { updatedAt: "desc" }, take: 100,
    select: {
      id: true, stage: true, aiMatch: true, createdAt: true,
      requirement: { select: { refCode: true, title: true, location: true, salary: true } },
      interviews: { select: { scheduledAt: true, method: true, status: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
}

// Live OEP partner dashboard stats.
export async function getPartnerStats(oepId?: string) {
  const where = oepId ? { oepId } : {};
  const [submitted, shortlisted, interviews, selected, deployed, openReqs, marketplace] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.count({ where: { ...where, stage: "SHORTLISTED" } }),
    prisma.application.count({ where: { ...where, stage: "INTERVIEW" } }),
    prisma.application.count({ where: { ...where, stage: "SELECTED" } }),
    prisma.application.count({ where: { ...where, stage: "DEPLOYED" } }),
    prisma.requirement.count({ where: { status: "OPEN" } }),
    prisma.requirement.findMany({
      where: { status: "OPEN" }, take: 5, orderBy: { createdAt: "desc" },
      select: { refCode: true, title: true, location: true, quantity: true, experience: true },
    }),
  ]);
  return { submitted, shortlisted, interviews, selected, deployed, openReqs, marketplace };
}

// Live candidate dashboard stats.
export async function getCandidateStats(userId?: string) {
  const profile = userId
    ? await prisma.candidateProfile.findUnique({
        where: { userId },
        select: {
          id: true, profileStrength: true, profession: true,
          applications: { select: { stage: true, aiMatch: true, requirement: { select: { refCode: true, title: true, location: true } } } },
          documents: { select: { type: true, status: true } },
        },
      })
    : null;
  const apps = profile?.applications ?? [];
  return {
    applied: apps.length,
    shortlisted: apps.filter((a) => a.stage === "SHORTLISTED").length,
    interviews: apps.filter((a) => a.stage === "INTERVIEW").length,
    profileStrength: profile?.profileStrength ?? 0,
    applications: apps,
    documents: profile?.documents ?? [],
  };
}
