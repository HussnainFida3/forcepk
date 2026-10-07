import type { NextAuthConfig } from "next-auth";
import { canAccess, homeForRole } from "@/lib/rbac";
import type { Role } from "@prisma/client";

const PROTECTED = ["/admin", "/employer", "/partner", "/candidate"];

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [], // defined in auth.ts (Node runtime)
  callbacks: {
    // Runs in middleware (edge). Enforces auth + role-based area access.
    authorized({ auth, request: { nextUrl } }) {
      const role = auth?.user?.role as Role | undefined;
      const { pathname } = nextUrl;
      const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"));

      if (!isProtected) return true;
      if (!role) return false; // not signed in → redirected to /login

      if (!canAccess(role, pathname)) {
        // Signed in but wrong area → send to their own home
        return Response.redirect(new URL(homeForRole(role), nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.status = (user as { status: string }).status;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.status = token.status as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
