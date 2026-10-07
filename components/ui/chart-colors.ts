// Plain (non-client) color tokens so BOTH server components and the client
// charts module can import them. Do NOT add "use client" here — server pages
// dot into CHART_COLORS (e.g. CHART_COLORS[i % CHART_COLORS.length]).

export const BRAND = "#16A34A";
export const BRAND_LIGHT = "#22c55e";
export const NAVY = "#0C2340";

export const CHART_COLORS = [BRAND, NAVY, "#3b82f6", "#f59e0b", "#8b5cf6", "#14b8a6", "#ef4444", BRAND_LIGHT];
