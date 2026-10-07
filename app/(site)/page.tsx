import Link from "next/link";
import Icon from "@/components/Icon";
import Faq from "@/components/Faq";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import MatchRing from "@/components/ui/MatchRing";
import { Sparkline } from "@/components/ui/charts";
import { categories, jobs, steps, stats, testimonials, faqs, featuredTalent, brands } from "@/lib/data";
import { getLocale, t } from "@/lib/i18n";
import { createPublicLead } from "@/lib/mutations";
import { HERO, CATEGORY_IMG, jobImg } from "@/lib/images";

function parseStat(v: string): { n: number; suffix: string } {
  const m = v.match(/([\d,]+)(.*)$/);
  return m ? { n: parseInt(m[1].replace(/,/g, ""), 10), suffix: m[2] } : { n: 0, suffix: v };
}

export default function Home({ searchParams }: { searchParams: { sent?: string } }) {
  const locale = getLocale();
  const sent = !!searchParams?.sent;
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <img src={HERO.heroBg} alt="" loading="eager" className="absolute inset-0 h-full w-full scale-105 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/70 to-navy/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/20" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_12%_25%,rgba(34,197,94,0.14),transparent)]" />
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl animate-blob" />
        <div className="container-fp relative py-20 lg:py-32">
          <div className="max-w-2xl animate-fade-up">
            <span className="chip bg-brand/20 text-brand-light shimmer backdrop-blur">{t("hero.badge", locale)}</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight drop-shadow-lg sm:text-5xl lg:text-6xl">
              {t("hero.title1", locale)}{" "}
              <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">{t("hero.title2", locale)}</span>{t("hero.title3", locale)}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85 drop-shadow">
              {t("hero.sub", locale)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/employers#post" className="btn-primary shadow-lg shadow-brand/30">
                {t("hero.cta1", locale)} <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link href="/jobs" className="btn-ghost backdrop-blur">{t("hero.cta2", locale)}</Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
              {stats.slice(0, 3).map((s) => {
                const { n, suffix } = parseStat(s.value);
                return (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-brand-light drop-shadow"><AnimatedNumber value={n} suffix={suffix} /></div>
                    <div className="text-xs text-white/70">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floating chips over the photo */}
          <div className="pointer-events-none absolute right-8 top-24 z-10 hidden items-center gap-2 rounded-xl bg-brand p-3 pr-4 text-white shadow-xl lg:flex">
            <Icon name="shield" className="h-7 w-7" />
            <div><div className="text-base font-extrabold leading-none">10,000+</div><div className="text-[10px] text-white/80">Verified candidates</div></div>
          </div>
          <div className="pointer-events-none absolute bottom-16 right-14 z-10 hidden items-center gap-2 rounded-xl bg-white/95 p-2.5 pr-4 shadow-xl backdrop-blur lg:flex">
            <MatchRing value={94} size={40} />
            <div><div className="text-xs font-bold text-navy">AI Match 94%</div><div className="text-[10px] text-navy/50">Pre-screened · ready to deploy</div></div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="border-t border-white/10 bg-navy-900/40">
          <div className="container-fp grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["shield", "100% Verified Candidates"],
              ["users", "Skilled & Experienced Workforce"],
              ["doc", "Complete Documentation Support"],
              ["check-circle", "Smooth Global Deployment"],
            ].map(([ic, t]) => (
              <div key={t} className="flex items-center gap-3 text-sm text-white/80">
                <Icon name={ic} className="h-5 w-5 text-brand-light" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUIREMENT BAR */}
      <section className="bg-navy-50 py-8">
        <div className="container-fp">
          <div className="card bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><Icon name="users" className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-bold text-navy">Need manpower for your business?</h2>
                <p className="text-sm text-navy/55">Tell us what workforce you need and get matched with verified global talent.</p>
              </div>
            </div>
            {sent ? (
              <div className="mt-4 rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm font-medium text-brand-dark"><Icon name="check-circle" className="mr-1 inline h-5 w-5" /> Thank you! Your requirement has been received. Our team will reach out within 24 hours.</div>
            ) : (
              <form action={createPublicLead} className="mt-4 grid gap-3 md:grid-cols-5">
                <input type="hidden" name="returnTo" value="/" />
                <input name="profession" required placeholder="Profession (e.g. Electrician)" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                <input name="quantity" placeholder="No. of workers" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                <input name="location" placeholder="City / Country" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                <input name="email" type="email" placeholder="Work email" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                <button type="submit" className="btn-primary whitespace-nowrap">Submit Requirement <Icon name="arrow" className="h-4 w-4" /></button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* TRUSTED BY MARQUEE */}
      <section className="border-b border-navy/10 py-8">
        <div className="container-fp">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-navy/40">Trusted by employers worldwide</p>
          <div className="relative mt-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee gap-10">
              {[...brands, ...brands].map((b, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap text-lg font-bold text-navy/30">
                  <Icon name="building" className="h-5 w-5" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container-fp">
          <Heading eyebrow="Manpower Categories" title="Find the workforce you need" sub="Explore our top manpower categories and find the right talent for your business." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((c) => (
              <Link key={c.name} href="/employers#post" className="group relative block h-44 overflow-hidden rounded-2xl shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <img src={CATEGORY_IMG[c.name]} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand shadow-lg"><Icon name={c.icon} className="h-4 w-4" /></span>
                    <h3 className="font-bold leading-tight">{c.name}</h3>
                  </div>
                  <p className="mt-1 text-[11px] text-white/70">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="section bg-navy-50">
        <div className="container-fp">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading eyebrow="Open Positions" title="Featured opportunities worldwide" align="left" />
            <Link href="/jobs" className="btn-outline">View All Jobs <Icon name="arrow" className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {jobs.slice(0, 6).map((j) => (
              <div key={j.id} className="card card-hover flex items-center gap-4 p-4">
                <img src={jobImg(j.title)} alt={j.title} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-navy">{j.title}</h3>
                    <span className="chip">✓ Verified</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/60">
                    <span className="flex items-center gap-1"><Icon name="pin" className="h-3.5 w-3.5" />{j.city}</span>
                    <span className="flex items-center gap-1"><Icon name="briefcase" className="h-3.5 w-3.5" />{j.exp}</span>
                    <span className="flex items-center gap-1"><Icon name="users" className="h-3.5 w-3.5" />{j.positions}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-brand-dark">{j.salary}</p>
                </div>
                <Link href="/jobs" className="btn-primary whitespace-nowrap text-xs">Apply</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TALENT */}
      <section className="section">
        <div className="container-fp">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading eyebrow="Featured Talent" title="Pre-screened, verified, ready to deploy" align="left" />
            <span className="flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white"><Icon name="bolt" className="h-4 w-4 text-brand-light" /> AI-matched</span>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {featuredTalent.map((f) => (
              <div key={f.name} className="card card-hover p-5">
                <div className="flex items-start justify-between">
                  <img src={f.photo} alt={f.name} loading="lazy" className="h-14 w-14 rounded-full object-cover ring-2 ring-brand/30" />
                  <MatchRing value={f.match} />
                </div>
                <h3 className="mt-3 flex items-center gap-1 font-semibold text-navy">{f.name} <Icon name="check-circle" className="h-4 w-4 text-brand" /></h3>
                <p className="text-xs text-navy/55">{f.role} · {f.exp}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-navy/45"><Icon name="pin" className="h-3.5 w-3.5" />{f.city}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {f.skills.map((s) => <span key={s} className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand-dark">{s}</span>)}
                </div>
                <Link href="/employers#post" className="mt-4 block rounded-lg border border-navy/15 py-2 text-center text-xs font-semibold text-navy transition hover:border-brand hover:text-brand">View Profile</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section bg-navy-50">
        <div className="container-fp">
          <Heading eyebrow="Our Process" title="How ForcePK works" sub="A simple, transparent process from requirement to deployment." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">{s.n}</span>
                  <h3 className="font-semibold text-navy">{s.t}</h3>
                </div>
                <p className="mt-3 text-sm text-navy/60">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FORCEPK */}
      <section className="section bg-navy text-white">
        <div className="container-fp grid gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow text-brand-light">Why ForcePK</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">More than a manpower supplier — your global recruitment partner</h2>
            <p className="mt-4 text-white/70">
              We don&apos;t just send CVs. We source, screen, coordinate interviews, support documentation and build a
              continuous talent pipeline for your business.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Qualified Pakistani workforce",
                "Employer-specific screening",
                "Trade testing where required",
                "Fast shortlisting & interviews",
                "Bulk & project recruitment",
                "Documentation & mobilization",
                "Compliance & transparency",
                "Long-term workforce partnership",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2.5 text-sm text-white/85">
                  <Icon name="check-circle" className="mt-0.5 h-5 w-5 shrink-0 text-brand-light" />
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="grid content-center gap-4">
            {[
              ["award", "Performance Focus", "We match candidates to the actual job — not simply the cheapest available worker."],
              ["handshake", "OEP Partner Network", "A verified network of licensed recruitment partners across the world."],
              ["shield", "Built Around Trust", "Verified employers, verified candidates, secure documents — at every step."],
            ].map(([ic, t, d]) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-3">
                  <Icon name={ic} className="h-6 w-6 text-brand-light" />
                  <h3 className="font-semibold">{t}</h3>
                </div>
                <p className="mt-2 text-sm text-white/65">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section">
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

      {/* TESTIMONIALS */}
      <section className="section bg-navy-50">
        <div className="container-fp">
          <Heading eyebrow="Testimonials" title="What our clients & partners say" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card card-hover p-6">
                <div className="flex gap-0.5 text-brand">
                  {Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" className="h-4 w-4" />)}
                </div>
                <p className="mt-4 text-sm text-navy/75">“{t.quote}”</p>
                <div className="mt-5 flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} loading="lazy" className="h-11 w-11 rounded-full object-cover ring-2 ring-brand/20" />
                  <div>
                    <div className="text-sm font-semibold text-navy">{t.name}</div>
                    <div className="text-xs text-navy/55">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container-fp max-w-3xl">
          <Heading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-8 space-y-3">
            {faqs.map((f) => <Faq key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand to-brand-dark">
        <div className="container-fp flex flex-col items-center justify-between gap-6 py-12 text-white sm:flex-row">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to build your workforce?</h2>
            <p className="mt-1 text-white/85">Join thousands of companies and professionals worldwide on ForcePK.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/employers#post" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-dark transition hover:bg-white/90">
              Post Requirement
            </Link>
            <Link href="/partners" className="btn-ghost border-white/50">Become a Partner</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, placeholder, full, name }: { label: string; placeholder: string; full?: boolean; name?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-navy/70">{label}</span>
      <input name={name} placeholder={placeholder}
        className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20" />
    </label>
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
