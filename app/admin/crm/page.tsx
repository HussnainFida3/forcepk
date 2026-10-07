import Link from "next/link";
import Icon from "@/components/Icon";
import { getLeads } from "@/lib/queries";
import { createLead, setLeadStage } from "@/lib/mutations";

export const metadata = { title: "CRM" };
export const dynamic = "force-dynamic";

const STAGES = ["NEW", "CONTACTED", "MEETING", "PROPOSAL", "AGREEMENT", "WON", "LOST"] as const;
const NEXT: Record<string, (typeof STAGES)[number] | null> = { NEW: "CONTACTED", CONTACTED: "MEETING", MEETING: "PROPOSAL", PROPOSAL: "AGREEMENT", AGREEMENT: "WON", WON: null, LOST: null };
const tone: Record<string, string> = { NEW: "bg-navy/10 text-navy", CONTACTED: "bg-blue-100 text-blue-700", MEETING: "bg-amber-100 text-amber-700", PROPOSAL: "bg-purple-100 text-purple-700", AGREEMENT: "bg-teal-100 text-teal-700", WON: "bg-brand/10 text-brand-dark", LOST: "bg-red-100 text-red-700" };

export default async function CrmPage() {
  const leads = await getLeads();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-navy">CRM — Sales Pipeline</h1><p className="text-sm text-navy/60">Track leads from first contact to active client.</p></div>

      <form action={createLead} className="card grid gap-3 p-5 sm:grid-cols-5">
        <input name="name" required placeholder="Contact name *" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
        <input name="company" placeholder="Company" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
        <input name="email" placeholder="Email" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
        <input name="source" placeholder="Source (e.g. WhatsApp)" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
        <button className="btn-primary">Add Lead</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Lead</th><th className="px-5 py-3 font-medium">Company</th><th className="px-5 py-3 font-medium">Source</th><th className="px-5 py-3 font-medium">Stage</th><th className="px-5 py-3 text-right font-medium">Action</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {leads.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-navy/40">No leads yet — add your first above.</td></tr>}
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="px-5 py-3"><Link href={`/admin/crm/${l.id}`} className="font-medium text-navy hover:text-brand">{l.name}</Link><div className="text-xs text-navy/40">{l.email ?? l.phone ?? "—"}</div></td>
                <td className="px-5 py-3 text-navy/60">{l.company ?? "—"}</td>
                <td className="px-5 py-3 text-navy/60">{l.source ?? "—"}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[l.stage]}`}>{l.stage}</span></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/crm/${l.id}`} className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:border-brand hover:text-brand">Edit</Link>
                    {NEXT[l.stage] && (
                      <form action={setLeadStage.bind(null, l.id, NEXT[l.stage]!)}>
                        <button className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">→ {NEXT[l.stage]}</button>
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
  );
}
