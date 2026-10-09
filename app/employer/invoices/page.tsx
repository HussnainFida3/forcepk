import Icon from "@/components/Icon";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEmployerInvoices } from "@/lib/queries";
import { payInvoice } from "@/lib/mutations";

export const metadata = { title: "Invoices & Billing" };
export const dynamic = "force-dynamic";

const money = (n: unknown, c = "SAR") => `${c === "USD" ? "$" : c + " "}${Number(n).toLocaleString()}`;
const tone: Record<string, string> = { PAID: "bg-brand/10 text-brand-dark", VOID: "bg-navy/10 text-navy/50", PENDING: "bg-amber-100 text-amber-700" };

export default async function EmployerInvoices() {
  const session = await auth();
  const me = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { companyId: true } }) : null;
  const { invoices, totals } = await getEmployerInvoices(me?.companyId ?? undefined);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Invoices &amp; Billing</h1>
        <p className="text-sm text-navy/60">Your service invoices and payment history.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700"><Icon name="clock" className="h-5 w-5" /></span>
          <div><div className="text-2xl font-extrabold text-navy">{money(totals.outstanding, totals.currency)}</div><div className="text-xs text-navy/55">Outstanding</div></div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand-dark"><Icon name="check-circle" className="h-5 w-5" /></span>
          <div><div className="text-2xl font-extrabold text-navy">{money(totals.paid, totals.currency)}</div><div className="text-xs text-navy/55">Paid to date</div></div>
        </div>
        <div className="card flex items-center gap-3 p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy/10 text-navy/70"><Icon name="award" className="h-5 w-5" /></span>
          <div><div className="text-2xl font-extrabold text-navy">{invoices.length}</div><div className="text-xs text-navy/55">Total invoices</div></div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45">
            <tr><th className="px-5 py-3 font-medium">Invoice</th><th className="px-5 py-3 font-medium">Issued</th><th className="px-5 py-3 font-medium">Due</th><th className="px-5 py-3 font-medium">Amount</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {invoices.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-navy/40">No invoices yet.</td></tr>}
            {invoices.map((i) => (
              <tr key={i.id}>
                <td className="px-5 py-3 font-mono text-xs text-navy/60">#{i.id.slice(-8).toUpperCase()}</td>
                <td className="px-5 py-3 text-navy/60">{new Date(i.issuedAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-navy/60">{i.dueAt ? new Date(i.dueAt).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 font-semibold text-navy">{money(i.amount, i.currency)}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[i.status] ?? tone.PENDING}`}>{i.status}</span></td>
                <td className="px-5 py-3 text-right">
                  {i.status !== "PAID" && i.status !== "VOID"
                    ? <form action={payInvoice.bind(null, i.id)}><button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Pay now</button></form>
                    : <span className="text-xs text-navy/35">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
