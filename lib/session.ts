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

// Generate a unique requirement ref code like FP-7314
export async function nextRefCode() {
  const n = await prisma.requirement.count();
  return `FP-${7000 + n + 1}`;
}
