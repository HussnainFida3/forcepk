import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROLES, EMPLOYER_ROLES, OEP_ROLES } from "@/lib/rbac";

// Serves candidate documents only to authorized users:
//  - platform staff (admin / ops / document officer …)
//  - employers & recruitment partners (who review candidates)
//  - the candidate who owns the document
export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const rel = params.path.join("/");
  if (rel.includes("..")) return new NextResponse("Bad request", { status: 400 });

  const role = session.user.role;
  const staffOrPartner = ADMIN_ROLES.includes(role) || EMPLOYER_ROLES.includes(role) || OEP_ROLES.includes(role);
  if (!staffOrPartner) {
    // Candidate: may only read their own folder (path starts with their candidateId).
    const candidateId = rel.split("/")[0];
    const own = await prisma.candidateProfile.findFirst({ where: { id: candidateId, userId: session.user.id }, select: { id: true } });
    if (!own) return new NextResponse("Forbidden", { status: 403 });
  }

  const file = path.join(process.cwd(), "storage", rel);
  try {
    const data = await readFile(file);
    const ext = path.extname(file).toLowerCase();
    const type = ext === ".pdf" ? "application/pdf" : ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "application/octet-stream";
    return new NextResponse(data, { headers: { "Content-Type": type, "Cache-Control": "private, no-store" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
