"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { ADMIN_ROLES } from "@/lib/rbac";
import { collectLeadsBatch } from "@/lib/agents/leadsource";
import { discoverHiringBatch, scanCompany } from "@/lib/agents/careerscan";

async function guard() {
  const u = await currentUser();
  if (!u || !ADMIN_ROLES.includes(u.role as never)) throw new Error("Not authorized");
}
const refresh = () => { revalidatePath("/admin/leads"); revalidatePath("/admin/crm"); };
const S = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

/* ── Deterministic collectors (no LLM — results always persist) ── */

export async function runCollectLeads(fd: FormData) {
  await guard();
  const region = S(fd, "region") || undefined;
  const limit = Math.min(Math.max(parseInt(S(fd, "limit") || "25", 10) || 25, 1), 100);
  await collectLeadsBatch({ region, limit });
  refresh();
}

export async function runHiringScan(fd: FormData) {
  await guard();
  const country = S(fd, "country") || undefined;
  const limit = Math.min(Math.max(parseInt(S(fd, "limit") || "6", 10) || 6, 1), 6);
  await discoverHiringBatch({ country, limit });
  refresh();
}

/* ── Hiring-company CRUD ── */

export async function setHiringStatus(id: string, fd: FormData) {
  await guard();
  const status = S(fd, "status");
  if (status) await prisma.hiringCompany.update({ where: { id }, data: { status } });
  refresh();
}

export async function rescanCompany(id: string) {
  await guard();
  const c = await prisma.hiringCompany.findUnique({ where: { id } });
  if (c) await scanCompany({ name: c.name, website: c.website ?? undefined, careerUrl: c.careerUrl ?? undefined, country: c.country ?? undefined });
  refresh();
}

export async function deleteHiringCompany(id: string) {
  await guard();
  await prisma.hiringCompany.delete({ where: { id } });
  refresh();
}

export async function deleteDiscoveredJob(id: string) {
  await guard();
  await prisma.discoveredJob.delete({ where: { id } });
  refresh();
}

/** Turn a scanned company into a CRM lead for outreach. */
export async function convertHiringToLead(id: string) {
  await guard();
  const c = await prisma.hiringCompany.findUnique({ where: { id }, include: { jobs: true } });
  if (!c) return;
  const existing = await prisma.lead.findFirst({ where: { company: c.name, source: "Hiring Signals" } });
  if (!existing) {
    await prisma.lead.create({
      data: {
        name: c.name, company: c.name, source: "Hiring Signals", stage: "NEW",
        notes: `${c.status === "ACTIVELY_HIRING" ? "Actively hiring" : c.status}${c.jobs.length ? ` (${c.jobs.length} open roles)` : ""}${c.country ? ` · ${c.country}` : ""}. Careers: ${c.careerUrl ?? "n/a"}`,
      },
    });
  }
  refresh();
}

/* ── Lead CRUD helpers used on this page ── */

export async function deleteLead(id: string) {
  await guard();
  await prisma.lead.delete({ where: { id } });
  refresh();
}
