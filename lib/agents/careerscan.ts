// Hiring Signals engine. Visits a company's career page, decides whether the
// company is ACTIVELY hiring, extracts the open jobs, and records everything.
// Actively-hiring companies are also turned into CRM leads so the team can
// reach out. Uses OpenAI to read the page; falls back to ATS + keyword
// heuristics when the key or page text is thin.
import { prisma } from "@/lib/prisma";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const UA = "Mozilla/5.0 (compatible; ForcePKBot/1.0; +https://forcepk.com)";

// Curated major employers per country — real companies that hire manpower.
const SEEDS: Record<string, { name: string; domain: string }[]> = {
  "saudi arabia": [
    { name: "Saudi Aramco", domain: "aramco.com" }, { name: "SABIC", domain: "sabic.com" },
    { name: "ACWA Power", domain: "acwapower.com" }, { name: "stc", domain: "stc.com.sa" },
    { name: "Almarai", domain: "almarai.com" }, { name: "Nesma", domain: "nesma.com" },
    { name: "Ma'aden", domain: "maaden.com.sa" }, { name: "NEOM", domain: "neom.com" },
    { name: "Red Sea Global", domain: "redseaglobal.com" }, { name: "Alfanar", domain: "alfanar.com" },
    { name: "Zamil Industrial", domain: "zamilindustrial.com" }, { name: "Saudi Binladin Group", domain: "sbg.com.sa" },
  ],
  uae: [
    { name: "Emaar", domain: "emaar.com" }, { name: "Emirates Group", domain: "emirates.com" },
    { name: "DP World", domain: "dpworld.com" }, { name: "ADNOC", domain: "adnoc.ae" },
    { name: "Majid Al Futtaim", domain: "majidalfuttaim.com" }, { name: "Aldar", domain: "aldar.com" },
    { name: "e& (Etisalat)", domain: "eand.com" }, { name: "ALEC", domain: "alec.ae" },
    { name: "Dubai Holding", domain: "dubaiholding.com" }, { name: "Arabtec", domain: "arabtecuae.com" },
  ],
  qatar: [
    { name: "Qatar Airways", domain: "qatarairways.com" }, { name: "QatarEnergy", domain: "qatarenergy.qa" },
    { name: "Ooredoo", domain: "ooredoo.qa" }, { name: "Qatar Steel", domain: "qatarsteel.com.qa" },
    { name: "UrbaCon (UCC)", domain: "ucc-holding.com" }, { name: "Qatar Gas", domain: "qatargas.com" },
  ],
  kuwait: [
    { name: "KNPC", domain: "knpc.com" }, { name: "Zain", domain: "kw.zain.com" },
    { name: "Agility", domain: "agility.com" }, { name: "Kuwait Oil Company", domain: "kockw.com" },
  ],
  oman: [
    { name: "PDO", domain: "pdo.co.om" }, { name: "Omantel", domain: "omantel.om" },
    { name: "OQ", domain: "oq.com" }, { name: "Galfar", domain: "galfar.com" },
  ],
  qatar_extra: [],
};

function norm(c?: string) { return (c ?? "").trim().toLowerCase(); }
function seedsFor(country?: string) {
  const k = norm(country);
  if (k && SEEDS[k]) return SEEDS[k];
  if (k.includes("saudi")) return SEEDS["saudi arabia"];
  if (k.includes("emirat") || k === "dubai" || k === "abu dhabi") return SEEDS.uae;
  if (!k) return Object.values(SEEDS).flat();
  return Object.values(SEEDS).flat();
}

const CAREER_PATHS = ["/careers", "/en/careers", "/careers/", "/jobs", "/career", "/join-us", "/about/careers", "/en/careers/jobs", "/careers/job-search"];

async function fetchText(url: string, ms = 10000): Promise<{ ok: boolean; url: string; html: string }> {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(ms), headers: { "User-Agent": UA, Accept: "text/html" } });
    const html = r.ok ? await r.text() : "";
    return { ok: r.ok, url: r.url || url, html };
  } catch {
    return { ok: false, url, html: "" };
  }
}

async function findCareerUrl(domain: string): Promise<string | null> {
  const bases = [`https://${domain}`, `https://careers.${domain}`, `https://www.${domain}`];
  for (const base of [bases[1]]) {
    const r = await fetchText(base, 8000);
    if (r.ok && /career|job|vacanc|position|hiring|apply/i.test(r.html)) return r.url;
  }
  for (const p of CAREER_PATHS) {
    const r = await fetchText(`https://${domain}${p}`, 8000);
    if (r.ok && /career|job|vacanc|position|hiring|apply/i.test(r.html)) return r.url;
  }
  return null;
}

const ATS = /greenhouse\.io|boards\.greenhouse|lever\.co|myworkdayjobs|workday|bamboohr|smartrecruiters|taleo|successfactors|icims|workable|oraclecloud\.com\/hcm|recruitee|teamtailor|jobvite|ashbyhq/i;

async function analyze(html: string): Promise<{ active: boolean; jobs: { title: string; location?: string }[]; note: string }> {
  const atsHit = ATS.test(html);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 12000);

  const key = process.env.OPENAI_API_KEY;
  if (key && text.length > 200) {
    try {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          response_format: { type: "json_object" },
          max_tokens: 900,
          temperature: 0,
          messages: [
            { role: "system", content: "You read the text of a company's careers/jobs web page and judge whether the company is ACTIVELY hiring right now. Return strict JSON: {\"activelyHiring\": boolean, \"jobs\": [{\"title\": string, \"location\": string}], \"note\": string}. activelyHiring is true when there are current open positions/vacancies listed or an apply flow. Extract up to 15 real job titles (ignore nav/footer). note: <=15 words summarising the signal." },
            { role: "user", content: text },
          ],
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (r.ok) {
        const d = await r.json();
        const p = JSON.parse(d?.choices?.[0]?.message?.content ?? "{}");
        const jobs = Array.isArray(p.jobs) ? p.jobs.filter((j: { title?: string }) => j && j.title).slice(0, 15).map((j: { title: string; location?: string }) => ({ title: String(j.title).slice(0, 160), location: j.location ? String(j.location).slice(0, 80) : undefined })) : [];
        return { active: Boolean(p.activelyHiring) || atsHit, jobs, note: String(p.note ?? (atsHit ? "ATS detected" : "")).slice(0, 180) };
      }
    } catch { /* fall through */ }
  }

  // Heuristic fallback.
  const roleHits = (text.match(/\b(engineer|technician|manager|operator|driver|welder|electrician|supervisor|officer|analyst|specialist|coordinator|labour|mason|plumber|foreman)\b/gi) ?? []).length;
  const openHits = (text.match(/\b(apply now|current openings|open positions|vacanc|we're hiring|join our team|job openings)\b/gi) ?? []).length;
  const active = atsHit || openHits > 0 || roleHits > 6;
  return { active, jobs: [], note: atsHit ? "ATS / apply flow detected" : active ? `${roleHits} role mentions, ${openHits} hiring cues` : "No clear openings found" };
}

export async function scanCompany(input: { name: string; website?: string; careerUrl?: string; country?: string }): Promise<{ company: string; status: string; jobsFound: number; careerUrl: string | null }> {
  const domain = (input.website ?? "").replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
  let careerUrl = input.careerUrl ?? null;
  if (!careerUrl && domain) careerUrl = await findCareerUrl(domain);

  let status = "UNREACHABLE";
  let jobs: { title: string; location?: string }[] = [];
  let note = "Career page not reachable";

  if (careerUrl) {
    const page = await fetchText(careerUrl, 12000);
    if (page.ok && page.html) {
      const a = await analyze(page.html);
      status = a.active ? "ACTIVELY_HIRING" : "QUIET";
      jobs = a.jobs;
      note = a.note;
    }
  }

  const hc = await prisma.hiringCompany.upsert({
    where: { name: input.name },
    update: { website: domain ? `https://${domain}` : undefined, careerUrl, country: input.country, status, jobsFound: jobs.length, signal: note, lastCheckedAt: new Date() },
    create: { name: input.name, website: domain ? `https://${domain}` : null, careerUrl, country: input.country ?? null, status, jobsFound: jobs.length, signal: note, lastCheckedAt: new Date() },
  });

  await prisma.discoveredJob.deleteMany({ where: { companyRef: hc.id } });
  if (jobs.length) {
    await prisma.discoveredJob.createMany({ data: jobs.map((j) => ({ companyRef: hc.id, title: j.title, location: j.location ?? null, url: careerUrl })) });
  }

  // Turn an actively-hiring company into a CRM lead for outreach.
  if (status === "ACTIVELY_HIRING") {
    const existing = await prisma.lead.findFirst({ where: { company: input.name, source: "Hiring Signals" } });
    if (!existing) {
      await prisma.lead.create({
        data: { name: input.name, company: input.name, source: "Hiring Signals", stage: "NEW", notes: `Actively hiring${jobs.length ? ` (${jobs.length} open roles)` : ""}${input.country ? ` · ${input.country}` : ""}. Careers: ${careerUrl ?? "n/a"}` },
      });
    }
  }

  return { company: input.name, status, jobsFound: jobs.length, careerUrl };
}

/** Scan a batch of curated companies in a country; stop once `limit` actively-hiring found. */
export async function discoverHiringBatch(opts: { country?: string; limit?: number }): Promise<{ scanned: number; hiring: number; country: string }> {
  const target = Math.min(Math.max(opts.limit ?? 5, 1), 15);
  const seeds = seedsFor(opts.country);
  const already = new Set((await prisma.hiringCompany.findMany({ select: { name: true } })).map((c) => c.name.toLowerCase()));

  let scanned = 0;
  let hiring = 0;
  for (const s of seeds) {
    if (hiring >= target || scanned >= target * 3) break;
    if (already.has(s.name.toLowerCase())) continue;
    const r = await scanCompany({ name: s.name, website: s.domain, country: opts.country });
    scanned++;
    if (r.status === "ACTIVELY_HIRING") hiring++;
  }
  return { scanned, hiring, country: opts.country ?? "Gulf" };
}
