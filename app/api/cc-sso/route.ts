import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { verifyToken, ADMIN_ROLES } from "@/lib/agents/token";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Command Center single sign-on landing (server half).
 *
 * The console already holds a valid ForcePK admin bearer token — an HS256 JWT
 * minted by /api/auth/login and signed with AUTH_SECRET. The browser half
 * (/cc-sso) reads that token out of the URL hash and POSTs it here. We verify
 * it, confirm the subject is a real admin user, then mint the NextAuth session
 * JWT — the exact httpOnly cookie the middleware-guarded /admin area
 * authenticates against — so the operator lands on the dashboard without a
 * second login.
 *
 * This is purely additive: it never touches the normal /login + NextAuth flow.
 * The only way to obtain a session from it is to already hold a valid admin
 * bearer token, which is itself a credential only the console can mint.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ ok: false, error: "Missing token." }, { status: 400 });

  const claims = await verifyToken(token);
  if (!claims || claims.kind !== "access" || !ADMIN_ROLES.includes(claims.role)) {
    return NextResponse.json({ ok: false, error: "Invalid or non-admin token." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return NextResponse.json({ ok: false, error: "Account is not an admin." }, { status: 403 });
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "Server auth not configured." }, { status: 500 });

  // Auth.js v5 derives the session cookie name from the deployment scheme, and
  // uses that same name as the encryption salt. On https it is the __Secure- form.
  const https = new URL(req.url).protocol === "https:";
  const cookieName = https ? "__Secure-authjs.session-token" : "authjs.session-token";
  const maxAge = 60 * 60 * 24 * 7; // 7 days

  const sessionToken = await encode({
    salt: cookieName,
    secret,
    maxAge,
    token: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: https,
    path: "/",
    maxAge,
  });
  return res;
}
