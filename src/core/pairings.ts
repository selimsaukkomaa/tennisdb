// Pairings (data/pairings.json): how each string and hybrid is strung in each racquet, and the
// racquet's gut pairings. Tensions are stored as numbers and printed here the way the tables,
// compare and search have shown them since v0.990.
import type { GutPairing, Pairing, RacquetId, Tension, TennisDb } from './types';

/** "22–24", "max 16", "25 (5% PS)" or "23/24". */
export function tensionLabel(t: Tension): string {
  switch (t.kind) {
    case 'range':
      return `${t.minKg}–${t.maxKg}`;
    case 'max':
      return `max ${t.maxKg}`;
    case 'prestretch':
      return `${t.kg} (${t.prestretchPct}% PS)`;
    case 'split':
      return `${t.mainsKg}/${t.crossesKg}`;
  }
}

/** What the views show for one item in one racquet. */
export interface PerRacquet {
  tension: string;
  note: string;
}

// One index per pairings array: assembleDb hands out a fresh array, so an index never goes
// stale unless that array is edited in place after the first lookup.
const indexes = new WeakMap<readonly Pairing[], Map<string, Pairing>>();
const key = (itemId: string, racquet: RacquetId): string => `${itemId}@${racquet}`;

export function pairingFor(db: TennisDb, itemId: string, racquet: RacquetId): Pairing | undefined {
  let index = indexes.get(db.pairings);
  if (!index) {
    index = new Map(db.pairings.map((p) => [key(p.itemId, p.racquetId), p]));
    indexes.set(db.pairings, index);
  }
  return index.get(key(itemId, racquet));
}

/** The tension (as text) and note for an item in a racquet; undefined without a pairing. */
export function perRacquet(
  db: TennisDb,
  itemId: string,
  racquet: RacquetId,
): PerRacquet | undefined {
  const p = pairingFor(db, itemId, racquet);
  return p && { tension: tensionLabel(p.tension), note: p.note };
}

/** A racquet's gut pairings, in declared order. */
export const gutPairingsFor = (db: TennisDb, racquet: RacquetId): GutPairing[] =>
  db.gutHybrids.filter((p) => p.racquetId === racquet);
