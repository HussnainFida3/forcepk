import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { getOpenRequirements } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { applyToRequirement } from "@/lib/mutations";

export const metadata = { title: "Job Search" };
export const dynamic = "force-dynamic";

export default async function CandidateJobs() {
  const u = await currentUser();
  const [reqs, myApps] = await Promise.all([
    getOpenRequirements(),
    u?.candidate?.id
      ? prisma.application.findMany({ where: { candidateId: u.candidate.id }, select: { requirementId: true } })
      : Promise.resolve([]),
  ]);
  const applied = new Set(myApps.map((a) => a.requirementId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Job Search</h1>
        <p className="text-sm text-navy/60">Browse open requirements and apply in one click.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {reqs.map((r) => {
          const has = applied.has(r.id);
          return (
            <div key={r.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy">{r.title}</h3>
                  <span className="chip">{r.profession}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy/60">
                  <span className="flex items-center gap-1"><Icon name="pin" className="h-4 w-4" />{r.location}</span>
                  <span className="flex items-center gap-1"><Icon name="briefcase" className="h-4 w-4" />{r.experience ?? "—"}</span>
                  <span className="flex items-center gap-1"><Icon name="users" className="h-4 w-4" />{r.quantity} positions</span>
                  {r.salary && <span className="font-semibold text-brand-dark">{r.salary}</span>}
                </div>
                <p className="mt-1 text-xs text-navy/40">{r.refCode}</p>
              </div>
              {has ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-brand/10 px-4 py-2.5 text-xs font-semibold text-brand-dark"><Icon name="check-circle" className="h-4 w-4" /> Applied</span>
              ) : (
                <form action={applyToRequirement.bind(null, r.id)}>
                  <button className="btn-primary whitespace-nowrap text-xs">Apply Now <Icon name="arrow" className="h-4 w-4" /></button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
