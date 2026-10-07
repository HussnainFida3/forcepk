"use client";

import Link from "next/link";
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
  return (
    <div className="min-h-screen bg-navy-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-navy text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor"><path d="M4 3h15l-3 4H9v3h6l-3 4H9v7H4z" /></svg>
          </span>
          <div className="leading-none">
            <div className="text-sm font-extrabold">FORCE<span className="text-brand-light">PK</span></div>
            <div className="text-[10px] text-white/50">{tag}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((n) => (
            <Link key={n.label} href={n.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${n.active ? "bg-brand text-white" : "text-white/70 hover:bg-white/10"}`}>
              <Icon name={n.icon} className="h-5 w-5" /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-white/10 p-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/10">
            <Icon name="globe" className="h-5 w-5" /> View public site
          </Link>
          <form action={doSignOut}>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:bg-white/10">
              <Icon name="arrow" className="h-5 w-5" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-navy/10 bg-white px-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden" aria-label="Menu">
              <Icon name="doc" className="h-6 w-6 text-navy" />
            </button>
            <form action={searchHref ?? undefined} className="hidden items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 sm:flex">
              <Icon name="search" className="h-4 w-4 text-navy/40" />
              <input name="q" placeholder={search} className="w-72 text-sm outline-none" />
            </form>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/notifications" className="relative" aria-label="Notifications">
              <Icon name="chat" className="h-5 w-5 text-navy/60" />
              {unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-brand text-[9px] font-bold text-white">{unread}</span>}
            </Link>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-bold text-white">{user.initials}</span>
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-semibold text-navy">{user.name}</div>
                <div className="text-xs text-navy/50">{user.role}</div>
              </div>
            </div>
          </div>
        </header>
        <div className="p-5 lg:p-7">{children}</div>
      </div>
    </div>
  );
}
