"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Briefcase, Users, CheckCircle2, Search, LayoutGrid } from "lucide-react";
import { JOB_CATEGORIES, type JobCategory } from "@/lib/categories";
import { applyToRequirement } from "@/lib/mutations";

type Req = {
  id: string; title: string; profession: string | null; location: string | null;
  experience: string | null; quantity: number; salary: string | null; refCode: string;
};
type Selection = JobCategory | "other";

const reqText = (r: Req) => `${r.profession ?? ""} ${r.title}`.toLowerCase();
const matchesCat = (r: Req, c: JobCategory) => reqText(r).includes(c.q.toLowerCase());
const matchesNone = (r: Req) => !JOB_CATEGORIES.some((c) => matchesCat(r, c));

export default function CandidateJobBrowser({ reqs, appliedIds }: { reqs: Req[]; appliedIds: string[] }) {
  const [sel, setSel] = useState<Selection | null>(null);
  const applied = useMemo(() => new Set(appliedIds), [appliedIds]);

  const countFor = (c: JobCategory) => reqs.filter((r) => matchesCat(r, c)).length;
  const otherCount = reqs.filter(matchesNone).length;

  if (sel) {
    const isOther = sel === "other";
    const matches = isOther ? reqs.filter(matchesNone) : reqs.filter((r) => matchesCat(r, sel));
    const title = isOther ? "Other Roles" : sel.name;
    const sub = isOther
      ? `${matches.length} open ${matches.length === 1 ? "vacancy" : "vacancies"} not in the main categories`
      : `${matches.length} open ${matches.length === 1 ? "vacancy" : "vacancies"} · ${sel.countries}`;
    return (
      <div className="space-y-5">
        <button onClick={() => setSel(null)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark">
          <ArrowLeft className="h-4 w-4" /> All categories
        </button>
        <div className="flex items-center gap-3">
          {isOther ? (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-navy text-white"><LayoutGrid className="h-6 w-6" /></span>
          ) : (
            <img src={sel.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
          )}
          <div>
            <h2 className="text-xl font-bold text-navy">{title}</h2>
            <p className="text-sm text-navy/55">{sub}</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-12 text-center">
            <Search className="h-10 w-10 text-navy/20" />
            <p className="font-semibold text-navy">No open vacancies here yet</p>
            <p className="max-w-sm text-sm text-navy/55">Complete your profile so employers can find you — we&apos;ll match you as soon as a matching requirement opens.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {matches.map((r) => {
              const has = applied.has(r.id);
              return (
                <div key={r.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-navy">{r.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-dark">{r.profession}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy/60">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{r.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{r.experience ?? "—"}</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{r.quantity} positions</span>
                      {r.salary && <span className="font-semibold text-brand-dark">{r.salary}</span>}
                    </div>
                    <p className="mt-1 text-xs text-navy/40">{r.refCode}</p>
                  </div>
                  {has ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-brand/10 px-4 py-2.5 text-xs font-semibold text-brand-dark"><CheckCircle2 className="h-4 w-4" /> Applied</span>
                  ) : (
                    <form action={applyToRequirement.bind(null, r.id)}>
                      <button className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark">Apply Now <ArrowRight className="h-4 w-4" /></button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {JOB_CATEGORIES.map((c) => {
        const n = countFor(c);
        return (
          <button key={c.slug} onClick={() => setSel(c)} className="group relative block h-32 overflow-hidden rounded-2xl text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
            <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-transparent" />
            {n > 0 && <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow">{n} open</span>}
            <span className="absolute inset-x-0 bottom-0 p-2.5 text-xs font-bold leading-tight text-white drop-shadow">{c.name}</span>
          </button>
        );
      })}
      {/* Other roles */}
      <button onClick={() => setSel("other")} className="group relative flex h-32 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-900 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        {otherCount > 0 && <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white shadow">{otherCount} open</span>}
        <LayoutGrid className="h-7 w-7 text-brand-light" />
        <span className="px-2 text-center text-xs font-bold leading-tight">Other Categories</span>
      </button>
    </div>
  );
}
