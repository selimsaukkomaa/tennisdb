// Display labels derived from data, shared by the UI and the search index.
import type { BrandId, Racquet } from './types';

/** "Kimony" from "kimony": v0.990 labels grip brands by capitalising the key. */
export const gripBrandLabel = (brand: BrandId): string =>
  brand.charAt(0).toUpperCase() + brand.slice(1);

/** A racquet's full name, e.g. "Yonex Regna 100". */
export const racquetLabel = (r: Racquet): string => `${r.brand} ${r.model}`;

/** Context-line spec, e.g. "65 RA · 16×19 · 100 sq in". */
export const racquetSpec = (r: Racquet): string =>
  `${r.ra} RA · ${r.pattern.mains}×${r.pattern.crosses} · ${r.headSizeSqIn} sq in`;

export interface RacquetGroup {
  brand: string;
  racquets: Racquet[];
}

const byName = (a: string, b: string): number =>
  a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true });

/**
 * The racquet menu's order (since v1.10): brands A–Z, models A–Z within each. The data's own
 * order only decides the start racquet (the first one).
 */
export function racquetGroups(racquets: readonly Racquet[]): RacquetGroup[] {
  const groups = new Map<string, Racquet[]>();
  for (const r of racquets) groups.set(r.brand, [...(groups.get(r.brand) ?? []), r]);
  return [...groups.keys()].sort(byName).map((brand) => ({
    brand,
    racquets: groups.get(brand)!.sort((a, b) => byName(a.model, b.model)),
  }));
}
