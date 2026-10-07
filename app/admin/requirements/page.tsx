import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { createAdminRequirement, setRequirementStatus, toggleRequirementPriority } from "@/lib/mutations";

export const metadata = { title: "Requirements" };
export const dynamic = "force-dynamic";

const tone: Record<string, string> = { OPEN: "bg-brand/10 text-brand-dark", DRAFT: "bg-navy/10 text-navy/60", SHORTLISTING: "bg-amber-100 text-amber-700", INTERVIEWING: "bg-blue-100 text-blue-700", FULFILLED: "bg-brand/10 text-brand-dark", CLOSED: "bg-navy/10 text-navy/60", PENDING_VERIFICATION: "bg-amber-100 text-amber-700" };

export default async function AdminRequirements() {
  const [reqs, companies] = await Promise.all([
    prisma.requirement.findMany({ take: 100, orderBy: { createdAt: "desc" }, select: { id: true, refCode: true, title: true, profession: true, quantity: true, location: true, status: true, priority: true, company: { select: { name: true } }, _count: { select: { applications: true } } } }),
    prisma.company.findMany({ where: { status: "VERIFIED" }, select: { id: true, name: true }, take: 100, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-navy">Requirements</h1><p className="text-sm text-navy/60">{reqs.length} manpower requirements across all clients.</p></div>

      {/* Create */}
      <form action={createAdminRequirement} className="card grid gap-3 p-5 sm:grid-cols-3 lg:grid-cols-6">
        <select name="companyId" required className="rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand sm:col-span-2">
          <option value="">Client company…</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="profession" required placeholder="Profession *" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
        <input name="quantity" placeholder="Qty" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
        <input name="location" placeholder="Location" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
        <select name="priority" className="rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand"><option value="NORMAL">Normal</option><option value="URGENT">Urgent</option></select>
        <button className="btn-primary sm:col-span-3 lg:col-span-6"><Icon name="doc" className="h-4 w-4" /> Create Requirement</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Requirement</th><th className="px-5 py-3 font-medium">Client</th><th className="px-5 py-3 font-medium">Qty</th><th className="px-5 py-3 font-medium">Applicants</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {reqs.map((r) => (
              <tr key={r.id} className={r.priority === "URGENT" ? "bg-red-50/40" : ""}>
                <td className="px-5 py-3"><div className="flex items-center gap-1.5 font-medium text-navy">{r.priority === "URGENT" && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">URGENT</span>}{r.title}</div><div className="text-xs text-navy/40">{r.refCode} · {r.profession} · {r.location}</div></td>
                <td className="px-5 py-3 text-navy/60">{r.company.name}</td>
                <td className="px-5 py-3 text-navy/70">{r.quantity}</td>
                <td className="px-5 py-3 text-navy/70">{r._count.applications}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[r.status]}`}>{r.status.replace(/_/g, " ")}</span></td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <form action={toggleRequirementPriority.bind(null, r.id, r.priority)}><button className="rounded-md border border-navy/15 px-2.5 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand">{r.priority === "URGENT" ? "Unflag" : "Prioritize"}</button></form>
                    {r.status === "CLOSED"
                      ? <form action={setRequirementStatus.bind(null, r.id, "OPEN")}><button className="rounded-md bg-brand px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Reopen</button></form>
                      : <form action={setRequirementStatus.bind(null, r.id, "CLOSED")}><button className="rounded-md border border-navy/15 px-2.5 py-1.5 text-xs font-semibold text-navy/60 hover:text-navy">Close</button></form>}
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
