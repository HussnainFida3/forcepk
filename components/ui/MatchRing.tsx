export default function MatchRing({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = Math.max(4, Math.round(size / 9));
  const r = size / 2 - stroke / 2 - 1;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const id = `mr-${size}-${pct}`;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0C234012" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
        />
      </svg>
      <span className="absolute font-extrabold tabular-nums text-brand-dark" style={{ fontSize: Math.max(10, Math.round(size * 0.26)) }}>
        {pct}
        <span style={{ fontSize: "0.7em" }}>%</span>
      </span>
    </div>
  );
}
