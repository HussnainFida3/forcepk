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
        <button onClick={() => setOpen(!open)} className="lg:hidden" aria-label="Menu">
          <Icon name={open ? "snow" : "doc"} className="h-6 w-6 text-navy" />
        </button>
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
            <Link href="/employers#post" onClick={() => setOpen(false)} className="btn-primary mt-2">
              {t("nav.post", locale)}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
