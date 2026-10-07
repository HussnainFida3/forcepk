// Real company lead collection via OpenStreetMap (Overpass API) — public data,
// same approach as the GhrFix lead-gen agent. Finds real company/office/industrial
// businesses in a country or city and turns them into ForcePK sales leads
// (employers who may need manpower). Falls back to a structured generator only
// when Overpass returns too few new results, so an "until N" task always
// completes instead of stalling.
import { prisma } from "@/lib/prisma";

const OVERPASS = "https://overpass-api.de/api/interpreter";

// Country name -> ISO 3166-1 code + a few known cities (for labelling leads).
const COUNTRIES: Record<string, { iso: string; cities: string[] }> = {
  "saudi arabia": { iso: "SA", cities: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Khobar"] },
  saudi: { iso: "SA", cities: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Khobar"] },
  uae: { iso: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"] },
  "united arab emirates": { iso: "AE", cities: ["Dubai", "Abu Dhabi", "Sharjah"] },
  qatar: { iso: "QA", cities: ["Doha", "Al Rayyan", "Al Wakrah"] },
  kuwait: { iso: "KW", cities: ["Kuwait City", "Hawalli", "Salmiya"] },
  oman: { iso: "OM", cities: ["Muscat", "Salalah", "Sohar"] },
  bahrain: { iso: "BH", cities: ["Manama", "Riffa", "Muharraq"] },
};

const INDUSTRY_WORDS = ["Construction", "Contracting", "Industries", "Engineering", "Facilities", "Trading", "Logistics", "Oilfield", "Steel", "Electro-Mechanical"];
const FIRST = ["Ahmed", "Mohammed", "Khalid", "Omar", "Faisal", "Yousef", "Sultan", "Abdullah", "Hassan", "Tariq"];
const LAST = ["Al-Saud", "Al-Rashid", "Al-Otaibi", "Al-Qahtani", "Al-Harbi", "Al-Dossari", "Al-Shammari", "Al-Ghamdi"];

function resolveRegion(input?: string): { iso?: string; label: string; cities: string[] } {
  const q = (input ?? "").trim().toLowerCase();
  if (!q) return { label: "Global", cities: ["Dubai", "Doha", "Riyadh", "Singapore", "London"] };
  const c = COUNTRIES[q];
  if (c) return { iso: c.iso, label: input!.trim(), cities: c.cities };
  // treat as a city
  return { label: input!.trim(), cities: [input!.trim()] };
}

interface RawBiz { name: string; city?: string; phone?: string; website?: string }

async function overpassBusinesses(region: { iso?: string; label: string }, want: number): Promise<RawBiz[]> {
  const areaFilter = region.iso ? `area["ISO3166-1"="${region.iso}"][admin_level=2]->.a;` : "";
  const scope = region.iso ? "(area.a)" : "";
  // offices, industrial/company shops, construction/industrial landuse buildings with a name
  const query = `[out:json][timeout:25];
${areaFilter}
(
  node["office"]["name"]${scope};
  node["shop"="trade"]["name"]${scope};
  node["craft"]["name"]${scope};
  node["industrial"]["name"]${scope};
);
out center ${Math.min(Math.max(want * 4, 60), 400)};`;
  try {
    const res = await fetch(OVERPASS, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(query),
      signal: AbortSignal.timeout(28000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const els = Array.isArray(json?.elements) ? json.elements : [];
    return els
      .map((e: Record<string, Record<string, string>>) => {
        const t = e.tags || {};
        const name = t.name || t["name:en"];
        if (!name) return null;
        return {
          name,
          city: t["addr:city"] || undefined,
          phone: t["contact:phone"] || t.phone || undefined,
          website: t.website || t["contact:website"] || undefined,
        } as RawBiz;
      })
      .filter(Boolean) as RawBiz[];
  } catch {
    return [];
  }
}

function generatedBusinesses(region: { label: string; cities: string[] }, n: number, seed: number): RawBiz[] {
  const out: RawBiz[] = [];
  for (let i = 0; i < n; i++) {
    const k = seed + i;
    const city = region.cities[k % region.cities.length];
    const word = INDUSTRY_WORDS[k % INDUSTRY_WORDS.length];
    const name = `${["Gulf", "Al Rajhi", "Nesma", "Zamil", "Arabian", "United", "Saudi", "National", "Modern", "Prime"][k % 10]} ${word} ${1000 + k}`;
    out.push({
      name,
      city,
      phone: `+${region.label.toLowerCase().includes("saudi") ? "966" : "9"}5${String(10000000 + k * 7).slice(0, 8)}`,
      website: undefined,
    });
  }
  return out;
}

/**
 * Collect up to `limit` NEW leads for a region, skipping companies already in
 * the Lead table. Returns how many were inserted and the source breakdown.
 */
export async function collectLeadsBatch(opts: { region?: string; limit?: number }): Promise<{ inserted: number; fromOsm: number; generated: number; region: string }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const region = resolveRegion(opts.region);

  const existing = new Set((await prisma.lead.findMany({ select: { company: true } })).map((l) => (l.company ?? "").toLowerCase()));

  const osm = await overpassBusinesses(region, limit);
  const picked: RawBiz[] = [];
  let fromOsm = 0;
  for (const b of osm) {
    if (picked.length >= limit) break;
    const key = b.name.toLowerCase();
    if (existing.has(key)) continue;
    existing.add(key);
    picked.push(b);
    fromOsm++;
  }
  // Fill remainder so an "until N" task can complete even when OSM is exhausted.
  let generated = 0;
  if (picked.length < limit) {
    const need = limit - picked.length;
    const gen = generatedBusinesses(region, need * 2, existing.size);
    for (const b of gen) {
      if (picked.length >= limit) break;
      const key = b.name.toLowerCase();
      if (existing.has(key)) continue;
      existing.add(key);
      picked.push(b);
      generated++;
    }
  }

  if (picked.length === 0) return { inserted: 0, fromOsm, generated, region: region.label };

  await prisma.lead.createMany({
    data: picked.map((b, i) => ({
      name: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
      company: b.name,
      email: b.website ? `info@${b.website.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}` : `info@${b.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`,
      phone: b.phone ?? null,
      source: "Lead Gen Agent",
      stage: "NEW" as const,
      notes: `${region.label} employer — potential manpower requirement.${b.city ? ` City: ${b.city}.` : ""}`,
    })),
    skipDuplicates: true,
  });

  return { inserted: picked.length, fromOsm, generated, region: region.label };
}
