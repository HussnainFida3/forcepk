import Link from "next/link";
import { Plus } from "lucide-react";
import Icon from "@/components/Icon";
import JobSearch from "@/components/JobSearch";
import { jobs } from "@/lib/data";
import { HERO } from "@/lib/images";
import { JOB_CATEGORIES } from "@/lib/categories";

export const metadata = { title: "Find Jobs Worldwide" };

const filters = ["Profession", "Location", "Salary", "Experience", "Employer", "Contract", "Accommodation", "Closing date"];

export default function JobsPage({ searchParams }: { searchParams: { q?: string } }) {
  return (
    <>
      <section className="relative overflow-hidden bg-navy pb-16 pt-20 text-white lg:pt-24">
        <img src={HERO.heroJobs} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
        <div className="container-fp relative">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Find your next opportunity <span className="text-brand-light">worldwide</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">Browse verified employer vacancies. Build your ForcePK profile and let employers find you.</p>
        </div>
      </section>

      {/* Browse by category */}
      <section className="border-b border-navy/10 py-12">
        <div className="container-fp">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Browse by category</span>
            <h2 className="mt-2 h2">Find talent by profession</h2>
            <p className="mt-3 text-navy/60">Pick a category to see matching openings, or post a requirement for anything else.</p>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {JOB_CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/jobs?q=${encodeURIComponent(c.q)}`} className="group relative block h-28 overflow-hidden rounded-xl shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-2.5 text-[11px] font-bold leading-tight text-white drop-shadow">{c.name}</span>
              </Link>
            ))}
            <Link href="/employers#post" className="group flex h-28 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-navy/20 bg-navy-50 text-navy/55 transition hover:border-brand hover:bg-brand/5 hover:text-brand">
              <Plus className="h-6 w-6" />
              <span className="text-xs font-bold">Other / Not listed</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16 pt-12">
        <div className="container-fp grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="order-2 h-fit card p-5 lg:order-1 lg:mt-14">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="doc" className="h-5 w-5 text-brand" /> Filters</h2>
              <button className="text-xs font-semibold text-brand">Clear All</button>
            </div>
            <ul className="mt-4 divide-y divide-navy/10">
              {filters.map((f) => (
                <li key={f}>
                  <button className="flex w-full items-center justify-between py-3 text-sm text-navy/75">
                    {f} <Icon name="chevron" className="h-4 w-4 text-navy/40" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-brand/5 p-4">
              <p className="text-sm font-semibold text-navy">Don&apos;t see the right job?</p>
              <p className="mt-1 text-xs text-navy/60">Create your ForcePK profile and let employers find you.</p>
              <Link href="/login" className="btn-primary mt-3 w-full text-xs">Create Your Profile</Link>
            </div>
          </aside>

          <div className="order-1 lg:order-2">
            <JobSearch jobs={jobs} initialQuery={searchParams?.q ?? ""} />
          </div>
        </div>
      </section>
    </>
  );
}
