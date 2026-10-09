import Link from "next/link";
import Icon from "@/components/Icon";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPartnerSubmissions } from "@/lib/queries";

export const metadata = { title: "My Submissions" };
export const dynamic = "force-dynamic";

const stageTone: Record<string, string> = {
  SUBMITTED: "bg-navy/10 text-navy/70", UNDER_REVIEW: "bg-navy/10 text-navy/70", SCREENING: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-amber-100 text-amber-700", INTERVIEW: "bg-purple-100 text-purple-700", SELECTED: "bg-teal-100 text-teal-700",
  DOCUMENTATION: "bg-blue-100 text-blue-700", PROCESSING: "bg-blue-100 text-blue-700", READY: "bg-brand/10 text-brand-dark",
  DEPARTURE: "bg-brand/10 text-brand-dark", DEPLOYED: "bg-brand/10 text-brand-dark", REJECTED: "bg-red-100 text-red-700",
};

export default async function PartnerSubmissions() {
  const session = await auth();
  const me = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { oepId: true } }) : null;
  const subs = await getPartnerSubmissions(me?.oepId ?? undefined);
  const deployed = subs.filter((s) => s.stage === "DEPLOYED").length;
  const active = subs.filter((s) => s.stage !== "DEPLOYED" && s.stage !== "REJECTED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Submissions</h1>
          <p className="text-sm text-navy/60">{subs.length} candidates submitted · {active} active · {deployed} deployed.</p>
        </div>
        <Link href="/partner/submit" className="btn-primary"><Icon name="users" className="h-4 w-4" /> Submit More</Link>
      </div>

      {subs.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-dark"><Icon name="users" className="h-6 w-6" /></span>
          <p className="font-semibold text-navy">No submissions yet</p>
          <p className="max-w-sm text-sm text-navy/55">Browse the job marketplace and submit verified candidates to start earning commissions.</p>
          <Link href="/partner/requirements" className="btn-primary mt-1">Browse marketplace</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy/45">
              <tr><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Requirement</th><th className="px-5 py-3 font-medium">Match</th><th className="px-5 py-3 font-medium">Submitted</th><th className="px-5 py-3 font-medium">Stage</th></tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {subs.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3"><div className="font-medium text-navy">{a.candidate.user.name}</div><div className="text-xs text-navy/40">{a.candidate.profession ?? "—"}{a.candidate.city ? ` · ${a.candidate.city}` : ""}</div></td>
                  <td className="px-5 py-3 text-navy/60">{a.requirement.refCode}<div className="text-xs text-navy/40">{a.requirement.title}</div></td>
                  <td className="px-5 py-3">{typeof a.aiMatch === "number" ? <span className="font-semibold text-brand-dark">{a.aiMatch}%</span> : "—"}</td>
                  <td className="px-5 py-3 text-navy/55">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stageTone[a.stage] ?? "bg-navy/10 text-navy/60"}`}>{a.stage.replace(/_/g, " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
