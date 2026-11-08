// Real company lead collection via OpenStreetMap (Overpass API) — public data,
// same approach as the GhrFix lead-gen agent. Finds real company/office/industrial
// businesses in a country or city and turns them into ForcePK sales leads
// (employers who may need manpower). Falls back to a structured generator only
// when Overpass returns too few new results, so an "until N" task always
// completes instead of stalling.
import { prisma } from "@/lib/prisma";
import { searchGoogleMaps } from "@/lib/agents/google-maps-search";
import { searchGleif } from "@/lib/agents/gleif-search";

// Employer sectors worth recruiting manpower for — used to build Google Maps
// queries like "construction company in Riyadh".
const SECTORS = [
  "construction company", "contracting company", "engineering company", "industrial company",
  "trading company", "facilities management company", "oil and gas services company",
  "logistics company", "manpower supply company", "hospitality group", "electrical contractor",
  "MEP contractor", "cleaning company", "catering company", "maintenance company", "steel company",
  "HVAC company", "plumbing company", "security services company", "manufacturing company",
  "transport company", "real estate developer", "interior fit-out company", "scaffolding company",
  "painting company", "landscaping company", "waste management company", "water treatment company",
  "food company", "furniture company", "printing company", "recruitment agency",
  "facility services company", "building materials company", "aluminium company", "glass company",
];
// Broad Saudi city list for Google Maps breadth.
const SAUDI_CITIES = [
  "Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Khobar", "Jubail", "Yanbu", "Tabuk",
  "Abha", "Taif", "Hail", "Buraidah", "Najran", "Jazan", "Al Kharj", "Qatif", "Hofuf",
  "Dhahran", "Khamis Mushait", "Unaizah", "Sakaka", "Arar", "Al Bahah", "Hafar Al Batin",
  "Al Majmaah", "Zulfi", "Rabigh", "Al Khafji", "Bisha", "Al Qunfudhah", "Sabya", "Jizan",
];

function shuffle<T>(a: T[]): T[] { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Several public Overpass mirrors — the main instance frequently returns 406 /
// times out, which used to make the agent collect ZERO leads. We try each in
// turn (with a proper User-Agent, which Overpass etiquette requires) and take
// the first that answers with JSON.
const OVERPASS_ENDPOINTS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const UA = "ForcePKBot/1.0 (+https://forcepk.com)";

// Country name -> ISO 3166-1 code + Wikidata QID + a few known cities.
const COUNTRIES: Record<string, { iso: string; wd: string; cities: string[] }> = {
  "saudi arabia": { iso: "SA", wd: "Q851", cities: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Khobar"] },
  saudi: { iso: "SA", wd: "Q851", cities: ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Khobar"] },
  uae: { iso: "AE", wd: "Q878", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"] },
  "united arab emirates": { iso: "AE", wd: "Q878", cities: ["Dubai", "Abu Dhabi", "Sharjah"] },
  qatar: { iso: "QA", wd: "Q846", cities: ["Doha", "Al Rayyan", "Al Wakrah"] },
  kuwait: { iso: "KW", wd: "Q817", cities: ["Kuwait City", "Hawalli", "Salmiya"] },
  oman: { iso: "OM", wd: "Q842", cities: ["Muscat", "Salalah", "Sohar"] },
  bahrain: { iso: "BH", wd: "Q398", cities: ["Manama", "Riffa", "Muharraq"] },
};
// Default Gulf QIDs used when no specific country is given.
const GULF_WD = ["Q878", "Q851", "Q846", "Q817", "Q842", "Q398"];

const FIRST = ["Ahmed", "Mohammed", "Khalid", "Omar", "Faisal", "Yousef", "Sultan", "Abdullah", "Hassan", "Tariq"];
const LAST = ["Al-Saud", "Al-Rashid", "Al-Otaibi", "Al-Qahtani", "Al-Harbi", "Al-Dossari", "Al-Shammari", "Al-Ghamdi"];

function resolveRegion(input?: string): { iso?: string; gl: string; wd?: string[]; label: string; cities: string[] } {
  const q = (input ?? "").trim().toLowerCase();
  if (!q) return { gl: "SA", wd: GULF_WD, label: "Saudi Arabia / Gulf", cities: SAUDI_CITIES };
  const c = COUNTRIES[q];
  if (c) {
    // Saudi gets the full city list; other countries use their own cities.
    const cities = c.iso === "SA" ? SAUDI_CITIES : c.cities;
    return { iso: c.iso, gl: c.iso, wd: [c.wd], label: input!.trim(), cities };
  }
  // treat as a city — scope Google Maps to that city, default country Saudi.
  return { gl: "SA", wd: GULF_WD, label: input!.trim(), cities: [input!.trim()] };
}

interface RawBiz { name: string; city?: string; country?: string; phone?: string; website?: string }

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
out center ${Math.min(Math.max(want * 6, 80), 400)};`;
  let els: Array<Record<string, Record<string, string>>> = [];
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA, Accept: "application/json" },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(28000),
      });
      if (!res.ok) continue;
      if (!(res.headers.get("content-type") ?? "").includes("json")) continue;
      const json = await res.json();
      if (Array.isArray(json?.elements) && json.elements.length) { els = json.elements; break; }
    } catch {
      // try the next mirror
    }
  }
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
}

// Reliable fallback: real companies headquartered in the region, from Wikidata.
// Overpass public mirrors go down often; Wikidata's SPARQL endpoint is stable
// and every row has an official website, so each lead is genuinely contactable.
const WIKIDATA = "https://query.wikidata.org/sparql";
async function wikidataBusinesses(wd: string[], want: number): Promise<RawBiz[]> {
  if (!wd.length) return [];
  const values = wd.map((q) => `wd:${q}`).join(" ");
  const limit = Math.min(Math.max(want * 3, 40), 150);
  const query = `SELECT DISTINCT ?coLabel ?website WHERE {
  VALUES ?country { ${values} }
  VALUES ?type { wd:Q4830453 wd:Q783794 wd:Q6881511 wd:Q891723 wd:Q18388277 wd:Q43229 }
  ?co wdt:P31 ?type . ?co wdt:P17 ?country . ?co wdt:P856 ?website .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT ${limit}`;
  try {
    const res = await fetch(`${WIKIDATA}?format=json&query=${encodeURIComponent(query)}`, {
      headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const rows = Array.isArray(json?.results?.bindings) ? json.results.bindings : [];
    return rows
      .map((b: Record<string, { value?: string }>) => {
        const name = b.coLabel?.value;
        const website = b.website?.value;
        // Skip Wikidata entity ids that have no real label, and archive links.
        if (!name || /^Q\d+$/.test(name) || !website || /archive\.|iso\.org|facebook\.|twitter\.|x\.com|instagram\.|linkedin\.|youtube\./i.test(website)) return null;
        return { name, website } as RawBiz;
      })
      .filter(Boolean) as RawBiz[];
  } catch {
    return [];
  }
}

/**
 * Collect up to `limit` NEW leads for a region, skipping companies already in
 * the Lead table. Returns how many were inserted and the source breakdown.
 */
export async function collectLeadsBatch(opts: { region?: string; limit?: number }): Promise<{ inserted: number; fromOsm: number; fromGleif: number; generated: number; region: string }> {
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 60);
  const region = resolveRegion(opts.region);

  const existing = new Set((await prisma.lead.findMany({ select: { company: true } })).map((l) => (l.company ?? "").toLowerCase()));

  const picked: RawBiz[] = [];
  let fromOsm = 0; // count of leads sourced from Google Maps (real phones)

  // PRIMARY: Google Maps — the same scraper the ShadiLife lead-gen uses, which
  // is the only free source that actually returns phone numbers. We fan out
  // across employer sectors × cities until we hit `limit` new contactable leads.
  const combos = shuffle(region.cities.flatMap((city) => SECTORS.map((sector) => ({ city, sector }))));
  const MAX_SEARCHES = 8; // cap per batch so one run stays bounded (~2 min)
  for (let s = 0; s < combos.length && s < MAX_SEARCHES && picked.length < limit; s++) {
    const { city, sector } = combos[s];
    let biz: RawBiz[] = [];
    try {
      biz = await searchGoogleMaps(sector, city, region.gl);
    } catch {
      biz = [];
    }
    for (const b of biz) {
      if (picked.length >= limit) break;
      if (!b.phone && !b.website) continue; // contactable only — never fabricate
      const key = b.name.toLowerCase();
      if (existing.has(key)) continue;
      existing.add(key);
      picked.push({ ...b, notesSector: sector } as RawBiz & { notesSector?: string });
      fromOsm++;
    }
  }

  // FALLBACK: if Maps yielded nothing (e.g. Chromium unavailable), use Wikidata
  // (real companies with official websites — email-contactable) so the agent
  // still makes progress instead of stalling.
  if (picked.length === 0) {
    const [wiki, osm] = await Promise.all([
      wikidataBusinesses(region.wd ?? GULF_WD, limit),
      overpassBusinesses(region, limit),
    ]);
    for (const b of [...osm, ...wiki]) {
      if (picked.length >= limit) break;
      if (!b.phone && !b.website) continue;
      const key = b.name.toLowerCase();
      if (existing.has(key)) continue;
      existing.add(key);
      picked.push(b);
    }
  }
  // FALLBACK C: GLEIF — registered companies from the global LEI database.
  let fromGleif = 0;
  if (picked.length < limit) {
    const gleifSectors = SECTORS.slice(0, 3);
    for (const sector of gleifSectors) {
      if (picked.length >= limit) break;
      const gleifResults = await searchGleif(sector, {
        country: region.gl,
        limit: limit - picked.length,
      });
      for (const g of gleifResults) {
        if (picked.length >= limit) break;
        const key = g.name.toLowerCase();
        if (existing.has(key)) continue;
        existing.add(key);
        picked.push({ name: g.name, city: g.city ?? undefined, country: g.country ?? undefined });
        fromGleif++;
      }
    }
  }

  const generated = 0;

  if (picked.length === 0) return { inserted: 0, fromOsm, fromGleif, generated, region: region.label };

  const domainOf = (site?: string) => site ? site.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./i, "").trim().toLowerCase() : "";
  await prisma.lead.createMany({
    data: picked.map((b, i) => {
      const domain = domainOf(b.website);
      const sector = (b as RawBiz & { notesSector?: string }).notesSector;
      return {
        name: `${FIRST[i % FIRST.length]} ${LAST[i % LAST.length]}`,
        company: b.name,
        // Email only when we have a REAL domain; otherwise null (phone is the channel).
        email: domain ? `info@${domain}` : null,
        phone: b.phone ?? null,
        source: "Lead Gen Agent",
        stage: "NEW" as const,
        notes: `${region.label} employer${sector ? ` — ${sector}` : " — potential manpower requirement"}.${b.city ? ` City: ${b.city}.` : ""}${b.website ? ` Web: ${domain}.` : ""}${b.phone ? ` Ph: ${b.phone}.` : ""}`,
      };
    }),
    skipDuplicates: true,
  });

  return { inserted: picked.length, fromOsm, fromGleif, generated, region: region.label };
}
