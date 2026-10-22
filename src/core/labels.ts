// Display labels derived from data, shared by the UI and the search index.
import type { BrandId, Racquet } from './types';

/** "Kimony" from "kimony": v0.990 labels grip brands by capitalising the key. */
export const gripBrandLabel = (brand: BrandId): string =>
  brand.charAt(0).toUpperCase() + brand.slice(1);

/** Context-line spec, e.g. "64 RA · 16×19 · 100 sq in". */
export const racquetSpec = (r: Racquet): string => `${r.ra} RA · ${r.pattern} · ${r.headSize}`;
