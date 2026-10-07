import Link from "next/link";
import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { setOepStatus } from "@/lib/mutations";

export const metadata = { title: "Recruitment Partners" };
export const dynamic = "force-dynamic";

const tone: Record<string, string> = { VERIFIED: "bg-brand/10 text-brand-dark", PENDING: "bg-amber-100 text-amber-700", SUSPENDED: "bg-red-100 text-red-700", REJECTED: "bg-navy/10 text-navy/60" };

export default async function AdminOeps() {
  const oeps = await prisma.oep.findMany({ take: 100, orderBy: { rating: "desc" }, select: { id: true, name: true, licenseNo: true, city: true, tier: true, rating: true, status: true, _count: { select: { applications: true } } } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-navy">Recruitment Partners</h1><p className="text-sm text-navy/60">{oeps.length} partner agencies in the network.</p></div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Partner</th><th className="px-5 py-3 font-medium">Tier</th><th className="px-5 py-3 font-medium">Rating</th><th className="px-5 py-3 font-medium">Submissions</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {oeps.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3"><div className="font-medium text-navy">{o.name}</div><div className="text-xs text-navy/40">{o.licenseNo} · {o.city ?? "—"}</div></td>
                <td className="px-5 py-3 text-navy/70">{o.tier}</td>
                <td className="px-5 py-3"><span className="flex items-center gap-1 font-semibold text-navy"><Icon name="star" className="h-4 w-4 text-brand" /> {o.rating.toFixed(1)}</span></td>
                <td className="px-5 py-3 text-navy/70">{o._count.applications}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[o.status]}`}>{o.status}</span></td>
                <td className="px-5 py-3"><div className="flex justify-end gap-2">
                  <Link href={`/admin/oeps/${o.id}`} className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:border-brand hover:text-brand">View</Link>
                  {o.status !== "VERIFIED" && <form action={setOepStatus.bind(null, o.id, "VERIFIED")}><button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Verify</button></form>}
                  {o.status === "SUSPENDED"
                    ? <form action={setOepStatus.bind(null, o.id, "VERIFIED")}><button className="rounded-md border border-brand/30 px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-brand/5">Reactivate</button></form>
                    : <form action={setOepStatus.bind(null, o.id, "SUSPENDED")}><button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Suspend</button></form>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
