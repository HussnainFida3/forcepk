import Link from "next/link";
import {
  ShieldCheck, Users, FileText, CheckCircle2, ArrowRight, MapPin, Briefcase, Star,
  Building2, Award, Handshake, Globe, Sparkles, UserCheck, ClipboardList, Plane,
  HardHat, Zap, Wind, Flame, Truck, Ruler, Factory, Stethoscope, Wrench, Search, Clock,
  type LucideIcon,
} from "lucide-react";
import Faq from "@/components/Faq";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import MatchRing from "@/components/ui/MatchRing";
import { Sparkline } from "@/components/ui/charts";
import { categories, jobs, steps, stats, testimonials, faqs, featuredTalent } from "@/lib/data";
import { getLocale, t } from "@/lib/i18n";
import { createPublicLead } from "@/lib/mutations";
import { HERO, CATEGORY_IMG, jobImg } from "@/lib/images";
import { EMPLOYER_BRANDS, brandLogo } from "@/lib/brands";

function parseStat(v: string): { n: number; suffix: string } {
  const m = v.match(/([\d,]+)(.*)$/);
  return m ? { n: parseInt(m[1].replace(/,/g, ""), 10), suffix: m[2] } : { n: 0, suffix: v };
}

const CAT_ICON: Record<string, LucideIcon> = {
  Construction: HardHat, Electrical: Zap, HVAC: Wind, Welding: Flame,
  "Heavy Equipment": Truck, Drivers: Truck, Engineering: Ruler, Industrial: Factory,
  Healthcare: Stethoscope, Facilities: Wrench,
};

const WHY: { Icon: LucideIcon; title: string; body: string }[] = [
  { Icon: ShieldCheck, title: "100% Verified Candidates", body: "Every worker is background-checked, skill-tested and document-verified before deployment." },
  { Icon: UserCheck, title: "Employer-Specific Screening", body: "We match candidates to your exact role and standards — not just the cheapest available." },
  { Icon: Globe, title: "Licensed OEP Network", body: "A verified network of recruitment partners sourcing talent across 20+ countries." },
  { Icon: ClipboardList, title: "End-to-End Documentation", body: "Visas, medicals, trade tests and attestation handled — mobilization made simple." },
  { Icon: Sparkles, title: "AI-Powered Matching", body: "Our engine scores every candidate against your requirement for the strongest fit." },
  { Icon: Handshake, title: "Long-Term Partnership", body: "A continuous talent pipeline and dedicated support, not a one-off CV dump." },
];

const STEP_ICONS: LucideIcon[] = [ClipboardList, Users, UserCheck, Plane];

export default function Home({ searchParams }: { searchParams: { sent?: string } }) {
  const locale = getLocale();
  const sent = !!searchParams?.sent;
  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img src={HERO.heroBg} alt="" loading="eager" className="absolute inset-0 h-full w-full scale-105 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/92 to-navy/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-navy/30" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_15%_20%,rgba(34,197,94,0.16),transparent)]" />

        <div className="container-fp relative grid items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-light" /> {t("hero.badge", locale)}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight drop-shadow-sm sm:text-5xl lg:text-[3.4rem]">
              {t("hero.title1", locale)}{" "}
              <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">{t("hero.title2", locale)}</span>{t("hero.title3", locale)}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{t("hero.sub", locale)}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/employers#post" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark">
                {t("hero.cta1", locale)} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/jobs" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white/10">
                <Search className="h-4 w-4" /> {t("hero.cta2", locale)}
              </Link>
            </div>

            <ul className="mt-9 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
              {[[ShieldCheck, "Verified"], [Clock, "Fast Deploy"], [FileText, "Full Docs"], [Globe, "Worldwide"]].map(([I, label]) => {
                const Ic = I as LucideIcon;
                return (
                  <li key={label as string} className="flex items-center gap-2 text-[13px] font-medium text-white/80">
                    <Ic className="h-4 w-4 text-brand-light" /> {label as string}
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-7">
              {stats.slice(0, 3).map((s) => {
                const { n, suffix } = parseStat(s.value);
                return (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-brand-light sm:text-3xl"><AnimatedNumber value={n} suffix={suffix} /></div>
                    <div className="mt-1 text-xs text-white/60">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live talent card */}
          <div className="relative hidden lg:block animate-fade-up [animation-delay:120ms]">
            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white"><ShieldCheck className="h-6 w-6" /></span>
                  <div><div className="text-lg font-bold leading-none">10,000+</div><div className="text-xs text-white/60">Verified candidates</div></div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/20 px-3 py-1 text-xs font-semibold text-brand-light"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-light" /> Live</span>
              </div>
              <div className="mt-6 space-y-3">
                {featuredTalent.slice(0, 4).map((f) => (
                  <div key={f.name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10">
                    <img src={f.photo} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-brand/30" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 truncate text-sm font-semibold">{f.name} <CheckCircle2 className="h-3.5 w-3.5 text-brand-light" /></div>
                      <div className="truncate text-xs text-white/55">{f.role} · {f.city}</div>
                    </div>
                    <MatchRing value={f.match} size={40} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TRUSTED BY (real company logos) ───────── */}
      <section className="border-b border-navy/10 bg-white py-10">
        <div className="container-fp">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-navy/45">Trusted by leading employers worldwide</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {EMPLOYER_BRANDS.map((b) => (
              <div key={b.domain} className="flex items-center gap-2.5 rounded-xl border border-navy/10 bg-white px-3.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <img src={brandLogo(b.domain)} alt={b.name} loading="lazy" className="h-7 w-7 shrink-0 rounded object-contain" />
                <span className="truncate text-sm font-semibold text-navy/70">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── REQUIREMENT BAR ───────── */}
      <section className="bg-navy-50 py-10">
        <div className="container-fp">
          <div className="card bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><Users className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-bold text-navy">Need manpower for your business?</h2>
                <p className="text-sm text-navy/55">Tell us what workforce you need and get matched with verified global talent.</p>
              </div>
            </div>
            {sent ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm font-medium text-brand-dark"><CheckCircle2 className="h-5 w-5" /> Thank you! Your requirement has been received. Our team will reach out within 24 hours.</div>
            ) : (
              <form action={createPublicLead} className="mt-4 grid gap-3 md:grid-cols-5">
                <input type="hidden" name="returnTo" value="/" />
                <input name="profession" required placeholder="Profession (e.g. Electrician)" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                <input name="quantity" placeholder="No. of workers" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                <input name="location" placeholder="City / Country" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                <input name="email" type="email" placeholder="Work email" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                <button type="submit" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark">Submit <ArrowRight className="h-4 w-4" /></button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ───────── CATEGORIES ───────── */}
      <section className="section">
        <div className="container-fp">
          <Heading eyebrow="Manpower Categories" title="Find the workforce you need" sub="Explore our top manpower categories and find the right talent for your business." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((c) => {
              const Ic = CAT_ICON[c.name] ?? Building2;
              return (
                <Link key={c.name} href="/employers#post" className="group relative block h-44 overflow-hidden rounded-2xl shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <img src={CATEGORY_IMG[c.name]} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-center gap-2 text-white">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand shadow-lg"><Ic className="h-4 w-4" /></span>
                      <h3 className="font-bold leading-tight">{c.name}</h3>
                    </div>
                    <p className="mt-1 text-[11px] text-white/75">{c.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── WHY FORCEPK ───────── */}
      <section className="section bg-navy-50">
        <div className="container-fp">
          <Heading eyebrow="Why ForcePK" title="More than a supplier — your recruitment partner" sub="Verified people, AI matching and full documentation support on every placement." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((w) => (
              <article key={w.title} className="group card card-hover p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand transition group-hover:scale-110"><w.Icon className="h-6 w-6" /></span>
                <h3 className="mt-4 text-[17px] font-bold text-navy">{w.title}</h3>
                <p className="mt-2 text-sm leading-6 text-navy/60">{w.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FEATURED JOBS ───────── */}
      <section className="section">
        <div className="container-fp">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading eyebrow="Open Positions" title="Featured opportunities worldwide" align="left" />
            <Link href="/jobs" className="btn-outline">View All Jobs <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {jobs.slice(0, 6).map((j) => (
              <div key={j.id} className="card card-hover flex items-center gap-4 p-4">
                <img src={jobImg(j.title)} alt={j.title} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-navy">{j.title}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand-dark"><CheckCircle2 className="h-3 w-3" /> Verified</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{j.city}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{j.exp}</span>
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{j.positions}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-brand-dark">{j.salary}</p>
                </div>
                <Link href="/jobs" className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-dark">Apply</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FEATURED TALENT ───────── */}
      <section className="section bg-navy-50">
        <div className="container-fp">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading eyebrow="Featured Talent" title="Pre-screened, verified, ready to deploy" align="left" />
            <span className="inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white"><Sparkles className="h-4 w-4 text-brand-light" /> AI-matched</span>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {featuredTalent.map((f) => (
              <div key={f.name} className="card card-hover p-5">
                <div className="flex items-start justify-between">
                  <img src={f.photo} alt={f.name} loading="lazy" className="h-14 w-14 rounded-full object-cover ring-2 ring-brand/30" />
                  <MatchRing value={f.match} />
                </div>
                <h3 className="mt-3 flex items-center gap-1 font-semibold text-navy">{f.name} <CheckCircle2 className="h-4 w-4 text-brand" /></h3>
                <p className="text-xs text-navy/55">{f.role} · {f.exp}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-navy/45"><MapPin className="h-3.5 w-3.5" />{f.city}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {f.skills.map((s) => <span key={s} className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand-dark">{s}</span>)}
                </div>
                <Link href="/employers#post" className="mt-4 block rounded-lg border border-navy/15 py-2 text-center text-xs font-semibold text-navy transition hover:border-brand hover:text-brand">View Profile</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section id="how" className="section">
        <div className="container-fp">
          <Heading eyebrow="Our Process" title="How ForcePK works" sub="A simple, transparent process from requirement to deployment." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.slice(0, 4).map((s, i) => {
              const Ic = STEP_ICONS[i % STEP_ICONS.length];
              return (
                <div key={s.n} className="relative card p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand"><Ic className="h-6 w-6" /></span>
                  <span className="absolute right-5 top-5 text-3xl font-black text-navy/10">{s.n}</span>
                  <h3 className="mt-4 font-bold text-navy">{s.t}</h3>
                  <p className="mt-2 text-sm text-navy/60">{s.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── STATS ───────── */}
      <section className="section bg-navy-50">
        <div className="container-fp">
          <div className="relative overflow-hidden rounded-3xl bg-navy p-8 sm:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(50%_80%_at_50%_0%,rgba(34,197,94,0.25),transparent)]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl animate-blob-slow" />
            <div className="relative grid gap-8 sm:grid-cols-4">
              {stats.map((s, i) => {
                const { n, suffix } = parseStat(s.value);
                return (
                  <div key={s.label} className="text-center">
                    <div className="text-4xl font-extrabold text-white sm:text-5xl"><AnimatedNumber value={n} suffix={suffix} /></div>
                    <div className="mt-1 text-sm text-white/60">{s.label}</div>
                    <div className="mx-auto mt-3 flex justify-center">
                      <Sparkline data={[3, 5, 4, 7, 6, 9, 8, 11].map((x) => x + i)} color="#22c55e" className="h-6 w-24" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TESTIMONIALS ───────── */}
      <section className="section">
        <div className="container-fp">
          <Heading eyebrow="Testimonials" title="What our clients & partners say" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((tm) => (
              <div key={tm.name} className="card card-hover p-6">
                <div className="flex gap-0.5 text-brand">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="mt-4 text-sm text-navy/75">&ldquo;{tm.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={tm.avatar} alt={tm.name} loading="lazy" className="h-11 w-11 rounded-full object-cover ring-2 ring-brand/20" />
                  <div>
                    <div className="text-sm font-semibold text-navy">{tm.name}</div>
                    <div className="text-xs text-navy/55">{tm.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="section bg-navy-50">
        <div className="container-fp max-w-3xl">
          <Heading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-8 space-y-3">
            {faqs.map((f) => <Faq key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="bg-gradient-to-r from-brand to-brand-dark">
        <div className="container-fp flex flex-col items-center justify-between gap-6 py-14 text-white sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to build your workforce?</h2>
            <p className="mt-1 text-white/85">Join thousands of companies and professionals worldwide on ForcePK.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/employers#post" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-dark transition hover:-translate-y-0.5 hover:bg-white/90">
              Post Requirement <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/partners" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/50 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">Become a Partner</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Heading({ eyebrow, title, sub, align = "center" }: { eyebrow: string; title: string; sub?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-2 h2">{title}</h2>
      {sub && <p className="mt-3 text-navy/60">{sub}</p>}
    </div>
  );
}
