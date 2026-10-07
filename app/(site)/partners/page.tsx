import Link from "next/link";
import Icon from "@/components/Icon";
import { jobs } from "@/lib/data";
import { HERO } from "@/lib/images";

export const metadata = { title: "Become a Recruitment Partner (OEP)" };

const perks = [
  ["doc", "Access approved requirements", "See live, verified manpower requirements in the Job Marketplace."],
  ["users", "Submit your candidates", "Upload CVs and documents and track every candidate through the pipeline."],
  ["award", "Earn commission", "Earn agreed commission on every successfully deployed candidate."],
  ["star", "Grow your ranking", "Performance scoring unlocks more opportunities for top partners."],
];

const pipeline = ["Submitted", "Under Review", "Shortlisted", "Interview", "Selected", "Documentation", "Deployed"];

export default function PartnersPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy py-20 text-white lg:py-24">
        <img src={HERO.heroPartners} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/92 to-navy/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
        <div className="container-fp relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="chip bg-brand/20 text-brand-light">For OEPs & Recruitment Agencies</span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Partner with ForcePK and grow your placements</h1>
            <p className="mt-4 text-white/70">Join our verified partner network. Access approved requirements, submit candidates and earn commission on successful deployments.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary">Become a Partner <Icon name="arrow" className="h-4 w-4" /></Link>
              <Link href="#marketplace" className="btn-ghost">View Job Marketplace</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="font-semibold">Candidate pipeline</h2>
            <p className="mt-1 text-sm text-white/60">Track every candidate from submission to deployment.</p>
            <div className="mt-5 space-y-2">
              {pipeline.map((p, i) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
                  <span className="text-sm text-white/80">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-fp">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Partner Benefits</span>
            <h2 className="mt-2 h2">Why join the ForcePK network</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map(([ic, t, d]) => (
              <div key={t} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon name={ic} className="h-6 w-6" /></span>
                <h3 className="mt-4 font-semibold text-navy">{t}</h3>
                <p className="mt-2 text-sm text-navy/60">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETPLACE */}
      <section id="marketplace" className="section bg-navy-50">
        <div className="container-fp">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Job Marketplace</span>
            <h2 className="mt-2 h2">Open requirements for partners</h2>
            <p className="mt-3 text-navy/60">Approved requirements available for candidate submission. Sensitive employer details stay private until you&apos;re authorized.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {jobs.slice(0, 6).map((j) => (
              <div key={j.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-navy">{j.title}</h3>
                    <p className="text-xs text-navy/40">Ref: {j.id} · Verified Employer</p>
                  </div>
                  <span className="chip">Open</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-navy/60">
                  <span className="flex items-center gap-1"><Icon name="pin" className="h-4 w-4" />{j.city}</span>
                  <span className="flex items-center gap-1"><Icon name="users" className="h-4 w-4" />Required: {j.positions}</span>
                  <span className="flex items-center gap-1"><Icon name="briefcase" className="h-4 w-4" />{j.exp}</span>
                  <span className="font-semibold text-brand-dark">{j.salary}</span>
                </div>
                <Link href="/login" className="btn-primary mt-4 w-full">Submit Candidates</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
