"use client";

import { useRef, useState } from "react";
import { Search, Briefcase, MapPin, Tag } from "lucide-react";

export type Suggestion = { label: string; kind: "Profession" | "Location" | "Category" };

const KIND_ICON = { Profession: Briefcase, Location: MapPin, Category: Tag } as const;

/**
 * Search box with real-time autocomplete. As you type, matching suggestions
 * (professions, categories, locations) drop down; picking one fires onPick.
 */
export default function SearchSuggest({
  value, onChange, onPick, pool, placeholder = "Search…", autoFocus = false, size = "md",
}: {
  value: string;
  onChange: (v: string) => void;
  onPick: (v: string) => void;
  pool: Suggestion[];
  placeholder?: string;
  autoFocus?: boolean;
  size?: "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = value.trim().toLowerCase();
  const matches = (q
    ? pool.filter((p) => p.label.toLowerCase().includes(q))
    : pool.filter((p) => p.kind !== "Location")
  ).slice(0, 8);

  const pick = (label: string) => {
    onChange(label);
    onPick(label);
    setOpen(false);
    setHi(-1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) setOpen(true);
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); pick(hi >= 0 && matches[hi] ? matches[hi].label : value); }
    else if (e.key === "Escape") setOpen(false);
  };

  const pad = size === "lg" ? "py-3.5 text-[15px]" : "py-2.5 text-sm";

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-3.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <Search className="h-5 w-5 shrink-0 text-navy/40" />
        <input
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setHi(-1); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120); }}
          onKeyDown={onKey}
          placeholder={placeholder}
          className={`w-full bg-transparent outline-none ${pad} text-navy placeholder:text-navy/40`}
          aria-autocomplete="list"
        />
      </div>

      {open && matches.length > 0 && (
        <ul
          className="absolute z-40 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-navy/10 bg-white p-1.5 shadow-2xl"
          onMouseDown={(e) => { e.preventDefault(); if (blurTimer.current) clearTimeout(blurTimer.current); }}
        >
          {!q && <li className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy/35">Popular searches</li>}
          {matches.map((m, i) => {
            const Ic = KIND_ICON[m.kind];
            return (
              <li key={`${m.kind}-${m.label}`}>
                <button
                  type="button"
                  onClick={() => pick(m.label)}
                  onMouseEnter={() => setHi(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${hi === i ? "bg-brand/10 text-navy" : "text-navy/80 hover:bg-navy/5"}`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand"><Ic className="h-4 w-4" /></span>
                  <span className="flex-1 font-medium">{m.label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-navy/35">{m.kind}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
