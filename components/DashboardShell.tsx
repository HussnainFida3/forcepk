"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Icon from "./Icon";
import { doSignOut } from "@/app/actions";

type NavItem = { label: string; icon: string; href: string; active?: boolean };
type Props = {
  nav: readonly NavItem[];
  tag: string;
  user: { initials: string; name: string; role: string };
  search: string;
  searchHref?: string;
  unread?: number;
  children: React.ReactNode;
};

export default function DashboardShell({ nav, tag, user, search, searchHref, unread = 0, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "";

  // Route-based active state: the nav item whose href is the longest prefix of
  // the current path wins (so /admin/companies/123 highlights "Companies", and
  // the dashboard root only highlights on an exact match).
  const activeHref = nav
    .filter((n) => pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const rootHref = nav[0]?.href ?? "/";

  return (
    <div className="min-h-screen bg-navy-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col bg-navy text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <Link href={rootHref} className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-5" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="ForcePK" className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-1" />
          <div className="leading-none">
            <div className="text-sm font-extrabold">
              FORCE<span className="text-brand-light">PK</span>
            </div>
            <div className="mt-0.5 text-[10px] tracking-wide text-white/50">{tag}</div>
          </div>
        </Link>

        {/* Nav (scrolls independently) */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((n) => {
            const isActive = n.href === activeHref;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? "bg-brand text-white shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={n.icon} className="h-5 w-5 shrink-0" />
                <span className="truncate">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white">
            <Icon name="globe" className="h-5 w-5 shrink-0" /> View public site
          </Link>
          <form action={doSignOut}>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white">
              <Icon name="arrow" className="h-5 w-5 shrink-0" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-navy/10 bg-white px-4 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button onClick={() => setOpen(true)} className="shrink-0 lg:hidden" aria-label="Open menu">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-navy" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <form action={searchHref ?? undefined} className="hidden min-w-0 max-w-md flex-1 items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 sm:flex">
              <Icon name="search" className="h-4 w-4 shrink-0 text-navy/40" />
              <input name="q" placeholder={search} className="w-full min-w-0 text-sm outline-none" />
            </form>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/notifications" className="relative" aria-label="Notifications">
              <Icon name="chat" className="h-5 w-5 text-navy/60" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-brand text-[9px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{user.initials}</span>
              <div className="hidden leading-tight sm:block">
                <div className="truncate text-sm font-semibold text-navy">{user.name}</div>
                <div className="text-xs text-navy/50">{user.role}</div>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-5 lg:p-7">{children}</div>
      </div>
    </div>
  );
}
