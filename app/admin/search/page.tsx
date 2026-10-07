import Link from "next/link";
import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Search" };
export const dynamic = "force-dynamic";

export default async function AdminSearch({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams?.q?.trim() ?? "";
  const ci = { contains: q, mode: "insensitive" as const };
  const [companies, candidates, requirements, oeps] = q
    ? await Promise.all([
        prisma.company.findMany({ where: { OR: [{ name: ci }, { crNumber: ci }, { city: ci }] }, take: 10, select: { id: true, name: true, city: true, status: true } }),
        prisma.candidateProfile.findMany({ where: { OR: [{ profession: ci }, { city: ci }, { passportNo: ci }, { user: { name: ci } }] }, take: 10, select: { id: true, profession: true, city: true, user: { select: { name: true } } } }),
        prisma.requirement.findMany({ where: { OR: [{ title: ci }, { refCode: ci }, { profession: ci }, { location: ci }] }, take: 10, select: { id: true, refCode: true, title: true, location: true } }),
        prisma.oep.findMany({ where: { OR: [{ name: ci }, { licenseNo: ci }, { city: ci }] }, take: 10, select: { id: true, name: true, city: true, tier: true } }),
      ])
    : [[], [], [], []] as const;

  const total = companies.length + candidates.length + requirements.length + oeps.length;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-navy">Search results</h1><p className="text-sm text-navy/60">{q ? `${total} results for “${q}”` : "Type a query in the search bar above."}</p></div>

      <Section title="Companies" icon="building" items={companies.map((c) => ({ key: c.id, href: "/admin/companies", main: c.name, sub: `${c.city ?? "—"} · ${c.status}` }))} />
      <Section title="Candidates" icon="users" items={candidates.map((c) => ({ key: c.id, href: "/admin/candidates", main: c.user.name, sub: `${c.profession ?? "—"} · ${c.city ?? "—"}` }))} />
      <Section title="Requirements" icon="doc" items={requirements.map((r) => ({ key: r.id, href: "/admin/requirements", main: r.title, sub: `${r.refCode} · ${r.location}` }))} />
      <Section title="Partners" icon="handshake" items={oeps.map((o) => ({ key: o.id, href: "/admin/oeps", main: o.name, sub: `${o.city ?? "—"} · ${o.tier}` }))} />
    </div>
  );
}

function Section({ title, icon, items }: { title: string; icon: string; items: { key: string; href: string; main: string; sub: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name={icon} className="h-5 w-5 text-brand" /> {title} <span className="text-xs font-normal text-navy/40">({items.length})</span></h2>
      <div className="mt-3 divide-y divide-navy/10">
        {items.map((i) => (
          <Link key={i.key} href={i.href} className="flex items-center justify-between py-2.5 hover:text-brand">
            <span className="text-sm font-medium text-navy">{i.main}</span>
            <span className="text-xs text-navy/50">{i.sub}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
