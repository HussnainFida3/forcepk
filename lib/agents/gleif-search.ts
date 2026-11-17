/**
 * GLEIF (Global Legal Entity Identifier Foundation) search.
 * Free API, no key needed. Returns registered companies worldwide
 * with name, address, city, country. ~2M+ entities.
 * https://api.gleif.org/api/v1/lei-records
 */

const GLEIF_BASE = 'https://api.gleif.org/api/v1/lei-records';

export interface GleifCompany {
  name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  category: string | null;
}

export async function searchGleif(
  query: string,
  opts?: { country?: string; limit?: number },
): Promise<GleifCompany[]> {
  const limit = Math.min(opts?.limit ?? 20, 50);
  const params = new URLSearchParams({
    'filter[entity.legalName]': query,
    'filter[entity.status]': 'ACTIVE',
    'page[size]': String(limit),
  });
  if (opts?.country) {
    params.set('filter[entity.legalAddress.country]', opts.country.toUpperCase());
  }

  try {
    const res = await fetch(`${GLEIF_BASE}?${params}`, {
      headers: { Accept: 'application/vnd.api+json' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const records = Array.isArray(json?.data) ? json.data : [];

    return records.map((r: any) => {
      const entity = r?.attributes?.entity;
      if (!entity) return null;
      const name = entity.legalName?.name;
      if (!name) return null;
      const addr = entity.legalAddress;
      return {
        name,
        city: addr?.city ?? null,
        country: addr?.country ?? null,
        address: Array.isArray(addr?.addressLines) ? addr.addressLines.join(', ') : null,
        category: entity.category === 'SOLE_PROPRIETOR' ? 'Sole Proprietor' : entity.legalForm?.other ?? null,
      } as GleifCompany;
    }).filter(Boolean) as GleifCompany[];
  } catch {
    return [];
  }
}
