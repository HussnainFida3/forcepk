import Link from "next/link";
import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { resetPassword } from "../login/actions";

export const metadata = { title: "Set new password" };
export const dynamic = "force-dynamic";

export default async function ResetPassword({ searchParams }: { searchParams: { token?: string; error?: string } }) {
  const token = searchParams?.token;
  const row = token
    ? await prisma.passwordResetToken.findUnique({ where: { token }, select: { usedAt: true, expiresAt: true } })
    : null;
  const valid = !!row && !row.usedAt && row.expiresAt > new Date();

  return (
    <section className="section">
      <div className="container-fp max-w-md">
        <h1 className="text-2xl font-bold text-navy">Set a new password</h1>
        {valid ? (
          <>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-dark"><Icon name="check-circle" className="h-4 w-4" /> Reset link verified. Choose a new password.</p>
            {searchParams?.error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">Password must be at least 6 characters.</p>}
            <form action={resetPassword} className="mt-6 space-y-4">
              <input type="hidden" name="token" value={token} />
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-navy/70">New password</span>
                <input name="password" type="password" required minLength={6} placeholder="At least 6 characters" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
              </label>
              <button className="btn-primary w-full">Update password <Icon name="arrow" className="h-4 w-4" /></button>
            </form>
          </>
        ) : (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This reset link is invalid or has expired. <Link href="/forgot-password" className="font-semibold underline">Request a new one</Link>.
          </p>
        )}
        <p className="mt-6 text-center text-sm text-navy/60"><Link href="/login" className="font-semibold text-brand">Back to sign in</Link></p>
      </div>
    </section>
  );
}
