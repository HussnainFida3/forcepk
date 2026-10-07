import Icon from "@/components/Icon";
import { Sparkline } from "./charts";
import AnimatedNumber from "./AnimatedNumber";

const tones: Record<string, { bg: string; fg: string; spark: string }> = {
  navy: { bg: "bg-navy/10", fg: "text-navy", spark: "#0C2340" },
  green: { bg: "bg-brand/10", fg: "text-brand-dark", spark: "#16A34A" },
  blue: { bg: "bg-blue-100", fg: "text-blue-700", spark: "#3b82f6" },
  amber: { bg: "bg-amber-100", fg: "text-amber-700", spark: "#f59e0b" },
  purple: { bg: "bg-purple-100", fg: "text-purple-700", spark: "#8b5cf6" },
  teal: { bg: "bg-teal-100", fg: "text-teal-700", spark: "#14b8a6" },
  red: { bg: "bg-red-100", fg: "text-red-700", spark: "#ef4444" },
};

export default function StatCard({
  label, value, sub, icon, tone = "navy", delta, spark,
}: {
  label: string; value: string | number; sub?: string; icon: string; tone?: string;
  delta?: number; spark?: number[];
}) {
  const t = tones[tone] ?? tones.navy;
  const up = (delta ?? 0) >= 0;
  return (
    <div className="card group relative overflow-hidden p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-navy/55">{label}</div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight text-navy">
            {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          </div>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${t.bg} ${t.fg}`}><Icon name={icon} className="h-5 w-5" /></span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          {typeof delta === "number" && (
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${up ? "bg-brand/10 text-brand-dark" : "bg-red-100 text-red-600"}`}>
              {up ? "▲" : "▼"} {Math.abs(delta)}%
            </span>
          )}
          {sub && <span className="text-navy/45">{sub}</span>}
        </div>
        {spark && spark.length > 1 && <Sparkline data={spark} color={t.spark} className="h-7 w-20" />}
      </div>
    </div>
  );
}
