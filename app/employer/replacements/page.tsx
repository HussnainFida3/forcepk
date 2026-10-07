import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getDeployedForCompany } from "@/lib/queries";
import { createReplacement } from "@/lib/mutations";

export const metadata = { title: "Replacements" };
export const dynamic = "force-dynamic";

const tone: Record<string, string> = { REPORTED: "bg-amber-100 text-amber-700", UNDER_REVIEW: "bg-blue-100 text-blue-700", APPROVED: "bg-teal-100 text-teal-700", SEARCHING: "bg-purple-100 text-purple-700", SELECTED: "bg-navy/10 text-navy", CLOSED: "bg-brand/10 text-brand-dark", REJECTED: "bg-red-100 text-red-700" };

export default async function EmployerReplacements() {
  const u = await currentUser();
  const [deployed, cases] = await Promise.all([
    getDeployedForCompany(u?.companyId ?? undefined),
    prisma.replacementCase.findMany({ where: u?.companyId ? { companyId: u.companyId } : {}, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, caseNo: true, reason: true, status: true, application: { select: { candidate: { select: { user: { select: { name: true } } } } } } } }),
  ]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-navy">Replacements</h1><p className="text-sm text-navy/60">Request a replacement for a deployed worker, per your agreed contract terms.</p></div>

      <div className="card p-6">
        <h2 className="font-semibold text-navy">Deployed workers</h2>
        <div className="mt-4 space-y-3">
          {deployed.length === 0 && <p className="text-sm text-navy/40">No deployed workers eligible for a replacement request.</p>}
          {deployed.map((a) => (
            <form key={a.id} action={createReplacement.bind(null, a.id)} className="flex flex-col gap-3 rounded-xl border border-navy/10 p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="font-medium text-navy">{a.candidate.user.name}</div>
                <div className="text-xs text-navy/45">{a.requirement.refCode} — {a.requirement.title}</div>
              </div>
              <input name="reason" placeholder="Reason for replacement" className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
              <button className="btn-primary whitespace-nowrap text-xs">Report case</button>
            </form>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-navy">Your replacement cases</h2>
        <div className="mt-4 space-y-2">
          {cases.length === 0 && <p className="text-sm text-navy/40">No cases filed.</p>}
          {cases.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-navy/10 p-3">
              <div><span className="font-medium text-navy">{c.caseNo}</span> <span className="text-sm text-navy/50">· {c.application.candidate.user.name} · {c.reason}</span></div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[c.status]}`}>{c.status.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
