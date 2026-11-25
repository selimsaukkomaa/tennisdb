// The racquet menu's order (src/core/labels.ts, since v1.10): brands A–Z, models A–Z.
import { describe, expect, test } from 'vitest';
import { assembleDb } from '../../src/core/db';
import { racquetGroups } from '../../src/core/labels';
import type { Racquet } from '../../src/core/types';

const frame = (id: string, brand: string, model: string): Racquet => ({
  id,
  brand,
  model,
  headSizeSqIn: 100,
  pattern: { mains: 16, crosses: 19 },
  ra: 65,
});

const names = (racquets: readonly Racquet[]): [string, string[]][] =>
  racquetGroups(racquets).map((g) => [g.brand, g.racquets.map((r) => r.model)]);

describe('racquetGroups', () => {
  test("the data's four: Babolat, Head, then Yonex", () => {
    expect(names(assembleDb().racquets)).toEqual([
      ['Babolat', ['Pure Drive 2025']],
      ['Head', ['Pro Tour 630']],
      ['Yonex', ['Percept 100D', 'Regna 100']],
    ]);
  });

  test('brands and models A–Z, numbers in numeric order, whatever the data order', () => {
    const racquets = [
      frame('a', 'Yonex', 'Regna 100'),
      frame('b', 'Wilson', 'Pro Staff 97'),
      frame('c', 'Babolat', 'Pure Drive'),
      frame('d', 'Wilson', 'Blade 98'),
      frame('e', 'Yonex', 'EZONE 100'),
      frame('f', 'Babolat', 'Pure Aero'),
      frame('g', 'Wilson', 'Clash 100'),
      frame('h', 'Head', 'Speed MP'),
      frame('i', 'Head', 'Pro Tour 630'),
      frame('j', 'Yonex', 'Percept 100D'),
      frame('k', 'Wilson', 'Blade 104'),
    ];
    expect(names(racquets)).toEqual([
      ['Babolat', ['Pure Aero', 'Pure Drive']],
      ['Head', ['Pro Tour 630', 'Speed MP']],
      ['Wilson', ['Blade 98', 'Blade 104', 'Clash 100', 'Pro Staff 97']],
      ['Yonex', ['EZONE 100', 'Percept 100D', 'Regna 100']],
    ]);
    // The data itself is left in its order: the first racquet is still the start racquet.
    expect(racquets[0]!.id).toBe('a');
  });
});
