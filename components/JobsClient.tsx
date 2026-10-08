"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Search, ArrowRight, Users, FileText, X } from "lucide-react";
import { jobs, categories } from "@/lib/data";
import { HERO, jobImg } from "@/lib/images";
import SearchSuggest, { type Suggestion } from "@/components/SearchSuggest";

function salaryNum(s: string): number {
  const m = s.replace(/,/g, "").match(/\d+/g);
  return m ? Math.max(...m.map(Number)) : 0;
}

const SORTS = ["Most Relevant", "Highest Salary", "Most Positions"] as const;

export default function JobsClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [loc, setLoc] = useState("");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Most Relevant");

  const pool = useMemo<Suggestion[]>(() => {
    const profs = new Set(jobs.map((j) => j.title));
    const cats = new Set(categories.map((c) => c.name));
    const cities = new Set(jobs.map((j) => j.city));
    return [
      ...[...profs].map((label) => ({ label, kind: "Profession" as const })),
      ...[...cats].map((label) => ({ label, kind: "Category" as const })),
      ...[...cities].map((label) => ({ label, kind: "Location" as const })),
    ];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const l = loc.trim().toLowerCase();
    let r = jobs.filter(
      (j) =>
        (!q || j.title.toLowerCase().includes(q)) &&
        (!l || j.city.toLowerCase().includes(l)),
    );
    if (sort === "Highest Salary") r = [...r].sort((a, b) => salaryNum(b.salary) - salaryNum(a.salary));
    else if (sort === "Most Positions") r = [...r].sort((a, b) => Number(b.positions) - Number(a.positions));
    return r;
  }, [query, loc, sort]);

  const clear = () => { setQuery(""); setLoc(""); };

  return (
    <>
      {/* HERO + SEARCH */}
      <section className="relative overflow-hidden bg-navy py-20 text-white lg:py-24">
        <img src={HERO.heroJobs} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
        <div className="container-fp relative">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Find your next opportunity <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">worldwide</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">Browse verified employer vacancies. Build your ForcePK profile and let employers find you.</p>
          <div className="relative z-20 mt-7 grid gap-3 rounded-xl bg-white p-3 text-navy sm:grid-cols-[1.3fr_1fr_auto]">
            <SearchSuggest value={query} onChange={setQuery} onPick={setQuery} pool={pool} placeholder="Job title / profession" />
            <div className="flex items-center gap-2 rounded-xl border border-navy/15 px-3.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <MapPin className="h-5 w-5 text-navy/40" />
              <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City / Country" className="w-full py-2.5 text-sm outline-none" />
            </div>
            <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark">
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-fp grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit card p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-navy"><FileText className="h-5 w-5 text-brand" /> Filters</h2>
              {(query || loc) && <button onClick={clear} className="flex items-center gap-1 text-xs font-semibold text-brand"><X className="h-3 w-3" /> Clear</button>}
            </div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-navy/60">Profession</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Electrician" className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-navy/60">Location</span>
                <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="e.g. Dubai" className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              </label>
            </div>
            <div className="mt-5 rounded-xl bg-brand/5 p-4">
              <p className="text-sm font-semibold text-navy">Don&apos;t see the right job?</p>
              <p className="mt-1 text-xs text-navy/60">Create your ForcePK profile and let employers find you.</p>
              <Link href="/register" className="btn-primary mt-3 w-full text-xs">Create Your Profile</Link>
            </div>
          </aside>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy/60">Showing <strong>{results.length}</strong> of {jobs.length} jobs</p>
              <select value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])} className="rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand">
                {SORTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-5 space-y-4">
              {results.map((j) => (
                <div key={j.id} className="card card-hover flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <img src={jobImg(j.title)} alt={j.title} loading="lazy" className="h-28 w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-32" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-navy">{j.title}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-dark">✓ Verified Employer</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-navy/60">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{j.city}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{j.exp}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{j.positions} positions</span>
                      <span className="font-semibold text-brand-dark">{j.salary}</span>
                    </div>
                    <p className="mt-1 text-xs text-navy/40">Job ID: {j.id}</p>
                  </div>
                  <Link href="/login" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark">Apply Now <ArrowRight className="h-4 w-4" /></Link>
                </div>
              ))}
              {results.length === 0 && (
                <div className="card flex flex-col items-center gap-2 p-12 text-center">
                  <Search className="h-10 w-10 text-navy/20" />
                  <p className="font-semibold text-navy">No jobs match your search</p>
                  <p className="text-sm text-navy/55">Try a different profession or location.</p>
                  <button onClick={clear} className="btn-outline mt-2">Clear filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
