"use client";

// Responsive charts built on Recharts. Every chart fills its container via
// <ResponsiveContainer>, so cards never overflow on small screens.
import {
  ResponsiveContainer,
  AreaChart as RAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart as RBarChart,
  Bar,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  LabelList,
} from "recharts";

import { BRAND, NAVY, CHART_COLORS } from "./chart-colors";
export { CHART_COLORS };
// Neutral slate for axis labels / gridlines — legible on both light and dark cards.
const AXIS = "#94a3b8";

const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: "1px solid rgba(12,35,64,0.1)", fontSize: 12, boxShadow: "0 4px 16px rgba(12,35,64,0.08)" },
  labelStyle: { color: NAVY, fontWeight: 600 },
};

// ── Sparkline (inside StatCard) ──
export function Sparkline({ data, color = BRAND, className = "h-8 w-24" }: { data: number[]; color?: string; className?: string }) {
  if (!data || data.length < 2) return <div className={className} />;
  const rows = data.map((v, i) => ({ i, v }));
  const id = `sp${color.replace("#", "")}`;
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={rows} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${id})`} isAnimationActive={false} dot={false} />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Area chart (trend lines) ──
export function AreaChart({ data, labels, height = 220 }: { data: number[]; labels: string[]; height?: number }) {
  if (!data || data.length < 2) {
    return <div className="grid place-items-center text-sm text-navy/35" style={{ height }}>Not enough data yet</div>;
  }
  const rows = data.map((v, i) => ({ label: labels[i] ?? String(i), value: v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RAreaChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.28} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={AXIS} strokeOpacity={0.25} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS, fillOpacity: 0.9 }} tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis tick={{ fontSize: 10, fill: AXIS, fillOpacity: 0.8 }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey="value" name="Applications" stroke={BRAND} strokeWidth={2.5} fill="url(#areaG)" dot={false} activeDot={{ r: 4 }} />
      </RAreaChart>
    </ResponsiveContainer>
  );
}

// ── Donut (distribution) ──
export function Donut({ segments, size = 160 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size, maxWidth: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={segments} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius="62%" outerRadius="100%" paddingAngle={segments.length > 1 ? 2 : 0} stroke="none">
              {segments.map((s) => <Cell key={s.label} fill={s.color} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="text-2xl font-extrabold text-navy">{total}</span>
        </div>
      </div>
      <ul className="min-w-0 space-y-1.5 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="min-w-0 truncate text-navy/70">{s.label}</span>
            <span className="shrink-0 font-semibold text-navy">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Horizontal bar list (top professions / locations) ──
export function BarChart({ items }: { items: { label: string; value: number }[] }) {
  if (!items || items.length === 0) return <div className="py-6 text-center text-sm text-navy/35">No data yet</div>;
  const height = Math.max(120, items.length * 42);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={items} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }} barCategoryGap={10}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={104} tick={{ fontSize: 11, fill: AXIS, fillOpacity: 0.95 }} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(12,35,64,0.04)" }} />
        <Bar dataKey="value" fill={BRAND} radius={[4, 4, 4, 4]} maxBarSize={22}>
          <LabelList dataKey="value" position="right" style={{ fontSize: 11, fontWeight: 700, fill: AXIS }} />
        </Bar>
      </RBarChart>
    </ResponsiveContainer>
  );
}

// ── Radial gauge (conversion rates) ──
export function RadialGauge({ value, label, size = 120, color = BRAND }: { value: number; label: string; size?: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size, maxWidth: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ value: pct }]} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: "rgba(12,35,64,0.08)" }} dataKey="value" cornerRadius={20} fill={color} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="text-lg font-extrabold text-navy">{Math.round(pct)}%</span>
        </div>
      </div>
      <span className="mt-1 text-center text-xs font-medium text-navy/60">{label}</span>
    </div>
  );
}

// ── Vertical columns (monthly deployments) ──
export function ColumnChart({ items, height = 180 }: { items: { label: string; value: number }[]; height?: number }) {
  if (!items || items.length === 0) return <div className="py-6 text-center text-sm text-navy/35">No data yet</div>;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RBarChart data={items} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={AXIS} strokeOpacity={0.25} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: AXIS, fillOpacity: 0.9 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: AXIS, fillOpacity: 0.8 }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(12,35,64,0.04)" }} />
        <Bar dataKey="value" fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={44} />
      </RBarChart>
    </ResponsiveContainer>
  );
}

// ── GitHub-style activity heatmap (no Recharts equivalent — kept as a grid) ──
export function Heatmap({ days }: { days: { date: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const level = (c: number) => (c === 0 ? 0 : Math.ceil((c / max) * 4));
  const shades = ["bg-navy/5", "bg-brand/20", "bg-brand/40", "bg-brand/70", "bg-brand"];
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return (
    <div className="flex gap-1 overflow-x-auto">
      {weeks.map((w, i) => (
        <div key={i} className="flex flex-col gap-1">
          {w.map((d) => <div key={d.date} title={`${d.date}: ${d.count}`} className={`h-3 w-3 rounded-sm ${shades[level(d.count)]}`} />)}
        </div>
      ))}
    </div>
  );
}
