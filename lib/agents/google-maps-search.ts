// Real business leads from Google Maps' public search — name, phone number and
// website — with NO API key or paid service. Ported from the ShadiLife lead-gen
// agent (which proved this is the only free source that actually yields phone
// numbers; Wikidata/OpenStreetMap give websites but almost no phones).
//
// Two things make it work (same as ShadiLife):
//   1. Chromium must be installed on the server: npx playwright install --with-deps chromium
//   2. Google's consent interstitial blocks a fresh datacenter visit with zero
//      results — seeding SOCS + CONSENT cookies skips it; hl=en&gl=<CC> pins
//      English + the target country's results.
//
// Phone numbers appear right in the feed cards, so we read them per-card (fast)
// rather than opening every place. Degrades to [] on any failure so a blocked
// run never throws up to the caller.

export interface MapsBiz { name: string; city?: string; phone?: string; website?: string }

const NAV_TIMEOUT_MS = 35000;
const MAX_RESULTS = 40;

const CONSENT_COOKIES = [
  { name: "SOCS", value: "CAISEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg", domain: ".google.com", path: "/" },
  { name: "CONSENT", value: "YES+cb.20210328-17-p0.en+FX+" + Math.floor(Math.random() * 999), domain: ".google.com", path: "/" },
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Scrape one Google Maps search. `gl` is the ISO country code (SA, AE, QA, …)
 * so results and phone formats are localised to the right Gulf country.
 */
export async function searchGoogleMaps(query: string, city: string | undefined, gl = "SA"): Promise<MapsBiz[]> {
  // `playwright` is an optional, server-only dependency — typed loosely so the
  // project still compiles when it isn't installed. The import is guarded below.
  let chromium: { launch: (opts?: unknown) => Promise<any> };
  try {
    ({ chromium } = (await import("playwright" as string)) as any);
  } catch {
    console.error("[forcepk-leadgen] playwright not installed — Google Maps search unavailable");
    return [];
  }

  const term = city ? `${query} in ${city}` : query;
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      timeout: NAV_TIMEOUT_MS,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });
    const ctx = await browser.newContext({ userAgent: UA, locale: "en-US" });
    await ctx.addCookies(CONSENT_COOKIES);
    const page = await ctx.newPage();
    page.setDefaultTimeout(NAV_TIMEOUT_MS);

    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(term)}?hl=en&gl=${gl}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    const feed = page.locator('div[role="feed"]');
    await feed.first().waitFor({ timeout: NAV_TIMEOUT_MS }).catch(() => null);

    for (let i = 0; i < 6; i++) {
      await feed.first().evaluate((el: any) => el.scrollBy(0, el.scrollHeight)).catch(() => null);
      await page.waitForTimeout(1300);
    }

    const raw: { name: string; phone: string | null; website: string | null }[] = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc: any = (globalThis as any).document;
      const results: { name: string; phone: string | null; website: string | null }[] = [];
      const anchors = doc.querySelectorAll('div[role="feed"] a[href*="/maps/place/"]');
      for (const a of anchors) {
        const name = (a.getAttribute("aria-label") || "").trim();
        if (!name) continue;
        const card = a.closest("div");
        const txt = ((card && card.textContent) || "").replace(/\s+/g, " ");
        // Gulf phone formats, incl. the spaced local Saudi style "053 975 0512"
        // and international "+966 11 123 4567". Digits may be separated by
        // spaces/dashes/dots, so allow those inside the run.
        const phone = (txt.match(/\+9\d{2}[\d\s().-]{6,14}\d|0\d[\d\s().-]{7,12}\d/) || [])[0] || null;
        const siteEl = card && card.querySelector('a[href^="http"]:not([href*="google.com"]):not([href*="gstatic.com"])');
        const website = siteEl ? siteEl.getAttribute("href") : null;
        results.push({ name, phone: phone ? phone.trim() : null, website });
      }
      return results;
    });

    const seen = new Set<string>();
    const leads: MapsBiz[] = [];
    for (const r of raw) {
      const key = r.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      leads.push({ name: r.name, city, phone: r.phone ?? undefined, website: r.website ?? undefined });
      if (leads.length >= MAX_RESULTS) break;
    }
    return leads;
  } catch (err) {
    console.error("[forcepk-leadgen] Google Maps search failed:", err instanceof Error ? err.message : err);
    return [];
  } finally {
    await browser?.close().catch(() => null);
  }
}
