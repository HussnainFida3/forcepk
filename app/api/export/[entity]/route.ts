import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES } from "@/lib/rbac";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

export async function GET(_req: NextRequest, { params }: { params: { entity: string } }) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) return new NextResponse("Unauthorized", { status: 401 });

  let rows: Record<string, unknown>[] = [];
  switch (params.entity) {
    case "candidates":
      rows = (await prisma.candidateProfile.findMany({ take: 5000, select: { profession: true, city: true, experienceYrs: true, saudiExpYrs: true, profileStrength: true, user: { select: { name: true, email: true } } } }))
        .map((c) => ({ name: c.user.name, email: c.user.email, profession: c.profession, city: c.city, experience: c.experienceYrs, overseasExp: c.saudiExpYrs, strength: c.profileStrength }));
      break;
    case "requirements":
      rows = (await prisma.requirement.findMany({ take: 5000, select: { refCode: true, title: true, profession: true, quantity: true, location: true, salary: true, status: true, company: { select: { name: true } } } }))
        .map((r) => ({ ref: r.refCode, title: r.title, profession: r.profession, quantity: r.quantity, location: r.location, salary: r.salary, status: r.status, company: r.company?.name ?? "" }));
      break;
    case "applications":
      rows = (await prisma.application.findMany({ take: 5000, select: { stage: true, aiMatch: true, candidate: { select: { user: { select: { name: true } } } }, requirement: { select: { refCode: true, title: true } } } }))
        .map((a) => ({ candidate: a.candidate.user.name, requirement: a.requirement.refCode, title: a.requirement.title, stage: a.stage, aiMatch: a.aiMatch }));
      break;
    case "companies":
      rows = (await prisma.company.findMany({ take: 5000, select: { name: true, crNumber: true, city: true, industry: true, status: true } }))
        .map((c) => ({ name: c.name, registration: c.crNumber, city: c.city, industry: c.industry, status: c.status }));
      break;
    default:
      return new NextResponse("Unknown dataset", { status: 404 });
  }

  return new NextResponse(toCsv(rows), {
    headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="forcepk-${params.entity}.csv"` },
  });
}
