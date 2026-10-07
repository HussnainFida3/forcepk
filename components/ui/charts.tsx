// Lightweight, dependency-free charts (Tremor/Recharts-style) as inline SVG.
// Theme-aware via the brand palette; crisp in any size.

const BRAND = "#16A34A";
const BRAND_LIGHT = "#22c55e";
const NAVY = "#0C2340";

export function Sparkline({ data, color = BRAND, className = "h-8 w-24" }: { data: number[]; color?: string; className?: string }) {
  if (data.length < 2) return <svg className={className} />;
  const w = 100, h = 32, max = Math.max(...data), min = Math.min(...data);
  const rng = max - min || 1;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / rng) * (h - 4) - 2]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const id = `sp${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function AreaChart({ data, labels, height = 220 }: { data: number[]; labels: string[]; height?: number }) {
  if (!data || data.length < 2) {
    return <div className="grid place-items-center text-sm text-navy/35" style={{ height }}>Not enough data yet</div>;
  }
  const w = 600, h = height, pad = 28;
  const max = Math.max(1, ...data), min = 0, rng = max - min || 1;
  const x = (i: number) => pad + (i / Math.max(1, data.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / rng) * (h - pad * 2);
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${h - pad} L${x(0)},${h - pad} Z`;
  const ticks = [0, 0.5, 1].map((t) => min + t * rng);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={BRAND} stopOpacity="0.28" /><stop offset="100%" stopColor={BRAND} stopOpacity="0" /></linearGradient></defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad} x2={w - pad} y1={y(t)} y2={y(t)} stroke={NAVY} strokeOpacity="0.08" />
          <text x={4} y={y(t) + 4} fontSize="10" fill={NAVY} fillOpacity="0.4">{Math.round(t)}</text>
        </g>
      ))}
      <path d={area} fill="url(#areaG)" />
      <path d={line} fill="none" stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d)} r="2.5" fill={BRAND} />)}
      {labels.map((l, i) => (i % Math.ceil(labels.length / 7) === 0) && (
        <text key={i} x={x(i)} y={h - 8} fontSize="9" fill={NAVY} fillOpacity="0.45" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

export function BarChart({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-navy/60">{i.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-md bg-navy/5">
            <div className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-brand to-brand-dark px-2" style={{ width: `${Math.max(8, (i.value / max) * 100)}%` }}>
              <span className="text-[10px] font-bold text-white">{i.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ segments, size = 160 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 14, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="h-auto max-w-full shrink-0 -rotate-90" style={{ maxWidth: size }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={NAVY} strokeOpacity="0.07" strokeWidth="14" />
        {segments.map((s) => {
          const len = (s.value / total) * C;
          const el = <circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />;
          offset += len;
          return el;
        })}
        <text x={cx} y={cy} transform={`rotate(90 ${cx} ${cy})`} textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="800" fill={NAVY}>{total}</text>
      </svg>
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

export function RadialGauge({ value, label, size = 120, color = BRAND }: { value: number; label: string; size?: number; color?: string }) {
  const r = size / 2 - 10, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const id = `g${label.replace(/\W/g, "")}`;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={BRAND_LIGHT} /></linearGradient></defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={NAVY} strokeOpacity="0.08" strokeWidth="10" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${id})`} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C - (pct / 100) * C} />
        <text x={cx} y={cy} transform={`rotate(90 ${cx} ${cy})`} textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="800" fill={NAVY}>{Math.round(pct)}%</text>
      </svg>
      <span className="mt-1 text-xs font-medium text-navy/60">{label}</span>
    </div>
  );
}

// Grouped vertical bars (e.g. monthly deployments).
export function ColumnChart({ items, height = 180 }: { items: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {items.map((i) => (
        <div key={i.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full flex-1 items-end">
            <div className="w-full rounded-t-md bg-gradient-to-t from-navy to-brand transition-all" style={{ height: `${(i.value / max) * 100}%`, minHeight: 4 }} title={`${i.value}`} />
          </div>
          <span className="text-[10px] font-medium text-navy/50">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

// GitHub-style activity heatmap (last N weeks).
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

export const CHART_COLORS = [BRAND, NAVY, "#3b82f6", "#f59e0b", "#8b5cf6", "#14b8a6", "#ef4444", BRAND_LIGHT];
