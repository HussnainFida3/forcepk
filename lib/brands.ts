// Real employer brands shown in the "trusted by" strip. Logos are the real
// company marks served by Google's favicon service (follows a redirect to the
// actual icon) — no API key, reliable in the browser.
export const EMPLOYER_BRANDS: { name: string; domain: string }[] = [
  { name: "Saudi Aramco", domain: "aramco.com" },
  { name: "SABIC", domain: "sabic.com" },
  { name: "Emaar", domain: "emaar.com" },
  { name: "ACWA Power", domain: "acwapower.com" },
  { name: "Qatar Airways", domain: "qatarairways.com" },
  { name: "Emirates", domain: "emirates.com" },
  { name: "Almarai", domain: "almarai.com" },
  { name: "stc", domain: "stc.com.sa" },
  { name: "Nesma", domain: "nesma.com" },
  { name: "Dubai Holding", domain: "dubaiholding.com" },
  { name: "Mace", domain: "macegroup.com" },
  { name: "Bechtel", domain: "bechtel.com" },
];

export const brandLogo = (domain: string) => `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
