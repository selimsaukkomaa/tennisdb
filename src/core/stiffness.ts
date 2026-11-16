// Stiffness: a band, and for most strings a lab figure in kg/mm with its provenance. The label
// and bar the views show are derived here. The band and the bar width are still stored; Phase 2
// derives them from the figure later (docs/phase-2-data-model.md, D2 and D3).
import type { Bar, Hybrid, StringRec } from './types';

type AnyStiffness = StringRec['stiffness'] | Hybrid['stiffness'];

/** "Firm · 1.10", "Firm · ~1.10", "Medium · 0.95–1.00", or the band alone without a figure. */
export function stiffnessLabel(s: AnyStiffness): string {
  const figure = 'figure' in s ? s.figure : null;
  if (!figure) return s.band;
  const k = figure.kgPerMm;
  const text = typeof k === 'number' ? k.toFixed(2) : `${k.min.toFixed(2)}–${k.max.toFixed(2)}`;
  return `${s.band} · ${figure.approx ? '~' : ''}${text}`;
}

/** The stiffness as the labelled bar the tables and compare draw. */
export const stiffnessBar = (s: AnyStiffness): Bar => ({
  label: stiffnessLabel(s),
  width: s.width,
});
