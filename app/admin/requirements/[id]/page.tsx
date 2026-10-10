import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { getRequirementDetail } from "@/lib/queries";
import { updateRequirement, deleteRequirement } from "@/lib/mutations";

export const metadata = { title: "Requirement detail" };
export const dynamic = "force-dynamic";

const REQ_STATUS = ["DRAFT", "PENDING_VERIFICATION", "OPEN", "SHORTLISTING", "INTERVIEWING", "FULFILLED", "CLOSED"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default async function RequirementDetail({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const r = await getRequirementDetail(params.id);
  if (!r) notFound();

  const field = (label: string, name: string, value: string | number | null, type = "text") => (
    <label className="block">
      <span className="text-xs font-medium text-navy/55">{label}</span>
      <input name={name} defaultValue={value ?? ""} type={type} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/admin/requirements" className="mb-2 inline-flex items-center gap-1 text-sm text-navy/50 transition hover:text-brand">← Back to requirements</Link>
          <h1 className="text-2xl font-bold text-navy break-words">{r.title}</h1>
          <p className="mt-1 text-sm text-navy/60">{r.refCode} · {r.profession} · {r.location} · for {r.company?.name ?? r.oep?.name ?? "—"}</p>
        </div>
      </div>

      {searchParams?.saved && <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark"><Icon name="check-circle" className="h-5 w-5" /> Requirement saved.</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={updateRequirement.bind(null, r.id)} className="card space-y-4 p-6 lg:col-span-2">
          <h2 className="font-semibold text-navy">Edit requirement</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Title", "title", r.title)}
            {field("Profession", "profession", r.profession)}
            {field("Quantity", "quantity", r.quantity, "number")}
            {field("Location", "location", r.location)}
            {field("Salary", "salary", r.salary)}
            {field("Experience", "experience", r.experience)}
            {field("Education", "education", r.education)}
            {field("Gender", "gender", r.gender)}
            {field("Contract duration", "contractDuration", r.contractDuration)}
            {field("Working hours", "workingHours", r.workingHours)}
            {field("Interview method", "interviewMethod", r.interviewMethod)}
            {field("Expiry date", "expiryDate", r.expiryDate ? new Date(r.expiryDate).toISOString().slice(0, 10) : "", "date")}
            <label className="block">
              <span className="text-xs font-medium text-navy/55">Priority</span>
              <select name="priority" defaultValue={r.priority} className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand">{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-navy/55">Status</span>
              <select name="status" defaultValue={r.status} className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand">{REQ_STATUS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-navy/55">Skills (comma-separated)</span>
            <input name="skills" defaultValue={r.skills.join(", ")} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-navy/55">Special notes</span>
            <textarea name="specialNotes" defaultValue={r.specialNotes ?? ""} rows={3} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <div className="flex justify-end"><button className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save changes</button></div>
        </form>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-navy">Applicants ({r._count.applications})</h2>
            <div className="mt-4 space-y-2.5">
              {r.applications.length === 0 && <p className="text-sm text-navy/40">No applicants yet.</p>}
              {r.applications.map((a) => (
                <Link key={a.id} href={`/admin/candidates/${a.candidate.id}`} className="flex items-center justify-between rounded-lg border border-navy/10 px-3 py-2 text-sm transition hover:border-brand/40 hover:bg-brand/5">
                  <span className="min-w-0 truncate font-medium text-navy">{a.candidate.user.name}</span>
                  <span className="ml-2 flex shrink-0 items-center gap-2">
                    {typeof a.aiMatch === "number" && <span className="text-xs font-semibold text-brand-dark">{a.aiMatch}%</span>}
                    <span className="rounded-full bg-navy/5 px-2 py-0.5 text-[10px] font-medium text-navy/60">{a.stage.replace(/_/g, " ")}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="card border-red-200 p-6">
            <h2 className="font-semibold text-red-600">Danger zone</h2>
            <p className="mt-1 text-sm text-navy/60">Delete this requirement and all its applications. This cannot be undone.</p>
            <form action={deleteRequirement.bind(null, r.id)} className="mt-4"><button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white">Delete requirement</button></form>
          </div>
        </div>
      </div>
    </div>
  );
}
