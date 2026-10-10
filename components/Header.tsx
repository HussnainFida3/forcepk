"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";
import Icon from "./Icon";
import LangSwitcher from "./LangSwitcher";
import ThemeToggle from "./ThemeToggle";
import { t, type Locale } from "@/lib/dict";

const nav = [
  { href: "/", key: "nav.home" },
  { href: "/jobs", key: "nav.jobs" },
  { href: "/employers", key: "nav.employers" },
  { href: "/partners", key: "nav.partners" },
  { href: "/about", key: "nav.about" },
];

export default function Header({ locale = "en" as Locale }: { locale?: Locale }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-navy/10 bg-white/90 backdrop-blur">
      <div className="container-fp flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-navy/80 transition hover:text-brand">
              {t(n.key, locale)}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <LangSwitcher current={locale} />
          <Link href="/login" className="text-sm font-semibold text-navy hover:text-brand">
            {t("nav.login", locale)}
          </Link>
          <Link href="/register" className="btn-outline">
            {t("nav.signup", locale)}
          </Link>
          <Link href="/employers#post" className="btn-primary">
            {t("nav.post", locale)}
          </Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-lg text-navy" aria-label="Menu" aria-expanded={open}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </div>
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
            <div className="mt-1 grid grid-cols-2 gap-2 border-t border-navy/10 pt-3">
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg border border-navy/15 px-3 py-2.5 text-center text-sm font-semibold text-navy hover:border-brand hover:text-brand">
                {t("nav.login", locale)}
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="rounded-lg border border-navy/15 px-3 py-2.5 text-center text-sm font-semibold text-navy hover:border-brand hover:text-brand">
                {t("nav.signup", locale)}
              </Link>
            </div>
            <Link href="/employers#post" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full">
              {t("nav.post", locale)}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
