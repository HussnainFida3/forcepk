import Link from "next/link";
import Icon from "@/components/Icon";
import JobSearch from "@/components/JobSearch";
import { jobs } from "@/lib/data";
import { HERO } from "@/lib/images";

export const metadata = { title: "Find Jobs Worldwide" };

const filters = ["Profession", "Location", "Salary", "Experience", "Employer", "Contract", "Accommodation", "Closing date"];

export default function JobsPage() {
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

      <section className="pb-16">
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
            <JobSearch jobs={jobs} />
          </div>
        </div>
      </section>
    </>
  );
}
