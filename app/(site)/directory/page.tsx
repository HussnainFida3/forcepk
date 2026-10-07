import Link from "next/link";
import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Verified Employers" };
export const dynamic = "force-dynamic";

export default async function Directory() {
  const companies = await prisma.company.findMany({
    where: { status: "VERIFIED" }, take: 60, orderBy: { createdAt: "desc" },
    select: { id: true, name: true, industry: true, city: true, _count: { select: { requirements: true } } },
  });

  return (
    <>
      <section className="bg-navy py-14 text-white">
        <div className="container-fp">
          <span className="chip bg-brand/20 text-brand-light">Verified Employers</span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Companies hiring through ForcePK</h1>
          <p className="mt-3 max-w-2xl text-white/70">A directory of verified employers building their workforce with global talent.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-fp grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link key={c.id} href={`/company/${c.id}`} className="card p-5 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand font-bold">{c.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <h3 className="font-semibold text-navy">{c.name}</h3>
                  <p className="text-xs text-navy/50">{c.industry ?? "—"} · {c.city ?? "—"}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-brand-dark"><Icon name="check-circle" className="h-4 w-4" /> Verified</span>
                <span className="text-navy/50">{c._count.requirements} openings</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
