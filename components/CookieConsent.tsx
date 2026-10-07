"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("fpk_cookie_consent")) setShow(true);
    } catch { /* storage blocked */ }
  }, []);

  function decide(value: "all" | "essential") {
    try { localStorage.setItem("fpk_cookie_consent", value); } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl rounded-2xl border border-navy/10 bg-white p-4 shadow-xl sm:left-5 sm:right-auto sm:bottom-5 sm:w-[28rem]">
      <p className="text-sm text-navy/70">
        We use essential cookies to run the platform and a preference cookie for language. With your consent we may use analytics to improve the service. See our{" "}
        <Link href="/privacy" className="font-semibold text-brand">Privacy Policy</Link>.
      </p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => decide("all")} className="btn-primary flex-1 text-xs">Accept all</button>
        <button onClick={() => decide("essential")} className="btn-outline flex-1 text-xs">Essential only</button>
      </div>
    </div>
  );
}
