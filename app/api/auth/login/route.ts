import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { issuePair, ADMIN_ROLES } from "@/lib/agents/token";
import { json, preflight } from "@/lib/agents/http";

export const dynamic = "force-dynamic";

// Bearer-token admin login for the AI Command Center (separate from NextAuth,
// which lives at /api/auth/[...nextauth]). Static segment wins over the catch-all.
export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return json(req, { success: false, error: { message: "Email and password required." } }, 400);

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return json(req, { success: false, error: { message: "Incorrect email or password." } }, 401);
  }
  if (!ADMIN_ROLES.includes(user.role)) {
    return json(req, { success: false, error: { message: "This account is not an admin." } }, 403);
  }

  const { accessToken, refreshToken } = await issuePair(user.id, user.role);
  return json(req, {
    success: true,
    data: { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: "ADMIN" } },
  });
}
