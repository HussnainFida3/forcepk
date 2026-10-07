import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CompanyProfile({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, industry: true, city: true, website: true, about: true, status: true,
      requirements: { where: { status: "OPEN" }, take: 10, select: { id: true, refCode: true, title: true, profession: true, location: true, salary: true } },
      _count: { select: { requirements: true } },
    },
  });
  if (!company || company.status !== "VERIFIED") notFound();

  return (
    <>
      <section className="bg-navy py-14 text-white">
        <div className="container-fp flex flex-wrap items-center gap-5">
          <span className="grid h-20 w-20 place-items-center rounded-2xl bg-white/10 text-2xl font-bold">{company.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold">{company.name}</h1>
              <span className="chip bg-brand/20 text-brand-light"><Icon name="check-circle" className="h-3.5 w-3.5" /> Verified</span>
            </div>
            <p className="mt-1 text-white/70">{company.industry ?? "—"} · {company.city ?? "—"}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-fp grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-navy">About</h2>
            <p className="mt-3 text-navy/70">{company.about ?? "This verified employer hires skilled, semi-skilled and professional manpower through ForcePK's trusted recruitment network."}</p>

            <h2 className="mt-10 text-xl font-bold text-navy">Open positions</h2>
            <div className="mt-4 space-y-3">
              {company.requirements.length === 0 && <p className="text-sm text-navy/40">No open positions right now.</p>}
              {company.requirements.map((r) => (
                <div key={r.id} className="card flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-semibold text-navy">{r.title}</h3>
                    <p className="text-xs text-navy/50">{r.refCode} · {r.profession} · {r.location}</p>
                  </div>
                  <div className="text-right">
                    {r.salary && <div className="text-sm font-semibold text-brand-dark">{r.salary}</div>}
                    <Link href="/login" className="text-xs font-semibold text-brand">Apply →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="h-fit card p-6">
            <h3 className="font-semibold text-navy">Company facts</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-navy/55">Industry</dt><dd className="font-medium text-navy">{company.industry ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-navy/55">Location</dt><dd className="font-medium text-navy">{company.city ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-navy/55">Total requirements</dt><dd className="font-medium text-navy">{company._count.requirements}</dd></div>
              <div className="flex justify-between"><dt className="text-navy/55">Status</dt><dd className="font-medium text-brand-dark">Verified</dd></div>
            </dl>
            {company.website && <a href={company.website} target="_blank" className="btn-outline mt-5 w-full text-xs">Visit website</a>}
            <Link href="/directory" className="mt-2 block text-center text-xs font-semibold text-brand">← All employers</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
