import Icon from "@/components/Icon";
import { prisma } from "@/lib/prisma";
import { getFinance } from "@/lib/queries";
import { createInvoice, setInvoiceStatus, setCommissionStatus, payInvoice, voidInvoice, deleteInvoice } from "@/lib/mutations";

export const metadata = { title: "Finance" };
export const dynamic = "force-dynamic";

const money = (n: unknown, c = "USD") => `${c === "USD" ? "$" : c + " "}${Number(n).toLocaleString()}`;

export default async function FinancePage() {
  const { invoices, commissions } = await getFinance();
  const companies = await prisma.company.findMany({ where: { status: "VERIFIED" }, select: { id: true, name: true }, take: 50, orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Finance</h1>
        <p className="text-sm text-navy/60">Client invoices and OEP commission payouts.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* New invoice */}
        <form action={createInvoice} className="card h-fit p-6">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="award" className="h-5 w-5 text-brand" /> New Invoice</h2>
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-navy/70">Client</span>
            <select name="companyId" required className="rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">
              <option value="">Select company…</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="mt-3 flex flex-col gap-1.5">
            <span className="text-xs font-medium text-navy/70">Amount (USD)</span>
            <input name="amount" type="number" placeholder="5000" required className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
          </label>
          <button className="btn-primary mt-4 w-full">Create Invoice</button>
        </form>

        {/* Invoices */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-navy">Client Invoices</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase text-navy/40"><tr><th className="pb-2 font-medium">Client</th><th className="pb-2 font-medium">Amount</th><th className="pb-2 font-medium">Status</th><th className="pb-2 text-right font-medium">Action</th></tr></thead>
              <tbody className="divide-y divide-navy/10">
                {invoices.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-navy/40">No invoices yet.</td></tr>}
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2.5 font-medium text-navy">{i.company.name}</td>
                    <td className="py-2.5 font-semibold text-navy">{money(i.amount, i.currency)}</td>
                    <td className="py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${i.status === "PAID" ? "bg-brand/10 text-brand-dark" : i.status === "VOID" ? "bg-navy/10 text-navy/50" : "bg-amber-100 text-amber-700"}`}>{i.status}</span></td>
                    <td className="py-2.5 text-right">
                      <div className="flex flex-wrap justify-end gap-3">
                        {i.status !== "PAID" && i.status !== "VOID" && <>
                          <form action={payInvoice.bind(null, i.id)}><button className="text-xs font-semibold text-brand">Pay online</button></form>
                          <form action={setInvoiceStatus.bind(null, i.id, "PAID")}><button className="text-xs font-semibold text-navy/50 hover:text-navy">Mark paid</button></form>
                          <form action={voidInvoice.bind(null, i.id)}><button className="text-xs font-semibold text-amber-600 hover:text-amber-700">Void</button></form>
                        </>}
                        <form action={deleteInvoice.bind(null, i.id)}><button className="text-xs font-semibold text-red-500 hover:text-red-600">Delete</button></form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Commissions */}
      <div className="card p-6">
        <h2 className="font-semibold text-navy">OEP Commissions</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase text-navy/40"><tr><th className="pb-2 font-medium">Partner</th><th className="pb-2 font-medium">Gross</th><th className="pb-2 font-medium">OEP Share</th><th className="pb-2 font-medium">Status</th><th className="pb-2 text-right font-medium">Action</th></tr></thead>
            <tbody className="divide-y divide-navy/10">
              {commissions.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-navy/40">No commissions yet — deploy a candidate to generate one.</td></tr>}
              {commissions.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 font-medium text-navy">{c.oep.name}</td>
                  <td className="py-2.5">{money(c.grossFee, c.currency)}</td>
                  <td className="py-2.5 font-semibold text-brand-dark">{money(c.oepShare, c.currency)}</td>
                  <td className="py-2.5"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.status === "PAID" ? "bg-brand/10 text-brand-dark" : "bg-navy/10 text-navy/60"}`}>{c.status}</span></td>
                  <td className="py-2.5 text-right">
                    {c.status !== "PAID" && <form action={setCommissionStatus.bind(null, c.id, "PAID")}><button className="text-xs font-semibold text-brand">Mark paid</button></form>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
