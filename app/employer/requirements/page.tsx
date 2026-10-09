import Link from "next/link";
import Icon from "@/components/Icon";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEmployerRequirements } from "@/lib/queries";

export const metadata = { title: "My Requirements" };
export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  DRAFT: "bg-navy/10 text-navy/60",
  PENDING_VERIFICATION: "bg-amber-100 text-amber-700",
  OPEN: "bg-brand/10 text-brand-dark",
  SHORTLISTING: "bg-amber-100 text-amber-700",
  INTERVIEWING: "bg-blue-100 text-blue-700",
  FULFILLED: "bg-brand/10 text-brand-dark",
  CLOSED: "bg-navy/10 text-navy/60",
};

export default async function EmployerRequirements() {
  const session = await auth();
  const me = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true } }) : null;
  const reqs = await getEmployerRequirements(me?.companyId ?? undefined);
  const open = reqs.filter((r) => r.status === "OPEN").length;
  const totalApplicants = reqs.reduce((t, r) => t + r._count.applications, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Requirements</h1>
          <p className="text-sm text-navy/60">{reqs.length} requirements · {open} open · {totalApplicants} applicants received.</p>
        </div>
        <Link href="/employer/requirements/new" className="btn-primary"><Icon name="doc" className="h-4 w-4" /> Post Requirement</Link>
      </div>

      {reqs.length === 0 ? (
        <div className="card grid place-items-center gap-3 p-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-dark"><Icon name="doc" className="h-6 w-6" /></span>
          <p className="font-semibold text-navy">No requirements yet</p>
          <p className="max-w-sm text-sm text-navy/55">Post your first manpower requirement and our team will start sourcing verified candidates.</p>
          <Link href="/employer/requirements/new" className="btn-primary mt-1">Post your first requirement</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy/45">
              <tr><th className="px-5 py-3 font-medium">Requirement</th><th className="px-5 py-3 font-medium">Location</th><th className="px-5 py-3 font-medium">Qty</th><th className="px-5 py-3 font-medium">Applicants</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {reqs.map((r) => (
                <tr key={r.id} className={r.priority === "URGENT" ? "bg-red-50/40" : ""}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 font-medium text-navy">
                      {r.priority === "URGENT" && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">URGENT</span>}
                      {r.title}
                    </div>
                    <div className="text-xs text-navy/40">{r.refCode} · {r.profession}</div>
                  </td>
                  <td className="px-5 py-3 text-navy/60">{r.location}</td>
                  <td className="px-5 py-3 text-navy/70">{r.quantity}</td>
                  <td className="px-5 py-3 font-semibold text-navy">{r._count.applications}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[r.status] ?? "bg-navy/10 text-navy/60"}`}>{r.status.replace(/_/g, " ")}</span></td>
                  <td className="px-5 py-3 text-right"><Link href="/employer/pipeline" className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand">View pipeline</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
