import Link from "next/link";
import Icon from "@/components/Icon";
import { requestPasswordReset } from "../login/actions";

export const metadata = { title: "Reset password" };

export default function ForgotPassword({ searchParams }: { searchParams: { sent?: string } }) {
  return (
    <section className="section">
      <div className="container-fp max-w-md">
        <h1 className="text-2xl font-bold text-navy">Reset your password</h1>
        <p className="mt-2 text-sm text-navy/60">Enter your email and we&apos;ll send you a reset link.</p>

        {searchParams?.sent ? (
          <div className="mt-6 rounded-xl border border-brand/30 bg-brand/5 p-5 text-sm text-brand-dark">
            <Icon name="check-circle" className="mb-2 h-6 w-6" />
            If an account exists for that email, a password reset link has been sent. Please check your inbox.
          </div>
        ) : (
          <form action={requestPasswordReset} className="mt-6 space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-navy/70">Email</span>
              <input name="email" type="email" required placeholder="you@company.com"
                className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            </label>
            <button className="btn-primary w-full">Send reset link <Icon name="arrow" className="h-4 w-4" /></button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-navy/60">
          Remembered it? <Link href="/login" className="font-semibold text-brand">Back to sign in</Link>
        </p>
      </div>
    </section>
  );
}
