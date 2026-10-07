import { getReplacements } from "@/lib/queries";
import { setReplacementStatus } from "@/lib/mutations";

export const metadata = { title: "Replacement Cases" };
export const dynamic = "force-dynamic";

const FLOW: Record<string, string | null> = { REPORTED: "UNDER_REVIEW", UNDER_REVIEW: "APPROVED", APPROVED: "SEARCHING", SEARCHING: "SELECTED", SELECTED: "CLOSED", REJECTED: null, CLOSED: null };
const tone: Record<string, string> = { REPORTED: "bg-amber-100 text-amber-700", UNDER_REVIEW: "bg-blue-100 text-blue-700", APPROVED: "bg-teal-100 text-teal-700", SEARCHING: "bg-purple-100 text-purple-700", SELECTED: "bg-navy/10 text-navy", CLOSED: "bg-brand/10 text-brand-dark", REJECTED: "bg-red-100 text-red-700" };

export default async function ReplacementsPage() {
  const cases = await getReplacements();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-navy">Replacement Cases</h1><p className="text-sm text-navy/60">Contractual replacement requests. Terms are agreed per employer before recruitment.</p></div>
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Case</th><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Client</th><th className="px-5 py-3 font-medium">Reason</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Action</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {cases.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-navy/40">No replacement cases.</td></tr>}
            {cases.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-medium text-navy">{c.caseNo}</td>
                <td className="px-5 py-3 text-navy/70">{c.application.candidate.user.name}<div className="text-xs text-navy/40">{c.application.requirement.refCode}</div></td>
                <td className="px-5 py-3 text-navy/60">{c.company.name}</td>
                <td className="px-5 py-3 text-navy/60">{c.reason}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[c.status]}`}>{c.status.replace(/_/g, " ")}</span></td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {FLOW[c.status] && <form action={setReplacementStatus.bind(null, c.id, FLOW[c.status] as never)}><button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">→ {FLOW[c.status]!.replace(/_/g, " ")}</button></form>}
                    {c.status !== "CLOSED" && c.status !== "REJECTED" && <form action={setReplacementStatus.bind(null, c.id, "REJECTED")}><button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Reject</button></form>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
