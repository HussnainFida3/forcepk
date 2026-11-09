import Link from "next/link";
import {
  Building2, Users, UserCheck, ShieldCheck, FileText, ClipboardList,
  BarChart3, MessageCircle, Handshake, CheckCircle2, ArrowRight,
  HardHat, Zap, Wind, Flame, Truck, Wrench, Briefcase, Heart,
  Monitor, Package, type LucideIcon,
} from "lucide-react";
import { faqs } from "@/lib/data";
import FraudWarning from "@/components/FraudWarning";

/* ── Feature Band (6 tiles) ── */
const FEATURES = [
  { icon: FileText, title: "Employer\nRequirements", body: "Structured workforce requirements from verified employers.", accent: "#062b56" },
  { icon: Users, title: "OEP Partnership\nNetwork", body: "Connect with licensed recruitment partners across key sectors.", accent: "#126cc1" },
  { icon: UserCheck, title: "Candidate\nProfiles", body: "Create a professional profile and explore relevant jobs.", accent: "#075270" },
  { icon: ShieldCheck, title: "Verification", body: "Employer, OEP and candidate verification for a trusted platform.", accent: "#008f89" },
  { icon: Handshake, title: "Recruitment\nCoordination", body: "Facilitate communication and next steps between all parties.", accent: "#116ab8" },
  { icon: BarChart3, title: "Progress\nTracking", body: "Track the status of requirements, applications and recruitment progress.", accent: "#009187" },
];

/* ── How It Works (4 steps) ── */
const STEPS = [
  { n: 1, title: "Register", body: "Create your account as an employer, OEP partner or candidate.", accent: "#062b56" },
  { n: 2, title: "Submit Information", body: "Provide your requirements, organization details or candidate profile.", accent: "#008f89" },
  { n: 3, title: "Review & Match", body: "Information is reviewed and matched with suitable opportunities.", accent: "#126cc1" },
  { n: 4, title: "Coordinate Next Steps", body: "Connect, communicate and move forward with the recruitment process.", accent: "#009187" },
];

/* ── Categories (8 items) ── */
const CATS: { icon: LucideIcon; name: string }[] = [
  { icon: HardHat, name: "Construction & Engineering" },
  { icon: Heart, name: "Healthcare & Medical" },
  { icon: Monitor, name: "IT & Technology" },
  { icon: Briefcase, name: "Hospitality & Tourism" },
  { icon: Package, name: "Manufacturing & Production" },
  { icon: Truck, name: "Transport & Logistics" },
  { icon: Wrench, name: "Skilled Trades" },
  { icon: Users, name: "Administration & Office Support" },
];

/* ── Audience cards ── */
const AUDIENCE = [
  {
    role: "employer" as const, title: "For Employers", img: "/assets/employers.webp",
    desc: "Find the right recruitment partners to meet your workforce needs.",
    bullets: ["Submit and manage workforce requirements", "Connect with verified OEP partners", "Track requirement status and progress", "Dedicated support and coordination"],
    link: { label: "Learn more about employer registration →", href: "/employers" },
  },
  {
    role: "oep" as const, title: "For OEP Partners", img: "/assets/partners.webp",
    desc: "Showcase your licensed organization and recruitment capabilities.",
    bullets: ["Register your OEP licence details", "Highlight your recruitment capabilities", "Explore relevant employer requirements", "Build long-term partnerships"],
    link: { label: "Learn more about OEP registration →", href: "/partners" },
  },
  {
    role: "candidate" as const, title: "For Job Seekers", img: "/assets/seekers.webp",
    desc: "Create your profile and explore relevant opportunities.",
    bullets: ["Create a professional profile", "Upload and manage your CV", "Explore relevant job opportunities", "Keep your information secure and private"],
    link: { label: "Learn more about candidate registration →", href: "/register" },
  },
];

/* ── Why Choose ForcePK (5 tiles) ── */
const WHY = [
  { icon: ClipboardList, title: "Structured Coordination", body: "A clear and organized process for all users.", accent: "#062b56" },
  { icon: Handshake, title: "Partner Network", body: "Work with verified and licensed OEP partners.", accent: "#126cc1" },
  { icon: FileText, title: "Organized Profiles", body: "Well-structured candidate and job information.", accent: "#075270" },
  { icon: BarChart3, title: "Transparent Workflows", body: "Track progress with full visibility.", accent: "#008f89" },
  { icon: MessageCircle, title: "Clear Communication", body: "Stay connected with real-time updates.", accent: "#116ab8" },
];

const ROLE_COLORS = { employer: "#082952", oep: "#008e8c", candidate: "#0968bd" } as const;

export default async function Home() {
  return (
    <>
      {/* ── HERO (static, curved bottom, bg image) ── */}
      <section className="hero-codex">
        <div className="container-fp" style={{ padding: "48px 0 100px", width: "min(88.3%, 1140px)", margin: "0 auto" }}>
          <h1 className="text-[clamp(26px,4vw,48px)] font-bold leading-[1.05]">
            Connecting Employers,<br />
            Recruitment Partners<br />
            <span>& Job Seekers</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/90 max-w-md">
            Your workforce requirements. Our recruitment network.<br />
            A clearer path to opportunity.
          </p>
        </div>
      </section>

      {/* ── REGISTRATION CARDS (overlapping hero) ── */}
      <section className="reg-overlap" style={{ width: "min(92%, 1140px)", margin: "-60px auto 0" }}>
        <div className="grid gap-4 sm:grid-cols-3">
          {([
            { role: "employer" as const, Icon: Building2, title: "Register as an Employer", desc: "Submit your company's workforce requirements and connect with suitable recruitment partners.", btn: "Register as an Employer", href: "/register/employer" },
            { role: "oep" as const, Icon: Users, title: "Register as an OEP Partner", desc: "Register your licensed organization, share recruitment capabilities and explore relevant employer requirements.", btn: "Register as an OEP", href: "/register/oep" },
            { role: "candidate" as const, Icon: UserCheck, title: "Register as a Candidate", desc: "Create your profile, upload your CV and explore relevant job opportunities.", btn: "Register as a Candidate", href: "/register/candidate" },
          ]).map((c) => (
            <article key={c.role} className="rounded-lg bg-white p-4 flex flex-col" style={{ boxShadow: "0 5px 20px rgba(11,40,64,0.08)" }}>
              <div className="flex items-start gap-3 flex-1">
                <span className="shrink-0 grid place-items-center rounded-full text-white" style={{ background: ROLE_COLORS[c.role], width: 48, height: 48 }}>
                  <c.Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-[15px] font-bold" style={{ color: "#082952" }}>{c.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "#5e6b7b" }}>{c.desc}</p>
                </div>
              </div>
              <Link href={c.href} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[11px] font-bold text-white" style={{ background: ROLE_COLORS[c.role] }}>
                {c.btn} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── FEATURE BAND (6 tiles, single row on desktop, 3-col on mobile) ── */}
      <section className="band mt-6">
        <div className="container-fp grid grid-cols-2 gap-0 py-5 sm:grid-cols-3 lg:grid-cols-6">
          {FEATURES.map((f, i) => (
            <article key={f.title} className={`text-center px-3 py-3 ${i > 0 ? "border-l border-[#d8e6ec] max-sm:[&:nth-child(odd)]:border-l-0 sm:max-lg:[&:nth-child(3n+1)]:border-l-0" : ""}`}>
              <span className="mx-auto inline-grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: f.accent }}>
                <f.icon className="h-4 w-4" />
              </span>
              <h3 className="mt-2 text-[13px] font-bold whitespace-pre-line" style={{ color: "#082952" }}>{f.title}</h3>
              <p className="mt-1 text-[11px] leading-snug" style={{ color: "#5e6b7b" }}>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-12 sm:py-16 text-center">
        <div className="container-fp">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "#082952" }}>How It Works</h2>
          <p className="mt-2 text-[13px]" style={{ color: "#5e6b7b" }}>A simple process for employers, recruitment partners and job seekers.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative px-2 text-center">
                <span className="mx-auto inline-grid h-11 w-11 place-items-center rounded-full text-white font-bold text-sm" style={{ background: s.accent }}>
                  {s.n}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="step-arrow absolute hidden lg:block" />
                )}
                <h3 className="mt-3 text-[14px] font-bold" style={{ color: "#082952" }}>{s.title}</h3>
                <p className="mx-auto mt-1 max-w-[180px] text-[12px] leading-snug" style={{ color: "#5e6b7b" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR JOB CATEGORIES ── */}
      <section style={{ background: "#f1f7fa", padding: "16px 0 24px" }}>
        <div className="container-fp">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold" style={{ color: "#082952" }}>Popular Job Categories</h2>
            <Link href="/jobs" className="text-[12px] font-bold" style={{ color: "#075b9a" }}>View All Jobs &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {CATS.map((c) => (
              <Link key={c.name} href={`/jobs?category=${encodeURIComponent(c.name)}`} className="cat-card">
                <c.icon className="h-7 w-7" />
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUDIENCE: FOR EMPLOYERS / OEP / CANDIDATES ── */}
      <section className="py-12 sm:py-16">
        <div className="container-fp grid gap-4 sm:grid-cols-3">
          {AUDIENCE.map((a) => (
            <article key={a.role} className="audience-card rounded-lg overflow-hidden" style={{ "--accent": ROLE_COLORS[a.role], background: "#f7f9fa" } as React.CSSProperties}>
              <div className="grid grid-cols-[36%_1fr] gap-3 items-start p-3">
                <img src={a.img} alt={a.title} loading="lazy" className="w-full rounded aspect-[1.08] object-cover" />
                <div className="pt-2">
                  <h3 className="text-[15px] font-bold" style={{ color: "#082952" }}>{a.title}</h3>
                  <p className="mt-1 text-[12px] leading-snug" style={{ color: "#5e6b7b" }}>{a.desc}</p>
                </div>
              </div>
              <ul className="mt-1 space-y-1.5 px-[8%] pb-2">
                {a.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[12px]" style={{ color: "#5e6b7b" }}>
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#008e8c" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="px-[8%] pb-4">
                <Link href={a.link.href} className="text-[12px] font-bold" style={{ color: "#075b9a" }}>{a.link.label}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── FAQ GRID ── */}
      <section className="py-10" style={{ background: "#fff" }}>
        <div className="container-fp">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold" style={{ color: "#082952" }}>Frequently Asked Questions</h2>
            <Link href="/about#faq" className="text-[12px] font-bold" style={{ color: "#075b9a" }}>View all FAQs &rarr;</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {faqs.slice(0, 4).map((f) => (
              <details key={f.q} className="faq-codex">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE FORCEPK ── */}
      <section className="py-12 text-center" style={{ background: "#f5fafc" }}>
        <div className="container-fp">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "#082952" }}>Why Choose <span style={{ color: "#008e8c" }}>ForcePK?</span></h2>
          <p className="mt-2 text-[13px]" style={{ color: "#5e6b7b" }}>A reliable platform built for smarter workforce coordination.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {WHY.map((w) => (
              <article key={w.title} className="rounded-lg border bg-[#f8fbfd] p-4 text-center" style={{ borderColor: "#dce6eb" }}>
                <span className="mx-auto inline-grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: w.accent }}>
                  <w.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-2 text-[13px] font-bold" style={{ color: "#082952" }}>{w.title}</h3>
                <p className="mt-1 text-[12px] leading-snug" style={{ color: "#5e6b7b" }}>{w.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL FAQ (expandable list) ── */}
      <section className="py-12 text-center" style={{ background: "#f5fafc" }}>
        <div className="container-fp max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "#082952" }}>Frequently Asked <span style={{ color: "#008e8c" }}>Questions</span></h2>
          <p className="mt-2 text-[13px]" style={{ color: "#5e6b7b" }}>Find quick answers to common questions about ForcePK.</p>
          <div className="mt-6 space-y-3 text-left">
            {faqs.map((f, i) => (
              <details key={f.q} className="faq-codex" {...(i === 0 ? { open: true } : {})}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FRAUD WARNING ── */}
      <FraudWarning />

      {/* ── CTA ── */}
      <section className="cta-codex">
        <div className="container-fp grid gap-5 items-center sm:grid-cols-[1.75fr_repeat(3,1fr)]">
          <div>
            <small className="text-[13px] font-semibold" style={{ color: "#56e0df" }}>Join ForcePK Today</small>
            <h2 className="text-2xl font-bold text-white sm:text-[26px]">Ready to get started?</h2>
            <p className="mt-1 text-[13px] text-white/80">Choose your registration type and take the next step.</p>
          </div>
          <Link href="/register/employer" className="flex items-center justify-center gap-2 rounded-md border border-[#a1bdd2] px-3 py-3 text-[12px] font-bold text-white" style={{ background: "#082952" }}>
            Register as an Employer <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/register/oep" className="flex items-center justify-center gap-2 rounded-md border border-[#a1bdd2] px-3 py-3 text-[12px] font-bold text-white" style={{ background: "#008e8c" }}>
            Register as an OEP <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/register/candidate" className="flex items-center justify-center gap-2 rounded-md border border-[#a1bdd2] px-3 py-3 text-[12px] font-bold text-white" style={{ background: "#0968bd" }}>
            Register as a Candidate <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
