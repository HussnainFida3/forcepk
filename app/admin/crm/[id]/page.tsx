import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { getLeadDetail } from "@/lib/queries";
import { updateLead, deleteLead } from "@/lib/mutations";

export const metadata = { title: "Lead detail" };
export const dynamic = "force-dynamic";

const STAGES = ["NEW", "CONTACTED", "MEETING", "PROPOSAL", "AGREEMENT", "WON", "LOST"];

export default async function LeadDetail({ params, searchParams }: { params: { id: string }; searchParams: { saved?: string } }) {
  const l = await getLeadDetail(params.id);
  if (!l) notFound();

  const field = (label: string, name: string, value: string | null, type = "text") => (
    <label className="block">
      <span className="text-xs font-medium text-navy/55">{label}</span>
      <input name={name} defaultValue={value ?? ""} type={type} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/crm" className="mb-2 inline-flex items-center gap-1 text-sm text-navy/50 transition hover:text-brand">← Back to CRM</Link>
        <h1 className="text-2xl font-bold text-navy break-words">{l.name}</h1>
        <p className="mt-1 text-sm text-navy/60">{l.company ?? "—"}{l.owner?.name ? ` · owned by ${l.owner.name}` : ""}</p>
      </div>

      {searchParams?.saved && <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark"><Icon name="check-circle" className="h-5 w-5" /> Lead saved.</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={updateLead.bind(null, l.id)} className="card space-y-4 p-6 lg:col-span-2">
          <h2 className="font-semibold text-navy">Lead details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Contact name", "name", l.name)}
            {field("Company", "company", l.company)}
            {field("Email", "email", l.email, "email")}
            {field("Phone", "phone", l.phone)}
            {field("Source", "source", l.source)}
            <label className="block">
              <span className="text-xs font-medium text-navy/55">Stage</span>
              <select name="stage" defaultValue={l.stage} className="mt-1 w-full rounded-lg border border-navy/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand">{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-navy/55">Notes</span>
            <textarea name="notes" defaultValue={l.notes ?? ""} rows={4} className="mt-1 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
          <div className="flex justify-end"><button className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save changes</button></div>
        </form>

        <div className="card h-fit border-red-200 p-6">
          <h2 className="font-semibold text-red-600">Danger zone</h2>
          <p className="mt-1 text-sm text-navy/60">Permanently delete this lead.</p>
          <form action={deleteLead.bind(null, l.id)} className="mt-4"><button className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white">Delete lead</button></form>
        </div>
      </div>
    </div>
  );
}
