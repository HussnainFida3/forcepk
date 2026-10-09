"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { jobImg } from "@/lib/images";

type Job = { id: string; title: string; city: string; exp: string; positions: number; salary: string };

export default function JobSearch({ jobs, initialQuery = "" }: { jobs: readonly Job[]; initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [loc, setLoc] = useState("");
  const [sort, setSort] = useState("relevant");
  const [openList, setOpenList] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Unique profession + location suggestions for the autocomplete.
  const professions = useMemo(() => Array.from(new Set(jobs.map((j) => j.title))), [jobs]);
  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    return professions.filter((p) => !term || p.toLowerCase().includes(term)).slice(0, 8);
  }, [professions, q]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const place = loc.trim().toLowerCase();
    let list = jobs.filter(
      (j) =>
        (!term || j.title.toLowerCase().includes(term)) &&
        (!place || j.city.toLowerCase().includes(place)),
    );
    if (sort === "salary") {
      const n = (s: string) => parseInt(s.replace(/[^\d]/g, "").slice(0, 5) || "0", 10);
      list = [...list].sort((a, b) => n(b.salary) - n(a.salary));
    }
    return list;
  }, [jobs, q, loc, sort]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative z-20 -mt-10 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-navy/5 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          {/* Profession combobox */}
          <div className="relative" ref={boxRef}>
            <div className="flex items-center gap-2 rounded-lg border border-navy/15 px-3 focus-within:border-brand">
              <Icon name="briefcase" className="h-5 w-5 shrink-0 text-navy/40" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setOpenList(true); }}
                onFocus={() => setOpenList(true)}
                onBlur={() => setTimeout(() => setOpenList(false), 150)}
                placeholder="Job title / profession"
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
              {q && <button onMouseDown={(e) => { e.preventDefault(); setQ(""); }} className="text-navy/30 hover:text-navy/60" aria-label="Clear">✕</button>}
            </div>
            {openList && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-xl border border-navy/10 bg-white py-1 shadow-xl">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); setQ(s); setOpenList(false); }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-brand/5"
                    >
                      <span className="flex items-center gap-2.5 text-navy"><Icon name="briefcase" className="h-4 w-4 text-brand" /> {s}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-navy/35">Profession</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 rounded-lg border border-navy/15 px-3 focus-within:border-brand">
            <Icon name="pin" className="h-5 w-5 shrink-0 text-navy/40" />
            <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City / Country" className="w-full bg-transparent py-2.5 text-sm outline-none" />
          </div>

          <button onClick={() => setOpenList(false)} className="btn-primary whitespace-nowrap">
            <Icon name="search" className="h-4 w-4" /> Search
          </button>
        </div>
      </div>

      {/* Results header */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-navy/60">Showing <strong>{results.length}</strong> of {jobs.length} jobs</p>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
          <option value="relevant">Most Relevant</option>
          <option value="salary">Highest Salary</option>
        </select>
      </div>

      {/* Results */}
      <div className="mt-5 space-y-4">
        {results.length === 0 && (
          <div className="card grid place-items-center gap-2 p-12 text-center">
            <Icon name="search" className="h-8 w-8 text-navy/25" />
            <p className="font-semibold text-navy">No jobs match your search</p>
            <p className="text-sm text-navy/55">Try a different profession or location, or clear the filters.</p>
            <button onClick={() => { setQ(""); setLoc(""); }} className="mt-1 text-sm font-semibold text-brand">Clear search</button>
          </div>
        )}
        {results.map((j) => (
          <div key={j.id} className="card card-hover flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <img src={jobImg(j.title)} alt={j.title} loading="lazy" className="h-28 w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-32" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-navy">{j.title}</h3>
                <span className="chip">✓ Verified Employer</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-navy/60">
                <span className="flex items-center gap-1"><Icon name="pin" className="h-4 w-4" />{j.city}</span>
                <span className="flex items-center gap-1"><Icon name="briefcase" className="h-4 w-4" />{j.exp}</span>
                <span className="flex items-center gap-1"><Icon name="users" className="h-4 w-4" />{j.positions} positions</span>
                <span className="font-semibold text-brand-dark">{j.salary}</span>
              </div>
              <p className="mt-1 text-xs text-navy/40">Job ID: {j.id}</p>
            </div>
            <Link href="/login" className="btn-primary whitespace-nowrap">Apply Now <Icon name="arrow" className="h-4 w-4" /></Link>
          </div>
        ))}
      </div>
    </div>
  );
}
