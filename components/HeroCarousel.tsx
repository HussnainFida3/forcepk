"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, ChevronLeft, ChevronRight, Building2, UserRound, Handshake,
  ShieldCheck, Globe, Sparkles, type LucideIcon,
} from "lucide-react";
import { HERO } from "@/lib/images";

type Slide = {
  key: string;
  image: string;
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  accent: string;
  sub: string;
  cta: { label: string; href: string };
  portal: { label: string; href: string };
  chips: string[];
};

const SLIDES: Slide[] = [
  {
    key: "employers",
    image: HERO.heroEmployers,
    Icon: Building2,
    eyebrow: "For Employers",
    title: "Hire verified global manpower,",
    accent: "deployment-ready.",
    sub: "Post a requirement and get matched with skilled, screened candidates — visas, medicals and mobilization handled end to end.",
    cta: { label: "Post a Requirement", href: "/employers#post" },
    portal: { label: "Employer portal", href: "/employer" },
    chips: ["Verified talent", "AI matching", "Full documentation"],
  },
  {
    key: "candidates",
    image: HERO.heroJobs,
    Icon: UserRound,
    eyebrow: "For Candidates",
    title: "Find your next job",
    accent: "worldwide.",
    sub: "Browse verified employer vacancies across the Gulf and beyond. Build your ForcePK profile and let employers come to you.",
    cta: { label: "Find Jobs", href: "/jobs" },
    portal: { label: "Candidate portal", href: "/candidate" },
    chips: ["Real vacancies", "One-click apply", "Trusted employers"],
  },
  {
    key: "partners",
    image: HERO.heroPartners,
    Icon: Handshake,
    eyebrow: "For OEP & Recruitment Partners",
    title: "Grow your agency with a",
    accent: "live demand pipeline.",
    sub: "Join our licensed partner network, receive matched requirements, and manage deployments through one command center.",
    cta: { label: "Become a Partner", href: "/partners" },
    portal: { label: "Partner portal", href: "/partner" },
    chips: ["Licensed network", "Live requirements", "Shared CRM"],
  },
];

const DURATION = 6000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => setActive((i + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), DURATION);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused]);

  const s = SLIDES[active];

  return (
    <section
      className="relative isolate overflow-hidden bg-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Who we serve"
    >
      {/* Background slides (crossfade) */}
      {SLIDES.map((sl, i) => (
        <div key={sl.key} className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${i === active ? "opacity-100" : "opacity-0"}`} aria-hidden={i !== active}>
          <img
            src={sl.image}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            className={`h-full w-full object-cover ${i === active ? "animate-ken" : "scale-105"}`}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/88 to-navy/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-transparent to-navy/30" />
      <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_15%_20%,rgba(34,197,94,0.18),transparent)]" />

      {/* Content */}
      <div className="container-fp relative flex min-h-[78vh] items-center py-20 lg:min-h-[86vh]">
        <div key={active} className="animate-fade-up max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-brand-light backdrop-blur">
            <s.Icon className="h-4 w-4" /> {s.eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight drop-shadow-sm sm:text-5xl lg:text-[3.4rem]">
            {s.title}{" "}
            <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">{s.accent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{s.sub}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={s.cta.href} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark">
              {s.cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={s.portal.href} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-semibold backdrop-blur transition hover:bg-white/10">
              {s.portal.label}
            </Link>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
            {s.chips.map((c, i) => {
              const Ic = [ShieldCheck, Sparkles, Globe][i] ?? ShieldCheck;
              return (
                <li key={c} className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Ic className="h-4 w-4 text-brand-light" /> {c}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Prev / Next */}
      <button
        type="button"
        onClick={() => go(active - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur transition hover:bg-white/20 sm:grid"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(active + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur transition hover:bg-white/20 sm:grid"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicators */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-3">
        {SLIDES.map((sl, i) => (
          <button
            key={sl.key}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to ${sl.eyebrow}`}
            aria-current={i === active}
            className="group relative h-1.5 overflow-hidden rounded-full bg-white/25 transition-all"
            style={{ width: i === active ? 44 : 20 }}
          >
            {i === active && !paused && (
              <span key={active} className="absolute inset-y-0 left-0 bg-brand-light hero-progress" />
            )}
            {i === active && paused && <span className="absolute inset-0 bg-brand-light" />}
          </button>
        ))}
      </div>

      <style jsx>{`
        .hero-progress { animation: heroBar ${DURATION}ms linear both; }
        @keyframes heroBar { from { width: 0%; } to { width: 100%; } }
        @media (prefers-reduced-motion: reduce) { .hero-progress { animation: none; width: 100%; } }
      `}</style>
    </section>
  );
}
