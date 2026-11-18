// Stiffness: for most strings a lab figure in kg/mm with its provenance, from which the band is
// derived by fixed thresholds (docs/phase-2-data-model.md, D2). A string without a figure, and
// every hybrid, stores its band. The label and bar the views show are derived here, and so is
// the Firm/Soft feel chip (D8). The bar is drawn on one scale for every brand (D3).
import type { Bar, Hybrid, StringRec } from './types';

/** Stiffness bands, softest first. */
export const STIFFNESS_BANDS = [
  'Very Soft',
  'Soft',
  'Med-Soft',
  'Medium',
  'Med-Firm',
  'Firm',
  'Very Firm',
] as const;
export type Band = (typeof STIFFNESS_BANDS)[number];

type AnyStiffness = StringRec['stiffness'] | Hybrid['stiffness'];
type KgPerMm = number | { min: number; max: number };

/**
 * A figure, or a range's midpoint, in thousandths of a kg/mm: integers, so a midpoint such as
 * (0.85 + 0.95) / 2 lands exactly on 900 and the thresholds below compare exactly.
 */
const thousandths = (k: KgPerMm): number =>
  Math.round((typeof k === 'number' ? k : (k.min + k.max) / 2) * 1000);

/**
 * D2's rule: the band of a figure, or of a range's midpoint. Each band starts at its lower
 * bound: Soft 0.70, Med-Soft 0.85, Medium 0.92, Med-Firm 0.98, Firm 1.05, Very Firm 1.10.
 */
export function bandFor(k: KgPerMm): Band {
  const m = thousandths(k);
  if (m < 700) return 'Very Soft';
  if (m < 850) return 'Soft';
  if (m < 920) return 'Med-Soft';
  if (m < 980) return 'Medium';
  if (m < 1050) return 'Med-Firm';
  if (m < 1100) return 'Firm';
  return 'Very Firm';
}

/** The band: from the figure when there is one, otherwise as stored. */
export function stiffnessBand(s: AnyStiffness): Band {
  // A string with a figure stores no band (the schema allows a band exactly when there is none).
  return 'band' in s ? s.band : bandFor(s.figure.kgPerMm);
}

/** Med-Firm and firmer carry the Firm feel chip, Medium and softer the Soft one. */
export const FIRM_BANDS: ReadonlySet<Band> = new Set<Band>(['Med-Firm', 'Firm', 'Very Firm']);
export const firmOrSoft = (s: AnyStiffness): 'firm' | 'soft' =>
  FIRM_BANDS.has(stiffnessBand(s)) ? 'firm' : 'soft';

/** "Firm · 1.10", "Firm · ~1.10", "Medium · 0.95–1.00", or the band alone without a figure. */
export function stiffnessLabel(s: AnyStiffness): string {
  const band = stiffnessBand(s);
  const figure = 'figure' in s ? s.figure : null;
  if (!figure) return band;
  const k = figure.kgPerMm;
  const text = typeof k === 'number' ? k.toFixed(2) : `${k.min.toFixed(2)}–${k.max.toFixed(2)}`;
  return `${band} · ${figure.approx ? '~' : ''}${text}`;
}

/** Where a band's bar is drawn without a figure (a string without one, every hybrid): an estimate. */
export const BAND_MIDPOINTS: Readonly<Record<Band, number>> = {
  'Very Soft': 0.65,
  Soft: 0.78,
  'Med-Soft': 0.88,
  Medium: 0.95,
  'Med-Firm': 1.01,
  Firm: 1.07,
  'Very Firm': 1.12,
};

/**
 * D3's scale, the same for every brand: 0.55 kg/mm is drawn at 10% and 1.15 kg/mm at 100%,
 * linear, rounded to a whole percent, no less than 4% (Tour Mako, 0.45) and no more than 100%.
 */
export function stiffnessWidth(s: AnyStiffness): number {
  const m =
    'figure' in s && s.figure
      ? thousandths(s.figure.kgPerMm)
      : thousandths(BAND_MIDPOINTS[stiffnessBand(s)]);
  // 10 + (m - 550) / 600 * 90, kept in integers so a half rounds up exactly (1.00 -> 77.5 -> 78).
  return Math.min(100, Math.max(4, Math.round((200 + 3 * (m - 550)) / 20)));
}

/** The stiffness as the labelled bar the tables and compare draw. */
export const stiffnessBar = (s: AnyStiffness): Bar => ({
  label: stiffnessLabel(s),
  width: stiffnessWidth(s),
});

/**
 * A row's feel tokens, as the filter chips match them: the stored ones (Crisp, Plush, Lively)
 * with Firm or Soft from the band, in v0.990's order: Crisp first, then Firm or Soft.
 */
export function feelTokens(row: StringRec | Hybrid): string {
  const stored = row.feelAttr ? row.feelAttr.split(',') : [];
  const crisp = stored[0] === 'crisp' ? ['crisp'] : [];
  return [...crisp, firmOrSoft(row.stiffness), ...stored.slice(crisp.length)].join(',');
}
