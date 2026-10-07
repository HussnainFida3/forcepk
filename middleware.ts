import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe: uses only authConfig (no Prisma/bcrypt).
export default NextAuth(authConfig).auth;

export const config = {
  // Guard the four portal areas; skip static assets and the auth API.
  matcher: ["/admin/:path*", "/employer/:path*", "/partner/:path*", "/candidate/:path*"],
};
