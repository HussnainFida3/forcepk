"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LangSwitcher from "./LangSwitcher";
import { t, type Locale } from "@/lib/dict";

const nav = [
  { href: "/", key: "nav.home" },
  { href: "/#how", key: "nav.how" },
  { href: "/employers", key: "nav.employers" },
  { href: "/partners", key: "nav.oep" },
  { href: "/jobs", key: "nav.jobs" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
];

export default function Header({ locale = "en" as Locale }: { locale?: Locale }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container-fp flex h-14 items-center justify-between gap-4">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-[11px] font-medium text-ink/80 transition hover:text-brand whitespace-nowrap">
              {t(n.key, locale)}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <LangSwitcher current={locale} />
          <Link href="/login" className="rounded border border-[#8fa4b7] px-3.5 py-1.5 text-[11px] font-semibold text-navy transition hover:border-brand hover:text-brand">
            Sign In
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-lg text-navy" aria-label="Menu" aria-expanded={open}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-navy/10 bg-white lg:hidden">
          <div className="container-fp flex flex-col gap-1 py-3">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy/80 hover:bg-navy/5">
                {t(n.key, locale)}
              </Link>
            ))}
            <div className="px-3 py-2"><LangSwitcher current={locale} /></div>
            <Link href="/login" onClick={() => setOpen(false)}
              className="mt-1 rounded-md border border-[#8fa4b7] px-4 py-2.5 text-center text-sm font-semibold text-navy hover:border-brand hover:text-brand">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
