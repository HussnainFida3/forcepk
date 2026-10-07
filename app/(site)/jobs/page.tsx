import Link from "next/link";
import Icon from "@/components/Icon";
import { jobs } from "@/lib/data";
import { HERO, jobImg } from "@/lib/images";

export const metadata = { title: "Find Jobs Worldwide" };

const filters = ["Profession", "Location", "Salary", "Experience", "Employer", "Contract", "Accommodation", "Closing date"];

export default function JobsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy py-20 text-white lg:py-24">
        <img src={HERO.heroJobs} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
        <div className="container-fp relative">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Find your next opportunity <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">worldwide</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">Browse verified employer vacancies. Build your ForcePK profile and let employers find you.</p>
          <div className="mt-7 grid gap-3 rounded-xl bg-white p-3 text-navy sm:grid-cols-[1fr_1fr_auto]">
            <div className="flex items-center gap-2 rounded-lg border border-navy/15 px-3">
              <Icon name="briefcase" className="h-5 w-5 text-navy/40" />
              <input placeholder="Job title / profession" className="w-full py-2.5 text-sm outline-none" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-navy/15 px-3">
              <Icon name="pin" className="h-5 w-5 text-navy/40" />
              <input placeholder="City / Country" className="w-full py-2.5 text-sm outline-none" />
            </div>
            <button className="btn-primary">Search Jobs <Icon name="arrow" className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-fp grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit card p-5">
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

          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-navy/60">Showing <strong>{jobs.length}</strong> jobs</p>
              <select className="rounded-lg border border-navy/15 px-3 py-2 text-sm">
                <option>Most Relevant</option><option>Newest</option><option>Highest Salary</option>
              </select>
            </div>
            <div className="mt-5 space-y-4">
              {jobs.map((j) => (
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
        </div>
      </section>
    </>
  );
}
