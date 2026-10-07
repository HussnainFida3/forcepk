import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { getCompanyDetail } from "@/lib/queries";
import { setCompanyStatus, updateCompany, deleteCompany } from "@/lib/mutations";

export const metadata = { title: "Company detail" };
export const dynamic = "force-dynamic";

const tone: Record<string, string> = { VERIFIED: "bg-brand/10 text-brand-dark", PENDING: "bg-amber-100 text-amber-700", SUSPENDED: "bg-red-100 text-red-700", REJECTED: "bg-navy/10 text-navy/60" };
const reqTone: Record<string, string> = { OPEN: "bg-brand/10 text-brand-dark", CLOSED: "bg-navy/10 text-navy/60", FULFILLED: "bg-blue-100 text-blue-700", PENDING_VERIFICATION: "bg-amber-100 text-amber-700" };

export default async function CompanyDetail({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const c = await getCompanyDetail(params.id);
  if (!c) notFound();

  const field = (label: string, name: string, value: string | null, type = "text") => (
    <label className="block">
      <span className="text-xs font-medium text-navy/55">{label}</span>
      <input name={name} defaultValue={value ?? ""} type={type} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
    </label>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/admin/companies" className="mb-2 inline-flex items-center gap-1 text-sm text-navy/50 transition hover:text-brand">← Back to companies</Link>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-navy">
            <span className="break-words">{c.name}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[c.status]}`}>{c.status}</span>
          </h1>
          <p className="mt-1 text-sm text-navy/60">{c.crNumber}{c.industry ? ` · ${c.industry}` : ""}{c.city ? ` · ${c.city}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {c.status !== "VERIFIED" && <form action={setCompanyStatus.bind(null, c.id, "VERIFIED")}><button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Verify</button></form>}
          {c.status !== "SUSPENDED" && <form action={setCompanyStatus.bind(null, c.id, "SUSPENDED")}><button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Suspend</button></form>}
          {c.status !== "REJECTED" && <form action={setCompanyStatus.bind(null, c.id, "REJECTED")}><button className="rounded-md border border-navy/20 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:bg-navy/5">Reject</button></form>}
          {c.status !== "PENDING" && <form action={setCompanyStatus.bind(null, c.id, "PENDING")}><button className="rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50">Set pending</button></form>}
        </div>
      </div>

      {saved(searchParams)}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Edit form */}
        <form action={updateCompany.bind(null, c.id)} className="card space-y-4 p-6 lg:col-span-2">
          <h2 className="font-semibold text-navy">Company details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Company name", "name", c.name)}
            {field("Contact name", "contactName", c.contactName)}
            {field("Email", "email", c.email, "email")}
            {field("Phone", "phone", c.phone)}
            {field("City", "city", c.city)}
            {field("Industry", "industry", c.industry)}
            {field("Website", "website", c.website, "url")}
          </div>
          <label className="block">
            <span className="text-xs font-medium text-navy/55">About</span>
            <textarea name="about" defaultValue={c.about ?? ""} rows={3} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <div className="flex justify-end">
            <button className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save changes</button>
          </div>
        </form>

        {/* Side: stats + users + danger zone */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-navy">At a glance</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between"><dt className="text-navy/55">Requirements</dt><dd className="font-semibold text-navy">{c._count.requirements}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-navy/55">Invoices</dt><dd className="font-semibold text-navy">{c._count.invoices}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-navy/55">Replacement cases</dt><dd className="font-semibold text-navy">{c._count.replacements}</dd></div>
              <div className="flex items-center justify-between"><dt className="text-navy/55">Member since</dt><dd className="font-semibold text-navy">{new Date(c.createdAt).toLocaleDateString()}</dd></div>
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-navy">Account users</h2>
            <div className="mt-4 space-y-3">
              {c.users.length === 0 && <p className="text-sm text-navy/40">No linked users.</p>}
              {c.users.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">{(u.name ?? "?").slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-navy">{u.name ?? "—"}</div>
                    <div className="truncate text-xs text-navy/50">{u.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card border-red-200 p-6">
            <h2 className="font-semibold text-red-600">Danger zone</h2>
            <p className="mt-1 text-sm text-navy/60">Permanently delete this company and all its requirements, applications, invoices and replacement cases. This cannot be undone.</p>
            <form action={deleteCompany.bind(null, c.id)} className="mt-4">
              <button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white">Delete company</button>
            </form>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between p-5">
          <h2 className="font-semibold text-navy">Requirements ({c._count.requirements})</h2>
          <Link href="/admin/requirements" className="text-xs font-semibold text-brand">Manage →</Link>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Ref</th><th className="px-5 py-3 font-medium">Title</th><th className="px-5 py-3 font-medium">Location</th><th className="px-5 py-3 font-medium">Qty</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {c.requirements.length === 0 && <tr><td colSpan={5} className="px-5 py-6 text-center text-navy/40">No requirements yet.</td></tr>}
            {c.requirements.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 font-mono text-xs text-navy/60">{r.refCode}</td>
                <td className="px-5 py-3"><div className="font-medium text-navy">{r.title}</div><div className="text-xs text-navy/40">{r.profession}</div></td>
                <td className="px-5 py-3 text-navy/60">{r.location}</td>
                <td className="px-5 py-3 text-navy/70">{r.quantity}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${reqTone[r.status] ?? "bg-navy/10 text-navy/60"}`}>{r.status.replace(/_/g, " ")}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function saved(sp: { saved?: string }) {
  if (!sp?.saved) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark">
      <Icon name="check-circle" className="h-5 w-5" /> Company details saved.
    </div>
  );
}
