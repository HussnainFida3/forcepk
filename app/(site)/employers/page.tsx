import Link from "next/link";
import Icon from "@/components/Icon";
import { categories } from "@/lib/data";
import { createPublicLead } from "@/lib/mutations";
import { HERO } from "@/lib/images";

export const metadata = { title: "Hire Verified Global Manpower" };

const benefits = [
  ["shield", "Access to verified global talent"],
  ["clock", "Save time & recruitment costs"],
  ["users", "AI-powered candidate matching"],
  ["doc", "End-to-end recruitment support"],
  ["handshake", "Trusted recruitment partner network"],
  ["check-circle", "Secure & transparent process"],
];

const text: [string, string, string][] = [
  ["Profession", "Electrician", "profession"], ["Quantity", "30", "quantity"], ["Gender", "Male", "gender"],
  ["Age range", "22 – 40", "age"], ["Experience", "2 – 5 years", "experience"], ["Education", "High School / Diploma", "education"],
  ["Salary (USD)", "1,800 – 2,500", "salary"], ["Location", "Dubai, UAE", "location"], ["Work email", "you@company.com", "email"],
];
const selects: [string, string[]][] = [
  ["Accommodation", ["Provided", "Not provided", "Allowance"]],
  ["Food", ["Provided", "Not provided", "Allowance"]],
  ["Transport", ["Provided", "Not provided", "Allowance"]],
  ["Working hours", ["8 hrs/day", "10 hrs/day", "12 hrs/day"]],
  ["Contract duration", ["1 year", "2 years", "3 years"]],
  ["Interview method", ["Online", "In-person", "Online / In-person"]],
];

export default function EmployersPage({ searchParams }: { searchParams: { sent?: string } }) {
  const sent = !!searchParams?.sent;
  return (
    <>
      <section className="relative overflow-hidden bg-navy py-20 text-white lg:py-24">
        <img src={HERO.heroEmployers} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/92 to-navy/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
        <div className="container-fp relative grid gap-10 lg:grid-cols-2">
          <div>
            <span className="chip bg-brand/20 text-brand-light">For Employers</span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Hire verified global manpower for your business</h1>
            <p className="mt-4 text-white/70">Post your requirement and get matched with skilled, screened and deployment-ready candidates — managed end to end by ForcePK.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {benefits.map(([ic, t]) => (
                <div key={t} className="flex items-center gap-2.5 text-sm text-white/85">
                  <Icon name={ic} className="h-5 w-5 text-brand-light" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="grid content-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold">Why companies choose ForcePK</h2>
            {[["10,000+", "Candidates in our talent pool"], ["50+", "Verified recruitment partners"], ["98%", "Selection accuracy"], ["24h", "Average response time"]].map(([v, l]) => (
              <div key={l} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
                <span className="text-sm text-white/70">{l}</span>
                <span className="text-xl font-bold text-brand-light">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories strip */}
      <section className="border-b border-navy/10 py-10">
        <div className="container-fp">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-navy/50">Manpower we recruit</h2>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {categories.map((c) => (
              <span key={c.name} className="inline-flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm text-navy/70">
                <Icon name={c.icon} className="h-4 w-4 text-brand" /> {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* POST REQUIREMENT FORM */}
      <section id="post" className="section bg-navy-50">
        <div className="container-fp max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Create Requirement</span>
            <h2 className="mt-2 h2">Post your manpower requirement</h2>
            <p className="mt-3 text-navy/60">Fill in the details below. ForcePK verifies your requirement and starts sourcing matched candidates.</p>
          </div>

          {sent ? (
            <div className="card mt-10 flex flex-col items-center justify-center gap-2 p-12 text-center">
              <Icon name="check-circle" className="h-12 w-12 text-brand" />
              <p className="text-lg font-semibold text-navy">Requirement received!</p>
              <p className="text-sm text-navy/60">Thank you — our recruitment team will reach out within 24 hours with matched candidates.</p>
              <Link href="/" className="btn-outline mt-3">Back to home</Link>
            </div>
          ) : (
          <form action={createPublicLead} className="card mt-10 grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <input type="hidden" name="returnTo" value="/employers" />
            {text.map(([l, ph, name]) => (
              <label key={l} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-navy/70">{l}</span>
                <input name={name} placeholder={ph} className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              </label>
            ))}
            {selects.map(([l, opts]) => (
              <label key={l} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-navy/70">{l}</span>
                <select name={l.toLowerCase().replace(/\s/g, "_")} className="rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">
                  {opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </label>
            ))}
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-navy/70">Special requirements</span>
              <textarea name="message" rows={3} placeholder="e.g. Must have valid GCC experience. Knowledge of safety standards is a plus." className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            </label>
            <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-navy/50">Need help? <Link href="/about#contact" className="font-semibold text-brand">Talk to ForcePK</Link></p>
              <button type="submit" className="btn-primary">Submit Requirement <Icon name="arrow" className="h-4 w-4" /></button>
            </div>
          </form>
          )}
        </div>
      </section>
    </>
  );
}
