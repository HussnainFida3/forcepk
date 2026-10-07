import Icon from "@/components/Icon";
import StatCard from "@/components/ui/StatCard";
import { AreaChart, Donut, BarChart, ColumnChart, RadialGauge } from "@/components/ui/charts";
import { CHART_COLORS } from "@/components/ui/chart-colors";
import { getCommandCenter } from "@/lib/queries";

export const metadata = { title: "Reports & Analytics" };
export const dynamic = "force-dynamic";

const pretty = (s: string) => s.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");

export default async function ReportsPage() {
  const cc = await getCommandCenter();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Reports &amp; Analytics</h1>
          <p className="text-sm text-navy/60">Platform-wide recruitment metrics. Export any dataset.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["candidates", "requirements", "applications", "companies"].map((e) => (
            <a key={e} href={`/api/export/${e}`} className="btn-outline text-xs"><Icon name="doc" className="h-4 w-4" /> {pretty(e)} CSV</a>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cc.kpis.slice(0, 4).map((k) => <StatCard key={k.label} {...k} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-navy">Application volume — 14 days</h2>
          <div className="mt-4"><AreaChart data={cc.area.data} labels={cc.area.labels} /></div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Stage distribution</h2>
          <div className="mt-5 flex justify-center"><Donut segments={cc.stageDist.map((s, i) => ({ ...s, color: CHART_COLORS[i % CHART_COLORS.length] }))} size={150} /></div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-navy">Funnel conversion</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <RadialGauge value={cc.conversion.shortlistRate} label="Shortlist" />
          <RadialGauge value={cc.conversion.interviewRate} label="Interview" color="#3b82f6" />
          <RadialGauge value={cc.conversion.selectionRate} label="Selection" color="#8b5cf6" />
          <RadialGauge value={cc.conversion.deployRate} label="Deployment" color="#f59e0b" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Top professions</h2>
          <div className="mt-4"><BarChart items={cc.professions} /></div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Demand by location</h2>
          <div className="mt-4"><BarChart items={cc.locations} /></div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-navy">Deployments — 6 months</h2>
          <div className="mt-4"><ColumnChart items={cc.monthly} /></div>
        </div>
      </div>
    </div>
  );
}
