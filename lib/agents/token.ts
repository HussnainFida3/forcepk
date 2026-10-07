// Bearer-token bridge for the AI Command Center console.
// The console (ai-command-center) authenticates to ForcePK exactly like it
// does to GhrFix: POST /api/auth/login -> {accessToken, refreshToken}, then
// sends `Authorization: Bearer <access>` on every agent call. We mint short
// HS256 JWTs signed with AUTH_SECRET (already used by NextAuth).
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "forcepk-dev-secret-change-me");

export type TokenKind = "access" | "refresh";

export async function signToken(payload: { sub: string; role: string; kind: TokenKind }, ttl: string): Promise<string> {
  return new SignJWT({ role: payload.role, kind: payload.kind })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ sub: string; role: string; kind: TokenKind } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { sub: String(payload.sub), role: String(payload.role), kind: payload.kind as TokenKind };
  } catch {
    return null;
  }
}

/** Extract + verify an access token from an Authorization header. */
export async function requireAccess(req: Request): Promise<{ sub: string; role: string } | null> {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const claims = await verifyToken(auth.slice(7).trim());
  if (!claims || claims.kind !== "access") return null;
  return { sub: claims.sub, role: claims.role };
}

export async function issuePair(userId: string, role: string) {
  const accessToken = await signToken({ sub: userId, role, kind: "access" }, "30m");
  const refreshToken = await signToken({ sub: userId, role, kind: "refresh" }, "30d");
  return { accessToken, refreshToken };
}

// Roles allowed to drive the command center.
export const ADMIN_ROLES = ["SUPER_ADMIN", "OPS_MANAGER"];
