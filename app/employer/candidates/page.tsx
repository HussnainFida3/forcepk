import Link from "next/link";
import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { getEmployerCandidates } from "@/lib/queries";
import { shortlistApplication, rejectApplication } from "@/lib/mutations";

export const metadata = { title: "Candidates" };
export const dynamic = "force-dynamic";

function matchTone(m: number) {
  if (m >= 90) return "bg-brand/10 text-brand-dark border-brand/30";
  if (m >= 80) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}
function Stars({ n }: { n: number }) {
  const v = Math.round((n / 100) * 5);
  return <span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" className={`h-3.5 w-3.5 ${i < v ? "text-brand" : "text-navy/15"}`} />)}</span>;
}

export default async function CandidatesPage() {
  const u = await currentUser();
  const apps = await getEmployerCandidates(u?.companyId ?? undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Candidate Comparison</h1>
          <p className="text-sm text-navy/60">AI-ranked candidates awaiting your review.</p>
        </div>
        <Link href="/employer/pipeline" className="btn-outline"><Icon name="gear" className="h-4 w-4" /> View full pipeline</Link>
      </div>

      {apps.length === 0 ? (
        <div className="card p-10 text-center text-sm text-navy/40">No candidates awaiting review. New submissions appear here automatically.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {apps.map((a) => {
            const m = a.aiMatch ?? 0;
            return (
              <div key={a.id} className="card overflow-hidden">
                <div className="bg-navy p-5 text-white">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-lg font-bold">{a.candidate.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold">{a.candidate.user.name} <Icon name="check-circle" className="h-4 w-4 text-brand-light" /></div>
                      <div className="text-xs text-white/60">{a.candidate.profession ?? "—"} · {a.candidate.city ?? "—"}</div>
                    </div>
                  </div>
                  <div className={`mt-4 flex items-center justify-between rounded-lg border px-3 py-2 ${matchTone(m)}`}>
                    <span className="flex items-center gap-1.5 text-xs font-semibold"><Icon name="bolt" className="h-4 w-4" /> AI Match</span>
                    <span className="text-lg font-extrabold">{m}%</span>
                  </div>
                </div>
                <div className="divide-y divide-navy/10 p-5">
                  <Row label="Skills match"><Stars n={a.skillsMatch ?? m} /></Row>
                  <Row label="Experience"><Stars n={a.expMatch ?? m} /></Row>
                  <Row label="Overseas exp."><span className="text-sm font-medium text-navy">{a.candidate.saudiExpYrs ?? 0} yrs</span></Row>
                  <Row label="Total experience"><span className="text-sm font-medium text-navy">{a.candidate.experienceYrs ?? 0} yrs</span></Row>
                  <Row label="Requirement"><span className="text-xs font-medium text-navy/60">{a.requirement.refCode}</span></Row>
                </div>
                <div className="flex items-center gap-2 border-t border-navy/10 p-4">
                  <Link href={`/employer/candidate/${a.candidate.id}`} className="rounded-lg border border-navy/15 px-3 py-2 text-center text-xs font-semibold text-navy hover:border-brand hover:text-brand">View</Link>
                  <form action={shortlistApplication.bind(null, a.id)} className="flex-1">
                    <button className="w-full rounded-lg bg-brand py-2 text-xs font-semibold text-white hover:bg-brand-dark">Shortlist</button>
                  </form>
                  <form action={rejectApplication.bind(null, a.id)}>
                    <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Reject</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between py-2.5 text-sm"><span className="text-navy/60">{label}</span>{children}</div>;
}
