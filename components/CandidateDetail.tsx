import Link from "next/link";
import Icon from "@/components/Icon";
import { getCandidateDetail } from "@/lib/queries";
import MatchRing from "@/components/ui/MatchRing";

const docTone: Record<string, string> = { VERIFIED: "bg-brand/10 text-brand-dark", PENDING: "bg-amber-100 text-amber-700", MISSING: "bg-red-100 text-red-700", EXPIRED: "bg-navy/10 text-navy/60" };
const stageTone: Record<string, string> = { SUBMITTED: "bg-navy/10 text-navy", SHORTLISTED: "bg-amber-100 text-amber-700", INTERVIEW: "bg-blue-100 text-blue-700", SELECTED: "bg-purple-100 text-purple-700", DEPLOYED: "bg-brand/10 text-brand-dark", REJECTED: "bg-red-100 text-red-700" };
const pretty = (s: string) => s.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");

export default async function CandidateDetail({ candidateId, backHref }: { candidateId: string; backHref: string }) {
  const c = await getCandidateDetail(candidateId);
  if (!c) return <div className="card p-10 text-center text-sm text-navy/40">Candidate not found.</div>;
  const bestMatch = Math.max(0, ...c.applications.map((a) => a.aiMatch ?? 0));

  return (
    <div className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm font-semibold text-brand"><Icon name="arrow" className="h-4 w-4 rotate-180" /> Back</Link>

      {/* Header */}
      <div className="card overflow-hidden">
        <div className="relative bg-navy p-6 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_90%_0%,rgba(34,197,94,0.25),transparent)]" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-xl font-bold">{c.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
              <div>
                <div className="flex items-center gap-2 text-xl font-bold">{c.user.name} <Icon name="check-circle" className="h-5 w-5 text-brand-light" /></div>
                <p className="text-sm text-white/60">{c.profession ?? "—"} · {c.city ?? "—"}</p>
              </div>
            </div>
            {bestMatch > 0 && <MatchRing value={bestMatch} size={64} />}
          </div>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-4">
          {[["Experience", `${c.experienceYrs} yrs`], ["Overseas exp.", `${c.saudiExpYrs} yrs`], ["Expected salary", c.salaryExpect ?? "—"], ["Profile strength", `${c.profileStrength}%`]].map(([l, v]) => (
            <div key={l}><div className="text-xs text-navy/50">{l}</div><div className="font-semibold text-navy">{v}</div></div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-semibold text-navy">About</h2>
            <p className="mt-2 text-sm text-navy/70">{c.summary || "No summary provided."}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Education" value={c.education ?? "—"} />
              <Detail label="Driving license" value={c.drivingLicense ?? "—"} />
              <Detail label="Languages" value={c.languages.join(", ") || "—"} />
              <Detail label="Contact" value={c.user.email ?? c.user.phone ?? "—"} />
            </div>
            <div className="mt-4">
              <div className="text-xs text-navy/50">Skills</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {c.skills.length ? c.skills.map((s) => <span key={s} className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand-dark">{s}</span>) : <span className="text-sm text-navy/40">—</span>}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-navy">Application history</h2>
            <div className="mt-4 space-y-2">
              {c.applications.length === 0 && <p className="text-sm text-navy/40">No applications yet.</p>}
              {c.applications.map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-navy/10 p-3">
                  <div><div className="text-sm font-medium text-navy">{a.requirement.title}</div><div className="text-xs text-navy/45">{a.requirement.refCode} · {a.requirement.location}</div></div>
                  <div className="flex items-center gap-3">
                    {a.aiMatch != null && <span className="text-sm font-bold text-brand-dark">{a.aiMatch}%</span>}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stageTone[a.stage] ?? "bg-navy/10 text-navy"}`}>{pretty(a.stage)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card h-fit p-6">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="shield" className="h-5 w-5 text-brand" /> Documents</h2>
          <div className="mt-4 space-y-2">
            {c.documents.length === 0 && <p className="text-sm text-navy/40">No documents uploaded.</p>}
            {c.documents.map((d) => (
              <div key={d.type} className="flex items-center justify-between rounded-lg border border-navy/10 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-navy/70"><Icon name="doc" className="h-4 w-4 text-navy/40" /> {pretty(d.type)}</span>
                <div className="flex items-center gap-2">
                  {d.fileUrl && <a href={`/api/files/${d.fileUrl}`} target="_blank" className="text-xs font-semibold text-brand hover:underline">View</a>}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${docTone[d.status]}`}>{pretty(d.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-navy/50">{label}</div><div className="text-sm font-medium text-navy">{value}</div></div>;
}
