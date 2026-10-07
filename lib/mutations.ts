"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { currentUser, nextRefCode } from "@/lib/session";
import { sendEmail, sendWhatsApp, sendSMS } from "@/lib/integrations/channels";
import { aiMatchScore, assistantAnswer } from "@/lib/integrations/ai";
import { createMeeting, createCheckout } from "@/lib/integrations/services";
import type { Stage, DocType, DocStatus } from "@prisma/client";

const STAGE_ORDER: Stage[] = ["SUBMITTED", "UNDER_REVIEW", "SCREENING", "SHORTLISTED", "INTERVIEW", "SELECTED", "DOCUMENTATION", "PROCESSING", "READY", "DEPARTURE", "DEPLOYED"];

async function log(action: string, entity: string, entityId: string) {
  const u = await currentUser();
  await prisma.auditLog.create({ data: { userId: u?.id ?? null, action, entity, entityId } });
}

// ── Employer: create a manpower requirement ──
export async function createRequirement(formData: FormData) {
  const u = await currentUser();
  if (!u?.companyId) throw new Error("No company on account");
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const quantity = parseInt(g("quantity") || "1", 10);

  const req = await prisma.requirement.create({
    data: {
      refCode: await nextRefCode(),
      companyId: u.companyId,
      title: g("title") || `${quantity} ${g("profession")}s`,
      profession: g("profession"),
      quantity,
      gender: g("gender") || null,
      experience: g("experience") || null,
      education: g("education") || null,
      skills: g("skills") ? g("skills").split(",").map((s) => s.trim()).filter(Boolean) : [],
      salary: g("salary") || null,
      location: g("location"),
      contractDuration: g("contractDuration") || null,
      workingHours: g("workingHours") || null,
      interviewMethod: g("interviewMethod") || null,
      specialNotes: g("specialNotes") || null,
      status: "OPEN",
    },
  });
  await log("requirement.create", "Requirement", req.id);
  revalidatePath("/employer");
  revalidatePath("/admin");
  redirect("/employer?created=" + req.refCode);
}

// ── Admin: create / manage requirements for any company ──
export async function createAdminRequirement(formData: FormData) {
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const companyId = g("companyId");
  if (!companyId || !g("profession")) return;
  const quantity = parseInt(g("quantity") || "1", 10);
  const req = await prisma.requirement.create({
    data: {
      refCode: await nextRefCode(), companyId,
      title: g("title") || `${quantity} ${g("profession")}s`, profession: g("profession"),
      quantity, location: g("location"), experience: g("experience") || null, salary: g("salary") || null,
      skills: [], status: "OPEN", priority: (g("priority") || "NORMAL") as never,
    },
  });
  await log("requirement.admin.create", "Requirement", req.id);
  revalidatePath("/admin/requirements");
  revalidatePath("/admin");
}

export async function setRequirementStatus(requirementId: string, status: "OPEN" | "CLOSED" | "FULFILLED" | "PENDING_VERIFICATION") {
  await prisma.requirement.update({ where: { id: requirementId }, data: { status } });
  await log("requirement.status", "Requirement", requirementId);
  revalidatePath("/admin/requirements");
  revalidatePath("/employer");
}

export async function toggleRequirementPriority(requirementId: string, current: string) {
  const next = current === "URGENT" ? "NORMAL" : "URGENT";
  await prisma.requirement.update({ where: { id: requirementId }, data: { priority: next as never } });
  await log("requirement.priority", "Requirement", requirementId);
  revalidatePath("/admin/requirements");
}

// ── Partner: submit a candidate against a requirement ──
export async function submitCandidate(formData: FormData) {
  const u = await currentUser();
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const requirementId = g("requirementId");
  if (!requirementId) throw new Error("Pick a requirement");

  const email = g("email") || `cand_${Date.now()}@talent.forcepk.com`;
  const hash = await bcrypt.hash("Password123", 10);
  const user = await prisma.user.create({
    data: { email, name: g("name") || "New Candidate", role: "CANDIDATE", passwordHash: hash, status: "VERIFIED", phone: g("phone") || null },
  });
  const profile = await prisma.candidateProfile.create({
    data: {
      userId: user.id, profession: g("profession") || null, city: g("city") || null,
      passportNo: g("passportNo") || null, experienceYrs: parseInt(g("experience") || "0", 10),
      saudiExpYrs: parseInt(g("overseasExp") || "0", 10), salaryExpect: g("salary") || null,
      skills: g("skills") ? g("skills").split(",").map((s) => s.trim()).filter(Boolean) : [], profileStrength: 60,
    },
  });
  const req = await prisma.requirement.findUnique({ where: { id: requirementId }, select: { profession: true, skills: true, experience: true } });
  const m = aiMatchScore({ candidate: { profession: profile.profession, skills: profile.skills, experienceYrs: profile.experienceYrs, saudiExpYrs: profile.saudiExpYrs }, requirement: req ?? {} });
  const app = await prisma.application.create({
    data: { requirementId, candidateId: profile.id, oepId: u?.oepId ?? null, stage: "SUBMITTED", aiMatch: m.score, skillsMatch: m.skills, expMatch: m.experience },
  });
  await log("candidate.submit", "Application", app.id);
  revalidatePath("/partner");
  revalidatePath("/employer");
  redirect("/partner?submitted=1");
}

// ── Candidate: apply to an open requirement ──
export async function applyToRequirement(requirementId: string) {
  const u = await currentUser();
  if (!u?.candidate?.id) throw new Error("No candidate profile");
  const [profile, req] = await Promise.all([
    prisma.candidateProfile.findUnique({ where: { id: u.candidate.id }, select: { profession: true, skills: true, experienceYrs: true, saudiExpYrs: true } }),
    prisma.requirement.findUnique({ where: { id: requirementId }, select: { profession: true, skills: true, experience: true } }),
  ]);
  const m = aiMatchScore({ candidate: profile ?? {}, requirement: req ?? {} });
  await prisma.application.upsert({
    where: { requirementId_candidateId: { requirementId, candidateId: u.candidate.id } },
    update: {},
    create: { requirementId, candidateId: u.candidate.id, stage: "SUBMITTED", aiMatch: m.score, skillsMatch: m.skills, expMatch: m.experience },
  });
  revalidatePath("/candidate");
  revalidatePath("/candidate/jobs");
}

// ── Shared: advance / reject an application in the pipeline ──
export async function advanceApplication(applicationId: string) {
  const app = await prisma.application.findUnique({ where: { id: applicationId }, select: { stage: true, oepId: true } });
  if (!app) return;
  const idx = STAGE_ORDER.indexOf(app.stage);
  const next = STAGE_ORDER[Math.min(idx + 1, STAGE_ORDER.length - 1)];
  await prisma.application.update({ where: { id: applicationId }, data: { stage: next } });
  if (next === "DEPLOYED") await createCommissionIfNeeded(applicationId, app.oepId);
  await log("application.advance", "Application", applicationId);
  revalidatePath("/employer");
  revalidatePath("/employer/pipeline");
  revalidatePath("/admin");
}

// Auto-create a commission when a candidate is deployed (via an OEP).
async function createCommissionIfNeeded(applicationId: string, oepId: string | null) {
  if (!oepId) return;
  const exists = await prisma.commission.findUnique({ where: { applicationId } });
  if (exists) return;
  const gross = 1500;
  await prisma.commission.create({
    data: { applicationId, oepId, grossFee: gross, oepShare: gross * 0.4, currency: "USD", status: "PENDING" },
  });
}

export async function createInvoice(formData: FormData) {
  const companyId = String(formData.get("companyId") ?? "");
  const amount = parseFloat(String(formData.get("amount") ?? "0"));
  if (!companyId || !amount) return;
  await prisma.invoice.create({ data: { companyId, amount, currency: "USD", status: "PENDING" } });
  await log("invoice.create", "Company", companyId);
  revalidatePath("/admin/finance");
}

export async function setInvoiceStatus(invoiceId: string, status: string) {
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
  revalidatePath("/admin/finance");
}

export async function setCommissionStatus(commissionId: string, status: "PENDING" | "APPROVED" | "PAYABLE" | "PAID") {
  await prisma.commission.update({ where: { id: commissionId }, data: { status } });
  revalidatePath("/admin/finance");
}

export async function setApplicationStage(applicationId: string, stage: Stage) {
  await prisma.application.update({ where: { id: applicationId }, data: { stage } });
  await log("application.stage", "Application", applicationId);
  revalidatePath("/employer/pipeline");
  revalidatePath("/employer");
}

export async function rejectApplication(applicationId: string) {
  await prisma.application.update({ where: { id: applicationId }, data: { stage: "REJECTED" } });
  await log("application.reject", "Application", applicationId);
  revalidatePath("/employer/pipeline");
  revalidatePath("/employer/candidates");
  revalidatePath("/employer");
}

// ── Admin: verify / suspend a company ──
export async function setCompanyStatus(companyId: string, status: "VERIFIED" | "REJECTED" | "SUSPENDED") {
  await prisma.company.update({ where: { id: companyId }, data: { status } });
  await log("company.status", "Company", companyId);
  await notifyCompanyUsers(companyId, `Your company was ${status.toLowerCase()}`, "Admin updated your verification status.");
  revalidatePath("/admin");
}

export async function setOepStatus(oepId: string, status: "VERIFIED" | "REJECTED" | "SUSPENDED") {
  await prisma.oep.update({ where: { id: oepId }, data: { status } });
  await log("oep.status", "Oep", oepId);
  revalidatePath("/admin");
}

// ── Documents: upload + verify ──
export async function uploadDocument(formData: FormData) {
  const u = await currentUser();
  if (!u?.candidate?.id) throw new Error("No candidate profile");
  const type = String(formData.get("type") ?? "OTHER") as DocType;
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file");

  const dir = path.join(process.cwd(), "storage", u.candidate.id);
  await mkdir(dir, { recursive: true });
  const safe = `${type}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-]/g, "_")}`;
  await writeFile(path.join(dir, safe), Buffer.from(await file.arrayBuffer()));
  const rel = `${u.candidate.id}/${safe}`;

  const existing = await prisma.document.findFirst({ where: { candidateId: u.candidate.id, type } });
  if (existing) {
    await prisma.document.update({ where: { id: existing.id }, data: { fileUrl: rel, status: "PENDING", uploadedAt: new Date() } });
  } else {
    await prisma.document.create({ data: { candidateId: u.candidate.id, type, fileUrl: rel, status: "PENDING" } });
  }
  await log("document.upload", "Document", rel);
  revalidatePath("/candidate");
  revalidatePath("/candidate/documents");
  revalidatePath("/admin/documents");
}

export async function setDocumentStatus(documentId: string, status: DocStatus) {
  const doc = await prisma.document.update({ where: { id: documentId }, data: { status }, select: { candidate: { select: { userId: true } } } });
  await log("document.status", "Document", documentId);
  await notifyUser(doc.candidate.userId, `Document ${status.toLowerCase()}`, "A document on your profile was reviewed.");
  revalidatePath("/admin/documents");
  revalidatePath("/candidate");
}

// ── Interviews: schedule + feedback ──
export async function scheduleInterview(applicationId: string, formData: FormData) {
  const when = String(formData.get("scheduledAt") ?? "");
  const method = String(formData.get("method") ?? "Online");
  let link = String(formData.get("link") ?? "");
  if (!link && method === "Online") {
    const meeting = await createMeeting(`ForcePK interview ${applicationId}`);
    link = meeting.url;
  }
  await prisma.interview.create({
    data: { applicationId, scheduledAt: when ? new Date(when) : null, method, link: link || null, status: "SCHEDULED" },
  });
  await prisma.application.update({ where: { id: applicationId }, data: { stage: "INTERVIEW" } });
  const app = await prisma.application.findUnique({ where: { id: applicationId }, select: { candidate: { select: { userId: true } } } });
  if (app) await notifyUser(app.candidate.userId, "Interview scheduled", `Your interview is ${when || "to be confirmed"} (${method}).`);
  await log("interview.schedule", "Application", applicationId);
  revalidatePath("/employer/pipeline");
  revalidatePath("/employer/interviews");
  revalidatePath("/candidate");
}

export async function submitInterviewFeedback(interviewId: string, formData: FormData) {
  const score = parseInt(String(formData.get("score") ?? "0"), 10);
  const feedback = String(formData.get("feedback") ?? "");
  const outcome = String(formData.get("outcome") ?? ""); // "select" | "reject" | ""
  const iv = await prisma.interview.update({
    where: { id: interviewId }, data: { score, feedback, status: "COMPLETED" }, select: { applicationId: true },
  });
  if (outcome === "select") await prisma.application.update({ where: { id: iv.applicationId }, data: { stage: "SELECTED" } });
  if (outcome === "reject") await prisma.application.update({ where: { id: iv.applicationId }, data: { stage: "REJECTED" } });
  await log("interview.feedback", "Interview", interviewId);
  revalidatePath("/employer/interviews");
  revalidatePath("/employer/pipeline");
}

// ── Notifications helpers ──
// Multi-channel: always writes in-app; also emails/WhatsApps/SMS when configured.
async function notifyUser(userId: string, title: string, body: string) {
  await prisma.notification.create({ data: { userId, title, body } });
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, phone: true } });
  if (!u) return;
  const text = `${title}${body ? ` — ${body}` : ""}`;
  await Promise.allSettled([
    u.email ? sendEmail(u.email, `ForcePK — ${title}`, `<p>${body || title}</p>`) : null,
    u.phone ? sendWhatsApp(u.phone, text) : null,
    u.phone ? sendSMS(u.phone, text) : null,
  ].filter(Boolean) as Promise<unknown>[]);
}
async function notifyCompanyUsers(companyId: string, title: string, body: string) {
  const users = await prisma.user.findMany({ where: { companyId }, select: { id: true } });
  if (users.length) await prisma.notification.createMany({ data: users.map((u) => ({ userId: u.id, title, body })) });
}
export async function markNotificationsRead() {
  const u = await currentUser();
  if (!u) return;
  await prisma.notification.updateMany({ where: { userId: u.id, read: false }, data: { read: true } });
  revalidatePath("/notifications");
}

// ── Self-registration ──
export async function registerAccount(kind: "employer" | "oep" | "candidate", formData: FormData) {
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const email = g("email").toLowerCase();
  const hash = await bcrypt.hash(g("password") || "Password123", 10);
  if (await prisma.user.findFirst({ where: { OR: [{ email }, { phone: g("phone") }] } })) {
    redirect("/login?exists=1");
  }

  if (kind === "employer") {
    const company = await prisma.company.create({
      data: { name: g("company"), crNumber: g("crNumber") || `CR-${Date.now()}`, city: g("city"), industry: g("industry"), email, status: "PENDING" },
    });
    await prisma.user.create({ data: { email, phone: g("phone") || null, name: g("name"), role: "EMPLOYER_ADMIN", passwordHash: hash, status: "PENDING", companyId: company.id } });
  } else if (kind === "oep") {
    const oep = await prisma.oep.create({
      data: { name: g("company"), licenseNo: g("licenseNo") || `OEP-${Date.now()}`, city: g("city"), email, status: "PENDING" },
    });
    await prisma.user.create({ data: { email, phone: g("phone") || null, name: g("name"), role: "OEP_ADMIN", passwordHash: hash, status: "PENDING", oepId: oep.id } });
  } else {
    const user = await prisma.user.create({ data: { email, phone: g("phone") || null, name: g("name"), role: "CANDIDATE", passwordHash: hash, status: "VERIFIED" } });
    await prisma.candidateProfile.create({ data: { userId: user.id, profession: g("profession"), city: g("city"), skills: [], profileStrength: 40 } });
  }
  await log("account.register", "User", email);
  redirect("/login?registered=1");
}

// ── Messaging ──
export async function sendMessage(formData: FormData) {
  const u = await currentUser();
  if (!u) return;
  const recipientId = String(formData.get("recipientId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!recipientId || !body) return;
  await prisma.message.create({ data: { senderId: u.id, recipientId, body } });
  await notifyUser(recipientId, "New message", body.slice(0, 80));
  revalidatePath("/messages");
  revalidatePath(`/messages/${recipientId}`);
}

export async function markThreadRead(otherUserId: string) {
  const u = await currentUser();
  if (!u) return;
  await prisma.message.updateMany({ where: { senderId: otherUserId, recipientId: u.id, read: false }, data: { read: true } });
  revalidatePath("/messages");
}

// ── CRM ──
export async function createLead(formData: FormData) {
  const u = await currentUser();
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  if (!g("name")) return;
  await prisma.lead.create({ data: { name: g("name"), company: g("company") || null, email: g("email") || null, phone: g("phone") || null, source: g("source") || null, ownerId: u?.id ?? null } });
  await log("lead.create", "Lead", g("name"));
  revalidatePath("/admin/crm");
}

export async function setLeadStage(leadId: string, stage: "NEW" | "CONTACTED" | "MEETING" | "PROPOSAL" | "AGREEMENT" | "WON" | "LOST") {
  await prisma.lead.update({ where: { id: leadId }, data: { stage } });
  revalidatePath("/admin/crm");
}

// ── Replacement / guarantee ──
export async function createReplacement(applicationId: string, formData: FormData) {
  const reason = String(formData.get("reason") ?? "").trim() || "Not specified";
  const app = await prisma.application.findUnique({ where: { id: applicationId }, select: { requirement: { select: { companyId: true } } } });
  if (!app) return;
  const n = await prisma.replacementCase.count();
  await prisma.replacementCase.create({
    data: { caseNo: `FP-R${1000 + n + 1}`, applicationId, companyId: app.requirement.companyId, reason, status: "REPORTED" },
  });
  await log("replacement.create", "Application", applicationId);
  revalidatePath("/admin/replacements");
  revalidatePath("/employer/pipeline");
}

export async function setReplacementStatus(caseId: string, status: "REPORTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "SEARCHING" | "SELECTED" | "CLOSED") {
  await prisma.replacementCase.update({ where: { id: caseId }, data: { status } });
  revalidatePath("/admin/replacements");
}

// ── AI admin assistant ──
export async function askAssistant(_prev: { q: string; a: string; ai: boolean } | undefined, formData: FormData): Promise<{ q: string; a: string; ai: boolean }> {
  const q = String(formData.get("q") ?? "").trim();
  if (!q) return { q: "", a: "", ai: false };
  const [pendingCompanies, companies, oeps, candidates, openRequirements, applications, selected, deployed, missingDocs] = await Promise.all([
    prisma.company.count({ where: { status: "PENDING" } }),
    prisma.company.count(), prisma.oep.count(), prisma.candidateProfile.count(),
    prisma.requirement.count({ where: { status: "OPEN" } }),
    prisma.application.count(), prisma.application.count({ where: { stage: "SELECTED" } }),
    prisma.application.count({ where: { stage: "DEPLOYED" } }),
    prisma.document.count({ where: { status: "MISSING" } }),
  ]);
  const { ai, answer } = await assistantAnswer(q, { pendingCompanies, companies, oeps, candidates, openRequirements, applications, selected, deployed, missingDocs, urgentRequirements: openRequirements });
  return { q, a: answer, ai };
}

// ── Public inquiry capture (no auth) → CRM lead ──
export async function createPublicLead(formData: FormData) {
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const returnTo = g("returnTo") || "/";
  const summary = [g("profession"), g("quantity") && `${g("quantity")} workers`, g("location")].filter(Boolean).join(" · ");
  await prisma.lead.create({
    data: {
      name: g("name") || g("email") || g("phone") || "Website inquiry",
      company: g("company") || null,
      email: g("email") || null,
      phone: g("phone") || null,
      source: "Website",
      notes: [summary, g("message"), g("salary") && `Budget: ${g("salary")}`].filter(Boolean).join(" | ") || null,
    },
  });
  await log("lead.public", "Lead", g("email") || "web");
  revalidatePath("/admin/crm");
  redirect(`${returnTo}?sent=1`);
}

// ── Candidate: update own profile ──
export async function updateCandidateProfile(formData: FormData) {
  const u = await currentUser();
  if (!u?.candidate?.id) throw new Error("No candidate profile");
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const list = (k: string) => g(k) ? g(k).split(",").map((s) => s.trim()).filter(Boolean) : undefined;
  await prisma.candidateProfile.update({
    where: { id: u.candidate.id },
    data: {
      profession: g("profession") || undefined,
      city: g("city") || undefined,
      experienceYrs: g("experience") ? parseInt(g("experience"), 10) : undefined,
      saudiExpYrs: g("overseasExp") ? parseInt(g("overseasExp"), 10) : undefined,
      salaryExpect: g("salary") || undefined,
      education: g("education") || undefined,
      skills: list("skills"),
      languages: list("languages"),
      certifications: list("certifications"),
      summary: g("summary") || undefined,
      profileStrength: 90,
    },
  });
  await log("candidate.profile.update", "CandidateProfile", u.candidate.id);
  revalidatePath("/candidate");
  revalidatePath("/candidate/profile");
  redirect("/candidate/profile?saved=1");
}

// ── Company / OEP profile editing ──
export async function updateCompanyProfile(formData: FormData) {
  const u = await currentUser();
  if (!u?.companyId) throw new Error("No company");
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  await prisma.company.update({
    where: { id: u.companyId },
    data: { name: g("name") || undefined, industry: g("industry") || undefined, city: g("city") || undefined, website: g("website") || undefined, about: g("about") || undefined, contactName: g("contactName") || undefined, phone: g("phone") || undefined },
  });
  await log("company.profile.update", "Company", u.companyId);
  revalidatePath("/employer/profile");
  redirect("/employer/profile?saved=1");
}

export async function updateOepProfile(formData: FormData) {
  const u = await currentUser();
  if (!u?.oepId) throw new Error("No OEP");
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  await prisma.oep.update({
    where: { id: u.oepId },
    data: { name: g("name") || undefined, city: g("city") || undefined, phone: g("phone") || undefined, email: g("email") || undefined, specializations: g("specializations") ? g("specializations").split(",").map((s) => s.trim()).filter(Boolean) : undefined },
  });
  await log("oep.profile.update", "Oep", u.oepId);
  revalidatePath("/partner/profile");
  redirect("/partner/profile?saved=1");
}

export async function shortlistApplication(applicationId: string) {
  await prisma.application.update({ where: { id: applicationId }, data: { stage: "SHORTLISTED" } });
  await log("application.shortlist", "Application", applicationId);
  revalidatePath("/employer/candidates");
  revalidatePath("/employer");
  revalidatePath("/employer/pipeline");
}

// ── Online payment (Stripe when keyed) ──
export async function payInvoice(invoiceId: string) {
  const inv = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { amount: true, currency: true } });
  if (!inv) return;
  const checkout = await createCheckout(invoiceId, Number(inv.amount), (inv.currency ?? "usd").toLowerCase());
  redirect(checkout.url);
}
