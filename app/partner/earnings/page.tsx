import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { getPartnerEarnings } from "@/lib/queries";

export const metadata = { title: "Earnings" };
export const dynamic = "force-dynamic";

const money = (n: number, c = "USD") => `${c === "USD" ? "$" : c + " "}${n.toLocaleString()}`;
const statusTone: Record<string, string> = { PENDING: "bg-navy/10 text-navy/60", APPROVED: "bg-blue-100 text-blue-700", PAYABLE: "bg-amber-100 text-amber-700", PAID: "bg-brand/10 text-brand-dark" };

export default async function PartnerEarnings() {
  const u = await currentUser();
  const { rows, totals } = await getPartnerEarnings(u?.oepId ?? undefined);

  const cards = [
    { label: "Lifetime earnings", value: totals.lifetime, icon: "award", tone: "bg-brand/10 text-brand-dark" },
    { label: "Paid out", value: totals.paid, icon: "check-circle", tone: "bg-brand/10 text-brand-dark" },
    { label: "Payable", value: totals.payable, icon: "clock", tone: "bg-amber-100 text-amber-700" },
    { label: "Pending", value: totals.pending, icon: "doc", tone: "bg-navy/10 text-navy" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Earnings</h1>
        <p className="text-sm text-navy/60">Commissions earned on successfully deployed candidates.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${c.tone}`}><Icon name={c.icon} className="h-5 w-5" /></span>
            <div className="mt-3 text-2xl font-extrabold text-navy">{money(c.value)}</div>
            <div className="text-xs text-navy/55">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase text-navy/45"><tr><th className="px-5 py-3 font-medium">Candidate</th><th className="px-5 py-3 font-medium">Requirement</th><th className="px-5 py-3 font-medium">Gross</th><th className="px-5 py-3 font-medium">Your share</th><th className="px-5 py-3 font-medium">Status</th></tr></thead>
          <tbody className="divide-y divide-navy/10">
            {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-navy/40">No commissions yet — they appear when your candidates are deployed.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3 font-medium text-navy">{r.application.candidate.user.name}</td>
                <td className="px-5 py-3 text-navy/60">{r.application.requirement.refCode}</td>
                <td className="px-5 py-3 text-navy/70">{money(Number(r.grossFee), r.currency)}</td>
                <td className="px-5 py-3 font-semibold text-brand-dark">{money(Number(r.oepShare), r.currency)}</td>
                <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[r.status]}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
