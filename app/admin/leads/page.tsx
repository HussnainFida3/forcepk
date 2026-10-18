import Link from "next/link";
import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import {
  runCollectLeads, runHiringScan, setHiringStatus, rescanCompany,
  deleteHiringCompany, deleteDiscoveredJob, convertHiringToLead, deleteLead,
} from "./actions";

export const metadata = { title: "Lead Gen" };
export const dynamic = "force-dynamic";

const COUNTRIES = ["Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman", "Bahrain"];
const HSTATUS = ["ACTIVELY_HIRING", "QUIET", "UNREACHABLE", "UNKNOWN"];
const statusTone: Record<string, string> = {
  ACTIVELY_HIRING: "bg-brand/10 text-brand-dark", QUIET: "bg-amber-100 text-amber-700",
  UNREACHABLE: "bg-red-100 text-red-600", UNKNOWN: "bg-navy/10 text-navy/60",
};

export default async function LeadGenPage({ searchParams }: { searchParams: { tab?: string; country?: string; status?: string } }) {
  const tab = searchParams.tab === "crm" ? "crm" : "hiring";
  const fCountry = searchParams.country || "";
  const fStatus = searchParams.status || "";

  const where: Record<string, unknown> = {};
  if (fCountry) where.country = fCountry;
  if (fStatus) where.status = fStatus;

  const [scanned, hiring, quiet, jobsCount, leadsTotal, companies, leads] = await Promise.all([
    prisma.hiringCompany.count(),
    prisma.hiringCompany.count({ where: { status: "ACTIVELY_HIRING" } }),
    prisma.hiringCompany.count({ where: { status: "QUIET" } }),
    prisma.discoveredJob.count(),
    prisma.lead.count(),
    prisma.hiringCompany.findMany({ where, orderBy: [{ status: "asc" }, { lastCheckedAt: "desc" }], take: 200, include: { jobs: { orderBy: { title: "asc" } } } }),
    prisma.lead.findMany({ orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, name: true, company: true, email: true, phone: true, source: true, stage: true, createdAt: true } }),
  ]);

  const qs = (o: Record<string, string>) => {
    const p = new URLSearchParams({ tab, ...(fCountry ? { country: fCountry } : {}), ...(fStatus ? { status: fStatus } : {}), ...o });
    return `/admin/leads?${p.toString()}`;
  };

  const tile = (label: string, value: number, tone: string) => (
    <div className="card p-4"><div className={`text-2xl font-extrabold ${tone}`}>{value}</div><div className="mt-1 text-xs text-navy/55">{label}</div></div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Lead Generation</h1>
        <p className="text-sm text-navy/60">Scan employer career pages and collect business leads — results land here instantly, ready to work.</p>
      </div>

      {/* Deterministic collectors */}
      <div className="grid gap-4 lg:grid-cols-2">
        <form action={runHiringScan} className="card flex flex-wrap items-end gap-3 p-5">
          <div className="min-w-[160px] flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-navy/50">Scan hiring signals</label>
            <select name="country" className="mt-1.5 w-full rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-20"><label className="text-xs text-navy/50">Count</label><input name="limit" type="number" min={1} max={6} defaultValue={6} className="mt-1.5 w-full rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" /></div>
          <button className="btn-primary"><Icon name="search" className="h-4 w-4" /> Scan now</button>
        </form>

        <form action={runCollectLeads} className="card flex flex-wrap items-end gap-3 p-5">
          <div className="min-w-[160px] flex-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-navy/50">Collect business leads (OSM)</label>
            <select name="region" className="mt-1.5 w-full rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-20"><label className="text-xs text-navy/50">Count</label><input name="limit" type="number" min={1} max={100} defaultValue={25} className="mt-1.5 w-full rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" /></div>
          <button className="btn-outline"><Icon name="users" className="h-4 w-4" /> Collect</button>
        </form>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tile("Companies scanned", scanned, "text-navy")}
        {tile("Actively hiring", hiring, "text-brand-dark")}
        {tile("Quiet", quiet, "text-amber-600")}
        {tile("Jobs discovered", jobsCount, "text-navy")}
        {tile("CRM leads", leadsTotal, "text-navy")}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-navy/10">
        <Link href={qs({ tab: "hiring" })} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === "hiring" ? "border-brand text-brand-dark" : "border-transparent text-navy/50 hover:text-navy"}`}>Hiring Signals ({scanned})</Link>
        <Link href={qs({ tab: "crm" })} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === "crm" ? "border-brand text-brand-dark" : "border-transparent text-navy/50 hover:text-navy"}`}>Business Leads ({leadsTotal})</Link>
      </div>

      {tab === "hiring" ? (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-navy/50">Country:</span>
            <Link href={qs({ country: "" })} className={`rounded-full px-3 py-1 font-medium ${!fCountry ? "bg-brand text-white" : "border border-navy/15 text-navy/60"}`}>All</Link>
            {COUNTRIES.map((c) => <Link key={c} href={qs({ country: c })} className={`rounded-full px-3 py-1 font-medium ${fCountry === c ? "bg-brand text-white" : "border border-navy/15 text-navy/60 hover:border-brand"}`}>{c}</Link>)}
            <span className="ml-3 font-semibold text-navy/50">Status:</span>
            <Link href={qs({ status: "" })} className={`rounded-full px-3 py-1 font-medium ${!fStatus ? "bg-navy text-white" : "border border-navy/15 text-navy/60"}`}>All</Link>
            {HSTATUS.map((s) => <Link key={s} href={qs({ status: s })} className={`rounded-full px-3 py-1 font-medium ${fStatus === s ? "bg-navy text-white" : "border border-navy/15 text-navy/60 hover:border-brand"}`}>{s.replace("_", " ")}</Link>)}
          </div>

          <div className="space-y-3">
            {companies.length === 0 && <div className="card p-10 text-center text-sm text-navy/50">No scanned companies yet — run a scan above.</div>}
            {companies.map((c) => (
              <div key={c.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-navy">{c.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone[c.status] ?? statusTone.UNKNOWN}`}>{c.status.replace("_", " ")}</span>
                      {c.country && <span className="text-xs text-navy/45">{c.country}</span>}
                    </div>
                    <p className="mt-1 text-xs text-navy/55">{c.signal ?? "—"}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-navy/45">
                      {c.careerUrl && <a href={c.careerUrl} target="_blank" rel="noreferrer" className="hover:text-brand">Careers ↗</a>}
                      <span>{c.jobs.length} jobs found</span>
                      {c.lastCheckedAt && <span>Checked {c.lastCheckedAt.toISOString().slice(0, 10)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={setHiringStatus.bind(null, c.id)} className="flex items-center gap-1">
                      <select name="status" defaultValue={c.status} className="rounded-md border border-navy/15 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand">
                        {HSTATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                      </select>
                      <button className="rounded-md border border-navy/15 px-2 py-1.5 text-xs font-semibold text-navy/70 hover:border-brand hover:text-brand">Save</button>
                    </form>
                    <form action={rescanCompany.bind(null, c.id)}><button className="rounded-md border border-navy/15 px-2.5 py-1.5 text-xs font-semibold text-navy/70 hover:border-brand hover:text-brand">Re-scan</button></form>
                    <form action={convertHiringToLead.bind(null, c.id)}><button className="rounded-md bg-brand px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">→ CRM lead</button></form>
                    <form action={deleteHiringCompany.bind(null, c.id)}><button className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button></form>
                  </div>
                </div>

                {c.jobs.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-brand-dark">View {c.jobs.length} scraped jobs</summary>
                    <ul className="mt-2 divide-y divide-navy/5 rounded-lg border border-navy/10">
                      {c.jobs.map((j) => (
                        <li key={j.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                          <span className="min-w-0"><span className="font-medium text-navy">{j.title}</span>{j.location && <span className="text-navy/45"> · {j.location}</span>}</span>
                          <form action={deleteDiscoveredJob.bind(null, j.id)}><button className="text-xs text-navy/35 hover:text-red-500">Remove</button></form>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Lead</th><th className="px-5 py-3 font-medium">Company</th><th className="px-5 py-3 font-medium">Source</th><th className="px-5 py-3 font-medium">Stage</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
            <tbody className="divide-y divide-navy/10">
              {leads.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-navy/40">No leads yet — collect some above.</td></tr>}
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="px-5 py-3"><Link href={`/admin/crm/${l.id}`} className="font-medium text-navy hover:text-brand">{l.name}</Link><div className="text-xs text-navy/40">{l.email ?? l.phone ?? "—"}</div></td>
                  <td className="px-5 py-3 text-navy/60">{l.company ?? "—"}</td>
                  <td className="px-5 py-3 text-navy/60">{l.source ?? "—"}</td>
                  <td className="px-5 py-3"><span className="rounded-full bg-navy/10 px-2.5 py-1 text-xs font-medium text-navy/70">{l.stage}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/crm/${l.id}`} className="rounded-md border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:border-brand hover:text-brand">Open</Link>
                      <form action={deleteLead.bind(null, l.id)}><button className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button></form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
