import Icon from "@/components/Icon";
import { integrationStatuses } from "@/lib/integrations/config";

export const metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

export default function IntegrationsPage() {
  const items = integrationStatuses();
  const connected = items.filter((i) => i.connected).length;
  const cats = [...new Set(items.map((i) => i.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Integrations</h1>
        <p className="text-sm text-navy/60">{connected} of {items.length} connected. Each lights up automatically when its API keys are added to the environment — no code changes needed.</p>
      </div>

      {cats.map((cat) => (
        <div key={cat}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy/40">{cat}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.filter((i) => i.category === cat).map((i) => (
              <div key={i.key} className="card p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-navy">{i.name}</h3>
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${i.connected ? "bg-brand/10 text-brand-dark" : "bg-navy/10 text-navy/50"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${i.connected ? "bg-brand" : "bg-navy/30"}`} /> {i.connected ? "Connected" : "Not connected"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-navy/60">{i.note}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {i.env.map((e) => (
                    <code key={e} className="rounded bg-navy/5 px-1.5 py-0.5 text-[11px] text-navy/60">{e}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-2xl bg-navy p-5 text-sm text-white/80">
        <span className="flex items-center gap-2 font-semibold text-white"><Icon name="shield" className="h-5 w-5 text-brand-light" /> How to connect</span>
        <p className="mt-2">Add the listed environment variables to <code className="rounded bg-white/10 px-1">.env</code> (see <code className="rounded bg-white/10 px-1">.env.example</code>) and restart. The feature activates instantly — notifications start sending, AI answers go free-form, payments open real checkout, and interviews generate real meeting links.</p>
      </div>
    </div>
  );
}
