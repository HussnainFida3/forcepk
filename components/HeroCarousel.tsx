"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, type LucideIcon, Building2, UserRound, Handshake } from "lucide-react";
import { HERO } from "@/lib/images";

type Slide = {
  key: string;
  image: string;
  Icon: LucideIcon;
  tag: string;
  lead: string;
  big: string;
  tail: string;
  sub: string;
  cta: { label: string; href: string };
  portal: { label: string; href: string };
  stat: { value: string; label: string };
};

const SLIDES: Slide[] = [
  {
    key: "employers",
    image: HERO.heroEmployers,
    Icon: Building2,
    tag: "Employers",
    lead: "Build your",
    big: "workforce",
    tail: "without the guesswork.",
    sub: "Post one requirement and we mobilise verified, trade-tested talent — visas, medicals and documentation handled end to end.",
    cta: { label: "Post a requirement", href: "/employers#post" },
    portal: { label: "Employer portal", href: "/employer" },
    stat: { value: "48h", label: "Avg. first shortlist" },
  },
  {
    key: "candidates",
    image: HERO.heroJobs,
    Icon: UserRound,
    tag: "Candidates",
    lead: "Take your skills",
    big: "worldwide",
    tail: "with people who back you.",
    sub: "Browse real employer vacancies across the Gulf and beyond, apply in one click, and let verified employers come to you.",
    cta: { label: "Find jobs", href: "/jobs" },
    portal: { label: "Candidate portal", href: "/candidate" },
    stat: { value: "20+", label: "Countries hiring" },
  },
  {
    key: "partners",
    image: HERO.heroPartners,
    Icon: Handshake,
    tag: "OEP Partners",
    lead: "Turn demand into",
    big: "deployments",
    tail: "from one command center.",
    sub: "Join our licensed partner network, receive live matched requirements, and manage every placement through a shared CRM.",
    cta: { label: "Become a partner", href: "/partners" },
    portal: { label: "Partner portal", href: "/partner" },
    stat: { value: "50+", label: "Verified partners" },
  },
];

const DURATION = 5500;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => setActive((i + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), DURATION);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, active]);

  return (
    <section
      className="hero-grain relative overflow-hidden bg-navy-900 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Who ForcePK serves"
    >
      {/* Sliding image track */}
      <div
        className="absolute inset-0 flex transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ width: `${SLIDES.length * 100}%`, transform: `translateX(-${active * (100 / SLIDES.length)}%)` }}
        aria-hidden
      >
        {SLIDES.map((s, i) => (
          <div key={s.key} className="relative h-full" style={{ width: `${100 / SLIDES.length}%` }}>
            <img
              src={s.image}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              className={`h-full w-full object-cover ${i === active ? "animate-ken" : "scale-110"}`}
            />
          </div>
        ))}
      </div>

      {/* Duotone + directional shade */}
      <div className="absolute inset-0 bg-[linear-gradient(105deg,#081a30_8%,rgba(8,26,48,0.82)_42%,rgba(8,26,48,0.30)_78%,rgba(22,163,74,0.28)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-navy-900/40" />
      {/* animated accent blobs */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand/25 blur-3xl animate-blob-slow" />
      <div className="pointer-events-none absolute right-10 bottom-24 h-80 w-80 rounded-full bg-brand/10 blur-3xl animate-blob" />

      {/* Content */}
      <div className="container-fp relative z-[2] flex min-h-[92vh] flex-col justify-center py-24 lg:min-h-screen">
        {/* giant ghost index */}
        <span
          key={`idx-${active}`}
          className="animate-fade-up pointer-events-none absolute right-2 top-16 select-none font-display text-[26vw] font-black leading-none text-white/[0.05] lg:top-24 lg:text-[16rem]"
        >
          0{active + 1}
        </span>

        <div key={active} className="hero-rise max-w-3xl">
          <span className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-brand-light">
            <span className="h-px w-10 bg-brand-light" />
            ForcePK for {SLIDES[active].tag}
          </span>

          <h1 className="mt-6 font-display text-[2.6rem] font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-[4.6rem]">
            {SLIDES[active].lead}{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-br from-brand-light via-brand to-brand-dark bg-clip-text text-transparent">{SLIDES[active].big}</span>
              <span className="absolute -bottom-1 left-0 h-[6px] w-full origin-left rounded-full bg-brand/70" />
            </span>
            <br className="hidden sm:block" /> {SLIDES[active].tail}
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75">{SLIDES[active].sub}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href={SLIDES[active].cta.href} className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-4 text-sm font-bold text-white shadow-xl shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark">
              {SLIDES[active].cta.label}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href={SLIDES[active].portal.href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 transition hover:text-white">
              {SLIDES[active].portal.label}
              <ArrowUpRight className="h-4 w-4 text-brand-light transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Floating stat */}
        <div key={`stat-${active}`} className="animate-fade-up absolute right-6 bottom-32 hidden rounded-2xl border border-white/15 bg-white/[0.08] px-6 py-4 backdrop-blur-md lg:block">
          <div className="font-display text-4xl font-black text-brand-light">{SLIDES[active].stat.value}</div>
          <div className="mt-1 text-xs uppercase tracking-wider text-white/60">{SLIDES[active].stat.label}</div>
        </div>
      </div>

      {/* Audience switcher — auto-progress + manual */}
      <div className="absolute inset-x-0 bottom-0 z-[3] border-t border-white/10 bg-navy-900/40 backdrop-blur-sm">
        <div className="container-fp grid grid-cols-3">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => go(i)}
              aria-current={i === active}
              className={`group relative flex items-center gap-3 overflow-hidden px-2 py-4 text-left transition sm:px-5 ${i === active ? "text-white" : "text-white/45 hover:text-white/80"}`}
            >
              <span className={`hidden font-display text-sm font-black sm:block ${i === active ? "text-brand-light" : "text-white/30"}`}>0{i + 1}</span>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${i === active ? "border-brand bg-brand/20 text-brand-light" : "border-white/20 text-white/50"}`}>
                <s.Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold uppercase tracking-wider sm:text-sm">{s.tag}</span>
              </span>
              {/* progress rail */}
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
                {i === active && (
                  <span key={`bar-${active}-${paused}`} className={`block h-full bg-brand ${paused ? "w-full" : "hero-bar"}`} />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hero-bar { animation: heroBar ${DURATION}ms linear both; }
        @keyframes heroBar { from { width: 0%; } to { width: 100%; } }
        @media (prefers-reduced-motion: reduce) { .hero-bar { animation: none; width: 100%; } }
      `}</style>
    </section>
  );
}
