import Link from "next/link";
import Icon from "@/components/Icon";
import { getOpenRequirements } from "@/lib/queries";

export const metadata = { title: "Job Marketplace" };
export const dynamic = "force-dynamic";

export default async function PartnerMarketplace() {
  const reqs = await getOpenRequirements();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Job Marketplace</h1>
          <p className="text-sm text-navy/60">{reqs.length} open requirements you can source candidates for.</p>
        </div>
        <Link href="/partner/submit" className="btn-primary"><Icon name="users" className="h-4 w-4" /> Submit Candidates</Link>
      </div>

      {reqs.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-dark"><Icon name="doc" className="h-6 w-6" /></span>
          <p className="font-semibold text-navy">No open requirements right now</p>
          <p className="max-w-sm text-sm text-navy/55">New manpower requirements appear here as soon as employers post them.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reqs.map((r) => (
            <div key={r.id} className="card card-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-navy">{r.title}</h3>
                  <p className="text-xs text-navy/45">{r.refCode} · {r.profession}</p>
                </div>
                <span className="chip shrink-0">Open</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-navy/60">
                <span className="flex items-center gap-1"><Icon name="pin" className="h-4 w-4" />{r.location}</span>
                <span className="flex items-center gap-1"><Icon name="users" className="h-4 w-4" />{r.quantity} positions</span>
                {r.experience && <span className="flex items-center gap-1"><Icon name="briefcase" className="h-4 w-4" />{r.experience}</span>}
                {r.salary && <span className="font-semibold text-brand-dark">{r.salary}</span>}
              </div>
              <Link href="/partner/submit" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-navy/15 py-2 text-sm font-semibold text-navy transition hover:border-brand hover:text-brand">
                Submit candidates <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
