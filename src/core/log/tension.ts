// Stringing tension as numbers in kg, parsed from the log form's free-text field.
// Accepted: "24", "23.5", "23,5", "23/24", "23 / 24", "24 kg", "23/24 kg"; empty means none.

export interface Tension {
  mainsKg: number;
  /** null when one tension is used for the whole bed. */
  crossesKg: number | null;
}

/** Plausible stringing tensions; anything outside is treated as a typo. */
export const MIN_KG = 5;
export const MAX_KG = 40;

const NUMBER = String.raw`(\d{1,2}(?:[.,]\d{1,2})?)`;
const PATTERN = new RegExp(String.raw`^${NUMBER}\s*(?:kg)?\s*(?:/\s*${NUMBER}\s*(?:kg)?)?$`, 'i');

export type ParsedTension = { ok: true; value: Tension | null } | { ok: false };

export function parseTension(text: string): ParsedTension {
  const t = text.trim();
  if (!t) return { ok: true, value: null };
  const m = t.match(PATTERN);
  if (!m) return { ok: false };
  const toKg = (s: string): number => Number(s.replace(',', '.'));
  const mainsKg = toKg(m[1]!);
  const crossesKg = m[2] ? toKg(m[2]) : null;
  const inRange = (kg: number): boolean => kg >= MIN_KG && kg <= MAX_KG;
  if (!inRange(mainsKg) || (crossesKg !== null && !inRange(crossesKg))) return { ok: false };
  return { ok: true, value: { mainsKg, crossesKg } };
}

/** "24", "23.5" or "23/24", as entered and as shown in the log. */
export function formatTension(t: Tension | null): string {
  if (!t) return '';
  return t.crossesKg === null ? String(t.mainsKg) : `${t.mainsKg}/${t.crossesKg}`;
}
