import Link from "next/link";
import { verifyEmailToken, resendVerification } from "@/lib/mutations";

export const metadata = { title: "Verify email" };
export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams?.token;
  const status = token ? await verifyEmailToken(token) : "invalid";

  const ok = status === "ok";
  const title = ok ? "Email verified 🎉" : status === "used" ? "Already verified" : status === "expired" ? "Link expired" : "Invalid link";
  const message = ok
    ? "Your email address is confirmed. You can now sign in to your ForcePK account."
    : status === "used"
      ? "This email has already been verified. You can sign in."
      : status === "expired"
        ? "This verification link has expired. Request a new one below."
        : "We couldn't verify this link. Request a new verification email below.";

  return (
    <div className="container-fp flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8 text-center">
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${ok ? "bg-brand/10 text-brand-dark" : "bg-amber-100 text-amber-700"}`}>
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {ok ? <><circle cx="12" cy="12" r="9" /><polyline points="16 9.5 11 15 8 12" /></> : <><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12" y2="16" /></>}
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-navy/60">{message}</p>

        {ok ? (
          <Link href="/login" className="btn-primary mt-6 w-full justify-center">Go to sign in</Link>
        ) : (
          <form action={resendVerification} className="mt-6 space-y-3 text-left">
            <input type="hidden" name="returnTo" value="/verify" />
            <label className="block">
              <span className="text-xs font-medium text-navy/55">Your email</span>
              <input name="email" type="email" required placeholder="you@company.com" className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            </label>
            <button className="btn-primary w-full justify-center">Resend verification email</button>
          </form>
        )}
      </div>
    </div>
  );
}
