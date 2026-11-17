"use client";

import { useEffect, useState } from "react";

/**
 * Command Center single sign-on landing (browser half).
 *
 * Opening /cc-sso from the AI Command Center carries the already-minted admin
 * bearer token in the URL hash (`#cc_auth=<token>&next=<path>`). Hash fragments
 * never reach the server, so the token stays client-side. We POST it to
 * /api/cc-sso, which verifies it and sets the NextAuth session cookie, then we
 * forward to the admin area — no second login. This page sits OUTSIDE the
 * middleware-guarded areas so it can run while signed-out.
 */
function safeNext(raw: string | null): string {
  // Only allow same-origin admin paths; never an absolute URL or protocol-relative //host.
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  return raw.startsWith("/admin") ? raw : "/admin";
}

export default function CommandCenterSso() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const token = params.get("cc_auth");
    const next = safeNext(params.get("next"));
    if (!token) {
      window.location.replace("/login");
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/cc-sso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          window.location.replace(next);
        } else {
          const j = await res.json().catch(() => null);
          setError(j?.error ?? "Sign-in failed. Open the panel again from the Command Center.");
        }
      } catch {
        setError("Could not reach ForcePK. Please try again.");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-950 px-6 text-center">
      <div className="max-w-sm">
        {error ? (
          <>
            <p className="text-sm font-semibold text-rose-400">{error}</p>
            <a href="/login" className="mt-4 inline-block text-xs font-medium text-slate-400 underline">
              Go to sign in
            </a>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 text-sm text-slate-300">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-slate-200" />
            Signing you in…
          </div>
        )}
      </div>
    </div>
  );
}
