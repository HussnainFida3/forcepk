import { prisma } from "@/lib/prisma";
import { verifyToken, issuePair, ADMIN_ROLES } from "@/lib/agents/token";
import { json, preflight } from "@/lib/agents/http";

export const dynamic = "force-dynamic";

export function OPTIONS(req: Request) {
  return preflight(req);
}

// Exchange a valid refresh token for a fresh access+refresh pair.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const refreshToken = typeof body?.refreshToken === "string" ? body.refreshToken : "";
  const claims = refreshToken ? await verifyToken(refreshToken) : null;
  if (!claims || claims.kind !== "refresh") return json(req, { success: false, error: { message: "Invalid refresh token." } }, 401);

  const user = await prisma.user.findUnique({ where: { id: claims.sub } });
  if (!user || !ADMIN_ROLES.includes(user.role)) return json(req, { success: false, error: { message: "Account no longer permitted." } }, 401);

  return json(req, { success: true, data: await issuePair(user.id, user.role) });
}
