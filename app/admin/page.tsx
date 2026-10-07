import Icon from "@/components/Icon";
import StatCard from "@/components/ui/StatCard";
import { AreaChart, Donut, BarChart, ColumnChart, RadialGauge, Heatmap, CHART_COLORS } from "@/components/ui/charts";
import { urgent, toneMap } from "@/lib/admin";
import { getCommandCenter, getAdminStats } from "@/lib/queries";
import { setCompanyStatus } from "@/lib/mutations";

export const dynamic = "force-dynamic";

const docTone: Record<string, string> = { VERIFIED: "text-brand-dark", PENDING: "text-amber-600", MISSING: "text-red-600", EXPIRED: "text-navy/50" };

export default async function CommandCenter() {
  const [cc, { pendingCompanies }] = await Promise.all([getCommandCenter(), getAdminStats()]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-navy p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(34,197,94,0.3),transparent)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">ForcePK Command Center</h1>
            <p className="mt-1 text-sm text-white/60">Real-time view of your entire recruitment operation.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-light" /> Live · updated just now
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cc.kpis.map((k) => <StatCard key={k.label} {...k} />)}
      </div>

      {/* Trend + pipeline distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-navy">Applications — last 14 days</h2>
              <p className="text-sm text-navy/50">Daily inbound candidate applications.</p>
            </div>
            <span className="chip">Live</span>
          </div>
          <div className="mt-4"><AreaChart data={cc.area.data} labels={cc.area.labels} /></div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Pipeline distribution</h2>
          <p className="text-sm text-navy/50">Candidates by stage.</p>
          <div className="mt-6 flex justify-center">
            <Donut segments={cc.stageDist.map((s, i) => ({ ...s, color: CHART_COLORS[i % CHART_COLORS.length] }))} />
          </div>
        </div>
      </div>

      {/* Conversion gauges */}
      <div className="card p-6">
        <h2 className="font-semibold text-navy">Conversion rates</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <RadialGauge value={cc.conversion.shortlistRate} label="Shortlist rate" />
          <RadialGauge value={cc.conversion.interviewRate} label="Interview rate" color="#3b82f6" />
          <RadialGauge value={cc.conversion.selectionRate} label="Selection rate" color="#8b5cf6" />
          <RadialGauge value={cc.conversion.deployRate} label="Deploy rate" color="#f59e0b" />
        </div>
      </div>

      {/* Demand breakdowns */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Top requested professions</h2>
          <div className="mt-4"><BarChart items={cc.professions} /></div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Demand by location</h2>
          <div className="mt-4"><BarChart items={cc.locations} /></div>
        </div>
      </div>

      {/* Deployments + documents + heatmap */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Deployments — 6 months</h2>
          <div className="mt-4"><ColumnChart items={cc.monthly} /></div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Document status</h2>
          <div className="mt-4 space-y-3">
            {cc.docStatus.map((d) => (
              <div key={d.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-navy/70"><Icon name="doc" className="h-4 w-4 text-navy/30" /> {d.label.charAt(0) + d.label.slice(1).toLowerCase()}</span>
                <span className={`text-lg font-bold ${docTone[d.label]}`}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Activity heatmap</h2>
          <p className="text-sm text-navy/50">Applications · last 12 weeks.</p>
          <div className="mt-4"><Heatmap days={cc.heat} /></div>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-navy/40">Less <span className="h-2.5 w-2.5 rounded-sm bg-navy/5" /><span className="h-2.5 w-2.5 rounded-sm bg-brand/30" /><span className="h-2.5 w-2.5 rounded-sm bg-brand/60" /><span className="h-2.5 w-2.5 rounded-sm bg-brand" /> More</div>
        </div>
      </div>

      {/* Urgent + AI */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-navy">🔥 Urgent Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {urgent.map((u) => (
              <div key={u.t} className="flex items-center gap-3 rounded-xl border border-navy/10 p-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${toneMap[u.tone]}`}><Icon name={u.icon} className="h-5 w-5" /></span>
                <span className="text-sm font-medium text-navy/80">{u.t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-navy p-6 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_0%,rgba(34,197,94,0.35),transparent)]" />
          <div className="relative">
            <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand"><Icon name="bolt" className="h-5 w-5" /></span><h2 className="font-semibold">ForcePK AI</h2></div>
            <p className="mt-4 text-sm leading-relaxed text-white/85">Deployments are up <strong className="text-brand-light">12%</strong> this week. {cc.kpis[3].value} open requirements are actively sourcing — prioritize the {cc.professions[0]?.label ?? "top"} roles with the deepest candidate pools.</p>
            <a href="/admin/ai" className="mt-5 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold hover:bg-brand-dark">Ask ForcePK AI</a>
          </div>
        </div>
      </div>

      {/* Pending verifications + activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="building" className="h-5 w-5 text-brand" /> Companies awaiting verification</h2>
            <span className="chip">{pendingCompanies.length} pending</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase text-navy/40"><tr><th className="pb-3 font-medium">Company</th><th className="pb-3 font-medium">CR No.</th><th className="pb-3 font-medium">City</th><th className="pb-3 text-right font-medium">Action</th></tr></thead>
              <tbody className="divide-y divide-navy/10">
                {pendingCompanies.map((c) => (
                  <tr key={c.cr}>
                    <td className="py-3 font-medium text-navy">{c.name}</td>
                    <td className="py-3 text-navy/60">{c.cr}</td>
                    <td className="py-3 text-navy/60">{c.city}</td>
                    <td className="py-3 text-right"><form action={setCompanyStatus.bind(null, c.id, "VERIFIED")} className="inline"><button className="rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Verify</button></form></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="clock" className="h-5 w-5 text-brand" /> Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {cc.activity.length === 0 && <p className="text-sm text-navy/40">No recent activity.</p>}
            {cc.activity.map((a, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  {i < cc.activity.length - 1 && <span className="mt-1 w-px flex-1 bg-navy/10" />}
                </div>
                <div className="pb-1">
                  <div className="text-sm text-navy/80"><strong className="text-navy">{a.who}</strong> · {a.action.replace(/\./g, " ")}</div>
                  <div className="text-xs text-navy/40">{new Date(a.when).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
