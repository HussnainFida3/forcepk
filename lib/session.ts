import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true, companyId: true, oepId: true, candidate: { select: { id: true } } },
  });
}

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "OPS_MANAGER"]);

export async function requireAdmin() {
  const u = await currentUser();
  if (!u || !ADMIN_ROLES.has(u.role)) throw new Error("Admin access required.");
  return u;
}

// Generate a unique requirement ref code like FP-7314
export async function nextRefCode() {
  const n = await prisma.requirement.count();
  return `FP-${7000 + n + 1}`;
}
