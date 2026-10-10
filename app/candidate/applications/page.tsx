import Link from "next/link";
import Icon from "@/components/Icon";
import { auth } from "@/auth";
import { getCandidateApplications } from "@/lib/queries";

export const metadata = { title: "My Applications" };
export const dynamic = "force-dynamic";

// Ordered pipeline for the progress indicator.
const FLOW = ["SUBMITTED", "SCREENING", "SHORTLISTED", "INTERVIEW", "SELECTED", "MEDICAL", "PROCESSING", "DEPLOYED"];
const stageTone: Record<string, string> = {
  SUBMITTED: "bg-navy/10 text-navy/70", UNDER_REVIEW: "bg-navy/10 text-navy/70", SCREENING: "bg-blue-100 text-blue-700",
  SHORTLISTED: "bg-amber-100 text-amber-700", INTERVIEW: "bg-purple-100 text-purple-700", SELECTED: "bg-teal-100 text-teal-700",
  DOCUMENTATION: "bg-blue-100 text-blue-700", MEDICAL: "bg-purple-100 text-purple-700", PROCESSING: "bg-blue-100 text-blue-700", READY: "bg-brand/10 text-brand-dark",
  DEPARTURE: "bg-brand/10 text-brand-dark", DEPLOYED: "bg-brand/10 text-brand-dark", REJECTED: "bg-red-100 text-red-700",
};

export default async function CandidateApplications() {
  const session = await auth();
  const apps = await getCandidateApplications(session?.user?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Applications</h1>
          <p className="text-sm text-navy/60">{apps.length} application{apps.length === 1 ? "" : "s"} · track each one from submission to deployment.</p>
        </div>
        <Link href="/candidate/jobs" className="btn-primary"><Icon name="search" className="h-4 w-4" /> Find more jobs</Link>
      </div>

      {apps.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-dark"><Icon name="briefcase" className="h-6 w-6" /></span>
          <p className="font-semibold text-navy">You haven&apos;t applied yet</p>
          <p className="max-w-sm text-sm text-navy/55">Browse verified jobs and apply — you can track every application here.</p>
          <Link href="/candidate/jobs" className="btn-primary mt-1">Browse jobs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((a) => {
            const idx = FLOW.indexOf(a.stage);
            const iv = a.interviews[0];
            return (
              <div key={a.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-navy">{a.requirement.title}</h3>
                    <p className="text-xs text-navy/45">{a.requirement.refCode} · {a.requirement.location}{a.requirement.salary ? ` · ${a.requirement.salary}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {typeof a.aiMatch === "number" && <span className="text-xs font-semibold text-brand-dark">{a.aiMatch}% match</span>}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stageTone[a.stage] ?? "bg-navy/10 text-navy/60"}`}>{a.stage.replace(/_/g, " ")}</span>
                  </div>
                </div>

                {/* Progress */}
                {a.stage !== "REJECTED" && (
                  <div className="mt-4 flex items-center">
                    {FLOW.map((st, i) => (
                      <div key={st} className="flex flex-1 items-center last:flex-none">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold ${i <= idx ? "bg-brand text-white" : "bg-navy/10 text-navy/40"}`}>{i < idx ? "✓" : i + 1}</span>
                        {i < FLOW.length - 1 && <span className={`mx-1 h-0.5 flex-1 ${i < idx ? "bg-brand" : "bg-navy/10"}`} />}
                      </div>
                    ))}
                  </div>
                )}

                {iv && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-brand/5 px-3 py-2 text-xs text-navy/70">
                    <Icon name="chat" className="h-4 w-4 text-brand" />
                    Interview {iv.status.toLowerCase()}{iv.scheduledAt ? ` · ${new Date(iv.scheduledAt).toLocaleString()}` : ""}{iv.method ? ` · ${iv.method}` : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
