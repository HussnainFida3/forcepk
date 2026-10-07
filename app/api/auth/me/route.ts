import { prisma } from "@/lib/prisma";
import { requireAccess } from "@/lib/agents/token";
import { json, preflight } from "@/lib/agents/http";

export const dynamic = "force-dynamic";

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request) {
  const claims = await requireAccess(req);
  if (!claims) return json(req, { success: false, error: { message: "Unauthorized." } }, 401);
  const user = await prisma.user.findUnique({ where: { id: claims.sub }, select: { id: true, name: true, email: true } });
  if (!user) return json(req, { success: false, error: { message: "Unknown user." } }, 401);
  return json(req, { success: true, data: user });
}
