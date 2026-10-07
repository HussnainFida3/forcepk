import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import type { Role } from "@prisma/client";

const credsSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6),
});

const providers: Provider[] = [
  Credentials({
    credentials: { identifier: {}, password: {} },
    async authorize(raw) {
      const parsed = credsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { identifier, password } = parsed.data;

      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier.toLowerCase() }, { phone: identifier }] },
      });
      if (!user || !user.passwordHash) return null;

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;
      if (user.status === "SUSPENDED" || user.status === "REJECTED") return null;

      await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
      return { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
    },
  }),
];

// Google is enabled only when configured.
export const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
if (googleEnabled) {
  providers.push(Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET, allowDangerousEmailAccountLinking: true }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    // Runs in the Node route handler on sign-in. Enriches the token and, for
    // Google, upserts a DB user (new Google users become candidates by default).
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        const email = (profile?.email ?? (token.email as string | undefined))?.toLowerCase();
        if (email) {
          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: { email, name: (profile?.name as string) ?? "Google User", role: "CANDIDATE", status: "VERIFIED", passwordHash: "" },
            });
            await prisma.candidateProfile.create({ data: { userId: dbUser.id, skills: [], profileStrength: 30 } });
          }
          token.id = dbUser.id;
          token.role = dbUser.role as Role;
          token.status = dbUser.status;
        }
      } else if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: Role }).role;
        token.status = (user as { status: string }).status;
      }
      return token;
    },
  },
});
