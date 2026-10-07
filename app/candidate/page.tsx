import Link from "next/link";
import Icon from "@/components/Icon";
import StatCard from "@/components/ui/StatCard";
import { appStatus, docTone } from "@/lib/candidate";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCandidateStats, getOpenRequirements } from "@/lib/queries";
import { aiMatchScore } from "@/lib/integrations/ai";
import { applyToRequirement } from "@/lib/mutations";

export const dynamic = "force-dynamic";

const STAGE_INDEX: Record<string, number> = { SUBMITTED: 0, SCREENING: 1, SHORTLISTED: 2, INTERVIEW: 3, SELECTED: 4, PROCESSING: 5, DEPARTURE: 6, DEPLOYED: 7 };
const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

function matchColor(m: number) {
  if (m >= 90) return "text-brand-dark";
  if (m >= 80) return "text-blue-600";
  return "text-amber-600";
}

export default async function CandidateDashboard() {
  const session = await auth();
  const s = await getCandidateStats(session?.user?.id);
  const canCards = [
    { label: "Applied", value: s.applied as number | string, icon: "briefcase", tone: "navy" },
    { label: "Shortlisted", value: s.shortlisted as number | string, icon: "star", tone: "amber" },
    { label: "Interviews", value: s.interviews as number | string, icon: "chat", tone: "teal" },
    { label: "Profile Strength", value: `${s.profileStrength}%`, icon: "check-circle", tone: "green" },
  ];
  const docWallet = s.documents.length
    ? s.documents.map((d) => ({ name: titleCase(d.type).replace(/_/g, " "), status: titleCase(d.status) }))
    : [];
  const applications = s.applications.map((a) => ({
    id: a.requirement.refCode,
    title: `${a.requirement.title} — ${a.requirement.location}`,
    stage: STAGE_INDEX[a.stage] ?? 0,
  }));

  // Live AI-matched recommendations from open requirements.
  const [profile, openReqs] = await Promise.all([
    session?.user?.id ? prisma.candidateProfile.findFirst({ where: { userId: session.user.id }, select: { id: true, profession: true, skills: true, experienceYrs: true, saudiExpYrs: true } }) : null,
    getOpenRequirements(),
  ]);
  const appliedIds = new Set(
    profile ? (await prisma.application.findMany({ where: { candidateId: profile.id }, select: { requirementId: true } })).map((a) => a.requirementId) : [],
  );
  const recommended = openReqs
    .map((r) => ({ r, m: aiMatchScore({ candidate: profile ?? {}, requirement: r }).score }))
    .sort((a, b) => b.m - a.m)
    .slice(0, 4)
    .map(({ r, m }) => ({ id: r.id, ref: r.refCode, title: r.title, city: r.location, exp: r.experience ?? "—", salary: r.salary ?? "", match: m, applied: appliedIds.has(r.id) }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Welcome back, Muhammad!</h1>
          <p className="text-sm text-navy/60">Your job matches and application progress at a glance.</p>
        </div>
        <Link href="/candidate/profile" className="btn-primary"><Icon name="doc" className="h-4 w-4" /> Build My CV</Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {canCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended jobs */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="bolt" className="h-5 w-5 text-brand" /> Recommended for you</h2>
              <p className="text-sm text-navy/55">AI-matched jobs based on your profile and experience.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {recommended.length === 0 && <p className="text-sm text-navy/40">No open requirements right now — check back soon.</p>}
            {recommended.map((j) => (
              <div key={j.id} className="flex flex-col gap-3 rounded-xl border border-navy/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-brand/30 text-xs font-extrabold text-brand-dark">{j.match}%</div>
                  <div>
                    <h3 className="font-semibold text-navy">{j.title}</h3>
                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-navy/55">
                      <span className="flex items-center gap-1"><Icon name="pin" className="h-3.5 w-3.5" />{j.city}</span>
                      <span className="flex items-center gap-1"><Icon name="briefcase" className="h-3.5 w-3.5" />{j.exp}</span>
                      {j.salary && <span className={`font-semibold ${matchColor(j.match)}`}>{j.salary}</span>}
                    </div>
                  </div>
                </div>
                {j.applied ? (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-brand/10 px-3 py-2 text-xs font-semibold text-brand-dark"><Icon name="check-circle" className="h-4 w-4" /> Applied</span>
                ) : (
                  <form action={applyToRequirement.bind(null, j.id)}>
                    <button className="btn-primary whitespace-nowrap text-xs">Apply Now</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Document wallet */}
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="shield" className="h-5 w-5 text-brand" /> Document Wallet</h2>
          <p className="text-xs text-navy/55">Your documents are private and secure.</p>
          <div className="mt-4 space-y-2">
            {docWallet.map((d) => (
              <div key={d.name} className="flex items-center justify-between rounded-lg border border-navy/10 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-navy/70"><Icon name="doc" className="h-4 w-4 text-navy/40" /> {d.name}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${docTone[d.status]}`}>{d.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application status tracker */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="briefcase" className="h-5 w-5 text-brand" /> Application Status</h2>
        <div className="mt-5 space-y-6">
          {applications.map((a) => (
            <div key={a.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-navy">{a.title}</span>
                <span className="text-xs text-navy/45">{a.id}</span>
              </div>
              <div className="mt-3 flex items-center overflow-x-auto pb-1">
                {appStatus.map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${i <= a.stage ? "bg-brand text-white" : "bg-navy/10 text-navy/40"}`}>
                        {i < a.stage ? "✓" : i + 1}
                      </span>
                      <span className={`max-w-[64px] text-center text-[10px] font-medium ${i <= a.stage ? "text-navy/70" : "text-navy/35"}`}>{s}</span>
                    </div>
                    {i < appStatus.length - 1 && <div className={`mx-1 h-0.5 w-5 shrink-0 ${i < a.stage ? "bg-brand" : "bg-navy/15"}`} />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
