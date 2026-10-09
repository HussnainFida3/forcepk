import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { setDocumentStatus } from "@/lib/mutations";

export const metadata = { title: "Document Verification" };
export const dynamic = "force-dynamic";

const pretty = (s: string) => s.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");

// Standard document set every deploying candidate must submit.
const REQUIRED_DOCS = [
  { type: "CV", label: "CV / Resume", note: "Up-to-date work history & skills", required: true },
  { type: "PASSPORT", label: "Passport", note: "Valid ≥ 6 months, bio page scan", required: true },
  { type: "CNIC", label: "National ID (CNIC)", note: "Front & back, legible", required: true },
  { type: "PHOTO", label: "Photograph", note: "Recent passport-size, white background", required: true },
  { type: "EXPERIENCE_CERT", label: "Experience Certificate", note: "From previous employer(s)", required: true },
  { type: "EDUCATION_CERT", label: "Education Certificate", note: "Degree / diploma / trade cert", required: true },
  { type: "MEDICAL", label: "Medical (GAMCA)", note: "Fitness certificate for deployment", required: true },
  { type: "CERTIFICATION", label: "Trade Certification", note: "e.g. 6G welding, driving licence", required: false },
];

// Verification workflow stages.
const PROCESS = [
  { n: 1, t: "Upload", d: "Candidate (or partner) uploads each required document from the portal.", icon: "doc" },
  { n: 2, t: "Review", d: "Document lands here as PENDING for the document officer to open and check.", icon: "search" },
  { n: 3, t: "Verify or flag", d: "Officer marks each doc VERIFIED, or flags issues (EXPIRED / re-upload needed).", icon: "shield" },
  { n: 4, t: "Deployment-ready", d: "Once all required docs are verified, the candidate can proceed to processing & mobilization.", icon: "check-circle" },
];

const statusTone: Record<string, string> = {
  VERIFIED: "bg-brand/10 text-brand-dark",
  PENDING: "bg-amber-100 text-amber-700",
  MISSING: "bg-red-100 text-red-700",
  EXPIRED: "bg-navy/10 text-navy/60",
};

export default async function AdminDocuments() {
  const [pending, byStatus] = await Promise.all([
    prisma.document.findMany({
      where: { status: "PENDING" },
      take: 50, orderBy: { uploadedAt: "desc" },
      select: { id: true, type: true, fileUrl: true, uploadedAt: true, candidate: { select: { user: { select: { name: true } }, profession: true } } },
    }),
    prisma.document.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Document Verification</h1>
        <p className="text-sm text-navy/60">Review uploaded candidate documents and move them toward deployment-ready.</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Verified", value: count("VERIFIED"), icon: "check-circle", tone: "text-brand-dark", bg: "bg-brand/10" },
          { label: "Pending review", value: count("PENDING"), icon: "clock", tone: "text-amber-700", bg: "bg-amber-100" },
          { label: "Missing", value: count("MISSING"), icon: "doc", tone: "text-red-700", bg: "bg-red-100" },
          { label: "Expired", value: count("EXPIRED"), icon: "shield", tone: "text-navy/60", bg: "bg-navy/10" },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-3 p-4">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${s.bg} ${s.tone}`}><Icon name={s.icon} className="h-5 w-5" /></span>
            <div><div className="text-2xl font-extrabold text-navy">{s.value}</div><div className="text-xs text-navy/55">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Documentation process */}
      <div className="card p-6">
        <h2 className="font-semibold text-navy">How document verification works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p) => (
            <div key={p.n} className="rounded-xl border border-navy/10 p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10 text-brand-dark"><Icon name={p.icon} className="h-4 w-4" /></span>
                <span className="text-sm font-semibold text-navy">{p.n}. {p.t}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-navy/60">{p.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Required documents checklist */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-navy">Required documents checklist</h2>
          <span className="text-xs text-navy/50">Show this to clients & candidates</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REQUIRED_DOCS.map((d) => (
            <div key={d.type} className="flex items-start gap-3 rounded-xl border border-navy/10 p-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy-50 text-navy/60"><Icon name="doc" className="h-4 w-4" /></span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-sm font-medium text-navy">
                  {d.label}
                  {d.required
                    ? <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">REQUIRED</span>
                    : <span className="rounded bg-navy/10 px-1.5 py-0.5 text-[9px] font-bold text-navy/50">IF APPLIES</span>}
                </div>
                <p className="mt-0.5 text-xs text-navy/50">{d.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending review queue */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-semibold text-navy">Pending review ({pending.length})</h2>
        </div>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45">
            <tr><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Document</th><th className="px-5 py-3 font-medium">Uploaded</th><th className="px-5 py-3 font-medium">File</th><th className="px-5 py-3 text-right font-medium">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {pending.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-navy/40">No documents pending review. 🎉</td></tr>}
            {pending.map((d) => (
              <tr key={d.id}>
                <td className="px-5 py-3"><div className="font-medium text-navy">{d.candidate.user.name}</div><div className="text-xs text-navy/45">{d.candidate.profession ?? "—"}</div></td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone.PENDING}`}>{pretty(d.type)}</span></td>
                <td className="px-5 py-3 text-navy/55">{new Date(d.uploadedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3">{d.fileUrl ? <a href={`/api/files/${d.fileUrl}`} target="_blank" className="text-xs font-semibold text-brand hover:underline">View file</a> : <span className="text-xs text-navy/30">—</span>}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <form action={setDocumentStatus.bind(null, d.id, "VERIFIED")}>
                      <button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Verify</button>
                    </form>
                    <form action={setDocumentStatus.bind(null, d.id, "EXPIRED")}>
                      <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Flag</button>
                    </form>
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
