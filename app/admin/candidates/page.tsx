import Link from "next/link";
import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { deleteCandidate } from "@/lib/mutations";

export const metadata = { title: "Candidates" };
export const dynamic = "force-dynamic";

export default async function AdminCandidates({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams?.q?.trim();
  const candidates = await prisma.candidateProfile.findMany({
    where: q ? { OR: [{ profession: { contains: q, mode: "insensitive" } }, { city: { contains: q, mode: "insensitive" } }, { user: { name: { contains: q, mode: "insensitive" } } }] } : {},
    take: 100, orderBy: { createdAt: "desc" },
    select: { id: true, profession: true, city: true, experienceYrs: true, profileStrength: true, user: { select: { name: true } }, _count: { select: { applications: true } } },
  });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-navy">Candidates</h1><p className="text-sm text-navy/60">{candidates.length} candidate profiles{q ? ` matching “${q}”` : ""}.</p></div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Name</th><th className="px-5 py-3 font-medium">Profession</th><th className="px-5 py-3 font-medium">City</th><th className="px-5 py-3 font-medium">Exp</th><th className="px-5 py-3 font-medium">Applications</th><th className="px-5 py-3 font-medium">Profile</th><th className="px-5 py-3 text-right font-medium">Action</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {candidates.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-navy/40">No candidates found.</td></tr>}
            {candidates.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-medium text-navy">{c.user.name}</td>
                <td className="px-5 py-3 text-navy/70">{c.profession ?? "—"}</td>
                <td className="px-5 py-3 text-navy/60">{c.city ?? "—"}</td>
                <td className="px-5 py-3 text-navy/60">{c.experienceYrs}y</td>
                <td className="px-5 py-3 text-navy/70">{c._count.applications}</td>
                <td className="px-5 py-3"><span className="flex items-center gap-1 text-xs font-semibold text-brand-dark"><Icon name="check-circle" className="h-4 w-4" /> {c.profileStrength}%</span></td>
                <td className="px-5 py-3"><div className="flex justify-end gap-2">
                  <Link href={`/admin/candidates/${c.id}`} className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand">View</Link>
                  <Link href={`/admin/candidates/${c.id}/edit`} className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:border-brand hover:text-brand">Edit</Link>
                  <form action={deleteCandidate.bind(null, c.id)}><button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button></form>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
