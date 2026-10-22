import { expect, test } from 'vitest';
import { assembleDb } from '../../src/core/db';
import { brandOfStringId, orderedPairings } from '../../src/core/gut';

const db = assembleDb();

test('gut-mains pairings come first, each group in declared order', () => {
  for (const r of db.racquets) {
    const declared = db.gutHybrids[r.id]!;
    const ordered = orderedPairings(db, r.id);
    expect(ordered).toHaveLength(declared.length);
    const firstCrosses = ordered.findIndex((p) => p.config === 'gut-crosses');
    expect(ordered.slice(firstCrosses).every((p) => p.config === 'gut-crosses')).toBe(true);
    const mainsIds = declared.filter((p) => p.config === 'gut-mains').map((p) => p.id);
    expect(ordered.slice(0, mainsIds.length).map((p) => p.id)).toEqual(mainsIds);
  }
});

test('a racquet without pairings gets none', () => {
  expect(orderedPairings(db, 'nope')).toEqual([]);
});

test('brand lookup for pairing strings', () => {
  expect(brandOfStringId(db, 'gut-babolat-vs-touch')).toBe('gut');
  expect(brandOfStringId(db, 'luxilon-alu-power')).toBe('luxilon');
  expect(brandOfStringId(db, 'toroline-k-pop')).toBe('toroline');
  expect(brandOfStringId(db, undefined)).toBe('');
});
