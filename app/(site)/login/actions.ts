"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/integrations/channels";

export async function signInGoogle() {
  await signIn("google", { redirectTo: "/portal" });
}

import { randomBytes } from "node:crypto";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  // Always behave the same whether or not the account exists (no enumeration).
  if (email) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user) {
      const token = randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) }, // 1 hour
      });
      const link = `${process.env.NEXTAUTH_URL ?? ""}/reset-password?token=${token}`;
      await sendEmail(email, "Reset your ForcePK password", `<p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${link}">${link}</a></p>`);
    }
  }
  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!token || password.length < 6) redirect("/reset-password?token=" + token + "&error=1");

  const row = await prisma.passwordResetToken.findUnique({ where: { token }, select: { id: true, userId: true, usedAt: true, expiresAt: true } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    redirect("/reset-password?error=expired");
  }

  const bcrypt = (await import("bcryptjs")).default;
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await bcrypt.hash(password, 10) } }),
    prisma.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
  redirect("/login?reset=1");
}

export async function authenticate(_prev: string | undefined, formData: FormData): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      identifier: String(formData.get("identifier") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/portal",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return err.type === "CredentialsSignin"
        ? "Invalid email/phone or password."
        : "Something went wrong. Please try again.";
    }
    throw err; // re-throw redirect
  }
}
