// Natural gut / poly pairings: display order and which brand colour a pairing's strings take.
import type { GutPairing, RacquetId, TennisDb } from './types';

/** A racquet's pairings with gut-mains configs first, each group in declared order. */
export function orderedPairings(db: TennisDb, racquet: RacquetId): GutPairing[] {
  const pairings = db.gutHybrids[racquet] ?? [];
  return pairings
    .map((p, idx) => ({ p, idx, mainsFirst: p.config === 'gut-mains' ? 0 : 1 }))
    .sort((a, b) => a.mainsFirst - b.mainsFirst || a.idx - b.idx)
    .map((x) => x.p);
}

/** 'gut' for natural gut ids, otherwise the brand of the referenced string or hybrid. */
export function brandOfStringId(db: TennisDb, id: string | undefined): string {
  if (!id) return '';
  if (id.startsWith('gut-')) return 'gut';
  return (
    db.strings.find((s) => s.id === id)?.brand ?? db.hybrids.find((h) => h.id === id)?.brand ?? ''
  );
}
