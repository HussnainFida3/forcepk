import { prisma } from "@/lib/prisma";
import { setCompanyStatus } from "@/lib/mutations";

export const metadata = { title: "Companies" };
export const dynamic = "force-dynamic";

const tone: Record<string, string> = { VERIFIED: "bg-brand/10 text-brand-dark", PENDING: "bg-amber-100 text-amber-700", SUSPENDED: "bg-red-100 text-red-700", REJECTED: "bg-navy/10 text-navy/60" };

export default async function AdminCompanies() {
  const companies = await prisma.company.findMany({ take: 100, orderBy: { createdAt: "desc" }, select: { id: true, name: true, crNumber: true, city: true, industry: true, status: true, _count: { select: { requirements: true } } } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-navy">Companies</h1><p className="text-sm text-navy/60">{companies.length} employer accounts. Verify, suspend or reactivate.</p></div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Company</th><th className="px-5 py-3 font-medium">Location</th><th className="px-5 py-3 font-medium">Reqs</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {companies.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3"><div className="font-medium text-navy">{c.name}</div><div className="text-xs text-navy/40">{c.crNumber} · {c.industry ?? "—"}</div></td>
                <td className="px-5 py-3 text-navy/60">{c.city ?? "—"}</td>
                <td className="px-5 py-3 text-navy/70">{c._count.requirements}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[c.status]}`}>{c.status}</span></td>
                <td className="px-5 py-3"><div className="flex justify-end gap-2">
                  {c.status !== "VERIFIED" && <form action={setCompanyStatus.bind(null, c.id, "VERIFIED")}><button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Verify</button></form>}
                  {c.status !== "SUSPENDED" && <form action={setCompanyStatus.bind(null, c.id, "SUSPENDED")}><button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Suspend</button></form>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
