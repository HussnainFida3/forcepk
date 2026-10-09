import Link from "next/link";
import Icon from "@/components/Icon";
import StatCard from "@/components/ui/StatCard";
import { perfMetrics, ranking, topPartners, toneMap } from "@/lib/oep";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPartnerStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

const spk = (v: number) => Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(v * (0.5 + 0.5 * (i / 11)) * (0.85 + 0.3 * Math.sin(i * 1.3)))));

export default async function PartnerDashboard({ searchParams }: { searchParams: { submitted?: string } }) {
  const session = await auth();
  const me = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { oepId: true } }) : null;
  const s = await getPartnerStats(me?.oepId ?? undefined);
  const oepCards = [
    { label: "Open Requirements", value: s.openReqs, icon: "doc", tone: "navy", delta: 6, spark: spk(s.openReqs) },
    { label: "Candidates Submitted", value: s.submitted, icon: "users", tone: "purple", delta: 14, spark: spk(s.submitted) },
    { label: "Shortlisted", value: s.shortlisted, icon: "star", tone: "amber", delta: 9, spark: spk(s.shortlisted) },
    { label: "Interviews", value: s.interviews, icon: "chat", tone: "teal", delta: 4, spark: spk(s.interviews) },
    { label: "Selected", value: s.selected, icon: "check-circle", tone: "green", delta: 7, spark: spk(s.selected) },
    { label: "Deployed", value: s.deployed, icon: "globe", tone: "blue", delta: 11, spark: spk(s.deployed) },
  ];
  const marketplace = s.marketplace.map((m) => ({
    id: m.refCode, title: m.title, city: m.location, req: m.quantity, exp: m.experience ?? "—", deadline: "open", status: "Open",
  }));
  const performance = [
    { label: "Candidates Submitted", value: String(s.submitted), icon: "users", tone: "purple" },
    { label: "Shortlisted", value: String(s.shortlisted), icon: "star", tone: "amber" },
    { label: "Selected", value: String(s.selected), icon: "check-circle", tone: "green" },
    { label: "Deployed", value: String(s.deployed), icon: "globe", tone: "blue" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Welcome back, ABC Recruitment!</h1>
          <p className="text-sm text-navy/60">Here&apos;s your latest activity and performance at a glance.</p>
        </div>
        <Link href="/partner/submit" className="btn-primary"><Icon name="users" className="h-4 w-4" /> Submit Candidates</Link>
      </div>

      {searchParams?.submitted && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark">
          <Icon name="check-circle" className="h-5 w-5" /> Candidate submitted successfully and added to the pipeline.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {oepCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Marketplace */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="doc" className="h-5 w-5 text-brand" /> Job Marketplace</h2>
              <p className="text-sm text-navy/55">Find and submit candidates for the latest requirements.</p>
            </div>
            <Link href="/partner/requirements" className="text-xs font-semibold text-brand">View all</Link>
          </div>
          <div className="mt-4 space-y-3">
            {marketplace.map((m) => (
              <div key={m.id} className="flex flex-col gap-3 rounded-xl border border-navy/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-navy">{m.city} — {m.title}</h3>
                    <span className="chip">{m.status}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/55">
                    <span>Ref: {m.id}</span><span>Required: {m.req}</span><span>Exp: {m.exp}</span><span>Deadline: {m.deadline}</span>
                  </div>
                </div>
                <Link href="/partner/submit" className="btn-primary whitespace-nowrap text-xs">Submit Candidates</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Ranking */}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="award" className="h-5 w-5 text-brand" /> Partner Ranking</h2>
            <p className="text-xs text-navy/55">Your performance unlocks more opportunities.</p>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-amber-400 text-white"><Icon name="award" className="h-6 w-6" /></span>
              <div>
                <div className="font-bold text-amber-700">{ranking.tier}</div>
                <div className="text-xs text-amber-700/70">Rank #{ranking.rank}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-navy-50 p-4">
              <span className="text-sm text-navy/60">Overall Rating</span>
              <span className="flex items-center gap-1 text-lg font-bold text-navy"><Icon name="star" className="h-5 w-5 text-brand" /> {ranking.rating} / 5</span>
            </div>
          </div>
          {/* Quick actions */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy">Quick Actions</h2>
            <div className="mt-4 grid gap-2">
              {[["users", "Submit Candidates", "/partner/submit"], ["doc", "View Open Requirements", "/partner"], ["award", "Check Earnings", "/partner/earnings"], ["building", "Update Company Profile", "/partner/profile"]].map(([ic, t, h]) => (
                <Link key={t} href={h} className="flex items-center gap-3 rounded-lg border border-navy/10 px-3 py-2.5 text-sm font-medium text-navy/80 hover:border-brand hover:text-brand">
                  <Icon name={ic} className="h-5 w-5 text-brand" /> {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance + Top partners */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="star" className="h-5 w-5 text-brand" /> OEP Performance <span className="text-xs font-normal text-navy/45">· This Month</span></h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            {performance.map((p) => (
              <div key={p.label} className="rounded-xl border border-navy/10 p-4">
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${toneMap[p.tone]}`}><Icon name={p.icon} className="h-5 w-5" /></span>
                <div className="mt-2 text-2xl font-extrabold text-navy">{p.value}</div>
                <div className="text-xs text-navy/55">{p.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {perfMetrics.map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-xl bg-navy-50 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand"><Icon name={m.icon} className="h-5 w-5" /></span>
                <div>
                  <div className="text-lg font-bold text-navy">{m.value}</div>
                  <div className="text-xs text-navy/55">{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="award" className="h-5 w-5 text-brand" /> Top Performing Partners</h2>
          <div className="mt-4 space-y-2">
            {topPartners.map((o) => (
              <div key={o.rank} className={`flex items-center gap-3 rounded-lg p-2 ${o.you ? "bg-brand/5" : ""}`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${o.rank <= 3 ? "bg-brand text-white" : "bg-navy/10 text-navy"}`}>{o.rank}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">{o.name}{o.you && <span className="ml-1 text-xs font-normal text-brand">(You)</span>}</span>
                <span className="text-sm font-bold text-brand-dark">{o.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
