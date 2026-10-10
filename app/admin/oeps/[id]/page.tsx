import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { getOepDetail } from "@/lib/queries";
import AgreementCard from "@/components/AgreementCard";
import { setOepStatus, updateOep, deleteOep, saveOepAgreement } from "@/lib/mutations";

export const metadata = { title: "Partner detail" };
export const dynamic = "force-dynamic";

const tone: Record<string, string> = { VERIFIED: "bg-brand/10 text-brand-dark", PENDING: "bg-amber-100 text-amber-700", SUSPENDED: "bg-red-100 text-red-700", REJECTED: "bg-navy/10 text-navy/60" };

export default async function OepDetail({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const o = await getOepDetail(params.id);
  if (!o) notFound();
  const expiry = o.licenseExpiry ? new Date(o.licenseExpiry).toISOString().slice(0, 10) : "";

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
          <Link href="/admin/oeps" className="mb-2 inline-flex items-center gap-1 text-sm text-navy/50 transition hover:text-brand">← Back to partners</Link>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-navy"><span className="break-words">{o.name}</span><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[o.status]}`}>{o.status}</span></h1>
          <p className="mt-1 text-sm text-navy/60">{o.licenseNo} · {o.tier} tier · ⭐ {o.rating.toFixed(1)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {o.status !== "VERIFIED" && <form action={setOepStatus.bind(null, o.id, "VERIFIED")}><button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Verify</button></form>}
          {o.status === "SUSPENDED"
            ? <form action={setOepStatus.bind(null, o.id, "VERIFIED")}><button className="rounded-md border border-brand/30 px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand/5">Reactivate</button></form>
            : <form action={setOepStatus.bind(null, o.id, "SUSPENDED")}><button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Suspend</button></form>}
          {o.status !== "REJECTED" && <form action={setOepStatus.bind(null, o.id, "REJECTED")}><button className="rounded-md border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:bg-navy/5">Reject</button></form>}
        </div>
      </div>

      {searchParams?.saved && <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark"><Icon name="check-circle" className="h-5 w-5" /> Partner details saved.</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={updateOep.bind(null, o.id)} className="card space-y-4 p-6 lg:col-span-2">
          <h2 className="font-semibold text-navy">Partner details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Agency name", "name", o.name)}
            {field("License number", "licenseNo", o.licenseNo)}
            {field("License expiry", "licenseExpiry", expiry, "date")}
            {field("City", "city", o.city)}
            {field("Phone", "phone", o.phone)}
            {field("Email", "email", o.email, "email")}
            <label className="block">
              <span className="text-xs font-medium text-navy/55">Tier</span>
              <select name="tier" defaultValue={o.tier} className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand">
                {["Bronze", "Silver", "Gold", "Platinum"].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            {field("Rating (0–5)", "rating", o.rating, "number")}
          </div>
          <label className="block">
            <span className="text-xs font-medium text-navy/55">Specializations (comma-separated)</span>
            <input name="specializations" defaultValue={o.specializations.join(", ")} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-navy/55">Countries of interest (comma-separated)</span>
            <input name="countries" defaultValue={o.countries.join(", ")} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <div className="flex justify-end"><button className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save changes</button></div>
        </form>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-navy">At a glance</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><dt className="text-navy/55">Submissions</dt><dd className="font-semibold text-navy">{o._count.applications}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-navy/55">Commissions</dt><dd className="font-semibold text-navy">{o._count.commissions}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-navy/55">Users</dt><dd className="font-semibold text-navy">{o.users.length}</dd></div>
            </dl>
          </div>
          <AgreementCard action={saveOepAgreement.bind(null, o.id)} text={o.agreementText} fileUrl={o.agreementFileUrl} party="Partner" />

          <div className="card border-red-200 p-6">
            <h2 className="font-semibold text-red-600">Danger zone</h2>
            <p className="mt-1 text-sm text-navy/60">Delete this partner. Their submissions are detached (not deleted) and commissions are removed.</p>
            <form action={deleteOep.bind(null, o.id)} className="mt-4"><button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white">Delete partner</button></form>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="p-5"><h2 className="font-semibold text-navy">Recent submissions</h2></div>
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Requirement</th><th className="px-5 py-3 font-medium">Stage</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {o.applications.length === 0 && <tr><td colSpan={3} className="px-5 py-6 text-center text-navy/40">No submissions yet.</td></tr>}
            {o.applications.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3 font-medium text-navy">{a.candidate.user.name}</td>
                <td className="px-5 py-3 text-navy/60">{a.requirement.refCode} · {a.requirement.title}</td>
                <td className="px-5 py-3"><span className="rounded-full bg-navy/5 px-2.5 py-1 text-xs font-medium text-navy/70">{a.stage.replace(/_/g, " ")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
