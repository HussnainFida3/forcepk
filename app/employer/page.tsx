import Link from "next/link";
import Icon from "@/components/Icon";
import StatCard from "@/components/ui/StatCard";
import { empPipeline } from "@/lib/employer";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEmployerStats } from "@/lib/queries";

const spk = (v: number) => Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(v * (0.5 + 0.5 * (i / 11)) * (0.85 + 0.3 * Math.sin(i * 1.3)))));

export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  OPEN: "bg-brand/10 text-brand-dark",
  SHORTLISTING: "bg-amber-100 text-amber-700",
  INTERVIEWING: "bg-blue-100 text-blue-700",
  FULFILLED: "bg-brand/10 text-brand-dark",
  CLOSED: "bg-navy/10 text-navy/60",
};

export default async function EmployerDashboard({ searchParams }: { searchParams: { created?: string } }) {
  const session = await auth();
  const me = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true } }) : null;
  const s = await getEmployerStats(me?.companyId ?? undefined);
  const empCards = [
    { label: "Active Requirements", value: s.active, icon: "doc", tone: "navy", delta: 8, spark: spk(s.active) },
    { label: "Candidates Received", value: s.apps, icon: "users", tone: "green", delta: 12, spark: spk(s.apps) },
    { label: "Shortlisted", value: s.shortlisted, icon: "star", tone: "purple", delta: 5, spark: spk(s.shortlisted) },
    { label: "Interviews", value: s.interviews, icon: "chat", tone: "teal", delta: 3, spark: spk(s.interviews) },
    { label: "Selected", value: s.selected, icon: "check-circle", tone: "green", delta: 7, spark: spk(s.selected) },
    { label: "Deployed", value: s.deployed, icon: "globe", tone: "navy", delta: 10, spark: spk(s.deployed) },
  ];
  const empRequirements = s.requirements.map((r) => ({
    id: r.refCode, title: r.title, city: r.location, exp: r.experience ?? "—",
    received: r._count.applications, status: r.status, posted: "recent",
  }));
  const flowMax = Math.max(1, s.apps);
  const candidateFlow = [
    { stage: "Applied", value: s.apps, pct: 100 },
    { stage: "Shortlisted", value: s.shortlisted, pct: Math.round((s.shortlisted / flowMax) * 100) },
    { stage: "Interviewed", value: s.interviews, pct: Math.round((s.interviews / flowMax) * 100) },
    { stage: "Selected", value: s.selected, pct: Math.round((s.selected / flowMax) * 100) },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Employer Dashboard</h1>
          <p className="text-sm text-navy/60">Welcome back, ABC Trading Co. — here&apos;s your recruitment activity.</p>
        </div>
        <Link href="/employer/requirements/new" className="btn-primary"><Icon name="doc" className="h-4 w-4" /> Create Requirement</Link>
      </div>

      {searchParams?.created && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark">
          <Icon name="check-circle" className="h-5 w-5" /> Requirement {searchParams.created} created and is now live for sourcing.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {empCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Requirements + right column */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="doc" className="h-5 w-5 text-brand" /> Recent Requirements</h2>
            <Link href="/employer/requirements" className="text-xs font-semibold text-brand">View all</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-navy/40">
                <tr><th className="pb-3 font-medium">Requirement</th><th className="pb-3 font-medium">Location</th><th className="pb-3 font-medium">Received</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium text-right">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {empRequirements.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 font-medium text-navy">{r.title}<div className="text-xs font-normal text-navy/40">{r.id} · {r.exp} · {r.posted}</div></td>
                    <td className="py-3 text-navy/60">{r.city}</td>
                    <td className="py-3 font-semibold text-navy">{r.received}</td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[r.status]}`}>{r.status}</span></td>
                    <td className="py-3 text-right"><Link href="/employer/candidates" className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Candidate flow */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy">Candidate Flow</h2>
            <div className="mt-4 space-y-3">
              {candidateFlow.map((f) => (
                <div key={f.stage}>
                  <div className="flex justify-between text-sm"><span className="text-navy/70">{f.stage}</span><span className="font-semibold text-navy">{f.value}</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-navy/10"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${f.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          {/* Quick actions */}
          <div className="card p-6">
            <h2 className="font-semibold text-navy">Quick Actions</h2>
            <div className="mt-4 grid gap-2">
              {[["doc", "Create Requirement", "/employer/requirements/new"], ["briefcase", "Pipeline", "/employer/pipeline"], ["star", "Candidates", "/employer/candidates"], ["chat", "Messages", "/messages"]].map(([ic, t, h]) => (
                <Link key={t} href={h} className="flex items-center gap-3 rounded-lg border border-navy/10 px-3 py-2.5 text-sm font-medium text-navy/80 hover:border-brand hover:text-brand">
                  <Icon name={ic} className="h-5 w-5 text-brand" /> {t}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hiring pipeline */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="gear" className="h-5 w-5 text-brand" /> Hiring Pipeline</h2>
        <div className="mt-5 flex flex-wrap items-center gap-y-3">
          {empPipeline.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <span className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${i < 4 ? "bg-brand text-white" : "bg-navy/10 text-navy/50"}`}>{i + 1}</span>
                <span className="max-w-[80px] text-center text-[11px] font-medium text-navy/60">{s}</span>
              </div>
              {i < empPipeline.length - 1 && <div className={`mx-1 h-0.5 w-6 ${i < 3 ? "bg-brand" : "bg-navy/15"}`} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
