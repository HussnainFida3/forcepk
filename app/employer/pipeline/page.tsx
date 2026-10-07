import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { getEmployerPipeline } from "@/lib/queries";
import { advanceApplication, rejectApplication } from "@/lib/mutations";

export const metadata = { title: "Recruitment Pipeline" };
export const dynamic = "force-dynamic";

const STAGE_TONE: Record<string, string> = {
  SUBMITTED: "bg-navy/10 text-navy", UNDER_REVIEW: "bg-navy/10 text-navy", SCREENING: "bg-navy/10 text-navy",
  SHORTLISTED: "bg-amber-100 text-amber-700", INTERVIEW: "bg-blue-100 text-blue-700",
  SELECTED: "bg-purple-100 text-purple-700", DOCUMENTATION: "bg-purple-100 text-purple-700",
  PROCESSING: "bg-purple-100 text-purple-700", READY: "bg-teal-100 text-teal-700",
  DEPARTURE: "bg-teal-100 text-teal-700", DEPLOYED: "bg-brand/10 text-brand-dark", REJECTED: "bg-red-100 text-red-700",
};
const pretty = (s: string) => s.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");

export default async function PipelinePage() {
  const u = await currentUser();
  const apps = await getEmployerPipeline(u?.companyId ?? undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Recruitment Pipeline</h1>
        <p className="text-sm text-navy/60">Move candidates through the hiring stages. Changes save instantly.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy/45">
              <tr>
                <th className="px-5 py-3 font-medium">Candidate</th>
                <th className="px-5 py-3 font-medium">Requirement</th>
                <th className="px-5 py-3 font-medium">AI Match</th>
                <th className="px-5 py-3 font-medium">Stage</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {apps.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-navy/40">No applications yet.</td></tr>
              )}
              {apps.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-navy">{a.candidate.user.name}</div>
                    <div className="text-xs text-navy/45">{a.candidate.profession ?? "—"} · {a.candidate.city ?? "—"}</div>
                  </td>
                  <td className="px-5 py-3 text-navy/70">{a.requirement.title}<div className="text-xs text-navy/40">{a.requirement.refCode} · {a.requirement.location}</div></td>
                  <td className="px-5 py-3"><span className="font-bold text-brand-dark">{a.aiMatch ?? "—"}%</span></td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STAGE_TONE[a.stage]}`}>{pretty(a.stage)}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {a.stage !== "DEPLOYED" && a.stage !== "REJECTED" && (
                        <form action={advanceApplication.bind(null, a.id)}>
                          <button className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
                            Advance <Icon name="arrow" className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      )}
                      {a.stage !== "REJECTED" && (
                        <form action={rejectApplication.bind(null, a.id)}>
                          <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Reject</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
