import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { deleteCvDrop, markCvDropReviewed } from "@/lib/mutations";

export const metadata = { title: "CV Drops" };
export const dynamic = "force-dynamic";

export default async function CvDropsPage() {
  const [rows, total, newCount] = await Promise.all([
    prisma.cvDrop.findMany({ orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.cvDrop.count(),
    prisma.cvDrop.count({ where: { reviewed: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">CV Drops</h1>
          <p className="text-sm text-navy/60">CVs uploaded via the public <span className="font-mono text-xs">/apply</span> page — no account needed.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-navy/10 px-3 py-1.5 font-semibold text-navy/70">{total} total</span>
          <span className="rounded-full bg-brand/10 px-3 py-1.5 font-semibold text-brand-dark">{newCount} to review</span>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Contact</th><th className="px-5 py-3 font-medium">Profession</th><th className="px-5 py-3 font-medium">Uploaded</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-navy/40">No CVs uploaded yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className={r.reviewed ? "opacity-60" : ""}>
                <td className="px-5 py-3">
                  <div className="font-medium text-navy">{r.name}</div>
                  {r.note && <div className="max-w-xs truncate text-xs text-navy/45">{r.note}</div>}
                </td>
                <td className="px-5 py-3 text-navy/60">
                  <div>{r.phone ?? "—"}</div>
                  <div className="text-xs text-navy/40">{r.email ?? ""}</div>
                </td>
                <td className="px-5 py-3 text-navy/60">{r.profession ?? "—"}</td>
                <td className="px-5 py-3 text-xs text-navy/45">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <a href={r.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"><Icon name="doc" className="h-3.5 w-3.5" /> CV</a>
                    <form action={markCvDropReviewed.bind(null, r.id, !r.reviewed)}>
                      <button className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:border-brand hover:text-brand">{r.reviewed ? "Reopen" : "Reviewed"}</button>
                    </form>
                    <form action={deleteCvDrop.bind(null, r.id)}>
                      <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                    </form>
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
