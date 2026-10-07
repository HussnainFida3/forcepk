import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { setDocumentStatus } from "@/lib/mutations";

export const metadata = { title: "Document Verification" };
export const dynamic = "force-dynamic";

const pretty = (s: string) => s.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");

export default async function AdminDocuments() {
  const docs = await prisma.document.findMany({
    where: { status: "PENDING" },
    take: 50, orderBy: { uploadedAt: "desc" },
    select: { id: true, type: true, fileUrl: true, candidate: { select: { user: { select: { name: true } }, profession: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Document Verification</h1>
        <p className="text-sm text-navy/60">Review uploaded candidate documents and flag issues for correction.</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45">
            <tr><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Document</th><th className="px-5 py-3 font-medium">File</th><th className="px-5 py-3 text-right font-medium">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {docs.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-navy/40">No documents pending review. 🎉</td></tr>}
            {docs.map((d) => (
              <tr key={d.id}>
                <td className="px-5 py-3"><div className="font-medium text-navy">{d.candidate.user.name}</div><div className="text-xs text-navy/45">{d.candidate.profession ?? "—"}</div></td>
                <td className="px-5 py-3 text-navy/70">{pretty(d.type)}</td>
                <td className="px-5 py-3">{d.fileUrl ? <a href={`/api/files/${d.fileUrl}`} target="_blank" className="text-xs font-semibold text-brand hover:underline">View</a> : <span className="text-xs text-navy/30">—</span>}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <form action={setDocumentStatus.bind(null, d.id, "VERIFIED")}>
                      <button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Verify</button>
                    </form>
                    <form action={setDocumentStatus.bind(null, d.id, "EXPIRED")}>
                      <button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Flag</button>
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
