import Link from "next/link";
import Icon from "@/components/Icon";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getOepRequirements } from "@/lib/queries";

export const metadata = { title: "My Requirements" };
export const dynamic = "force-dynamic";

const tone: Record<string, string> = { OPEN: "bg-brand/10 text-brand-dark", CLOSED: "bg-navy/10 text-navy/60", FULFILLED: "bg-blue-100 text-blue-700" };

export default async function PartnerMyRequirements({ searchParams }: { searchParams: { created?: string } }) {
  const session = await auth();
  const me = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { oepId: true } }) : null;
  const reqs = await getOepRequirements(me?.oepId ?? undefined);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Requirements</h1>
          <p className="text-sm text-navy/60">Manpower requests you&apos;ve posted for your own projects.</p>
        </div>
        <Link href="/partner/post-requirement" className="btn-primary"><Icon name="doc" className="h-4 w-4" /> Post Requirement</Link>
      </div>

      {searchParams?.created && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark">
          <Icon name="check-circle" className="h-5 w-5" /> Requirement {searchParams.created} posted — ForcePK will start sourcing.
        </div>
      )}

      {reqs.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-dark"><Icon name="doc" className="h-6 w-6" /></span>
          <p className="font-semibold text-navy">No requirements posted yet</p>
          <Link href="/partner/post-requirement" className="btn-primary mt-1">Post your first requirement</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy/45">
              <tr><th className="px-5 py-3 font-medium">Requirement</th><th className="px-5 py-3 font-medium">Location</th><th className="px-5 py-3 font-medium">Qty</th><th className="px-5 py-3 font-medium">Expires</th><th className="px-5 py-3 font-medium">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {reqs.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3"><div className="font-medium text-navy">{r.title}</div><div className="text-xs text-navy/40">{r.refCode} · {r.profession}</div></td>
                  <td className="px-5 py-3 text-navy/60">{r.location}</td>
                  <td className="px-5 py-3 text-navy/70">{r.quantity}</td>
                  <td className="px-5 py-3 text-navy/55">{r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[r.status] ?? "bg-navy/10 text-navy/60"}`}>{r.status.replace(/_/g, " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
