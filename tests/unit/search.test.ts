import { describe, expect, test } from 'vitest';
import { assembleDb } from '../../src/core/db';
import { buildSearchIndex, resultKey, searchIndex, type SearchItem } from '../../src/core/search';

const db = assembleDb();
const index = buildSearchIndex(db);

describe('search index', () => {
  test('one entry per string and hybrid per racquet, plus grips and gut pairings', () => {
    const count = (type: SearchItem['type']): number => index.filter((i) => i.type === type).length;
    expect(count('string')).toBe(72 * 3);
    expect(count('hybrid')).toBe(10 * 3);
    expect(count('grip')).toBe(35);
    expect(count('guthybrid')).toBe(21);
    expect(count('log')).toBe(0);
  });

  test('labels and sublabels follow v0.990', () => {
    const caviar = index.find((i) => i.id === 'toroline-caviar' && i.racquet === 'percept')!;
    expect(caviar.sublabel).toBe('Toroline · Percept 100D');
    const kpop = index.find((i) => i.id === 'toroline-k-pop')!;
    expect(kpop.label).toBe('K-Pop (hybrid)');
    const megaTac = index.find((i) => i.id === 'tourna-mega-tac')!;
    expect(megaTac.sublabel).toBe('Tourna · Wet Overgrip');
    expect(megaTac.icon).toBe('🎯');
    const gut = index.find((i) => i.id === 'gh-regna-1')!;
    expect(gut.label).toBe('Babolat VS Touch / ALU Power');
    expect(gut.sublabel).toBe('⬆ Gut Mains · Regna 100');
  });

  test('log entries are indexed with their tension in the sublabel', () => {
    const withLog = buildSearchIndex(db, [
      {
        id: 'a1',
        racquet: 'regna',
        date: '2026-10-01',
        stringName: 'Caviar',
        tension: '23/24',
        note: '',
      },
    ]);
    const entry = withLog.find((i) => i.type === 'log')!;
    expect(entry.id).toBe('log-a1');
    expect(entry.sublabel).toBe('Logged on 2026-10-01 · Regna 100 @ 23/24');
  });
});

describe('scoring', () => {
  test('needs two characters', () => {
    expect(searchIndex('c', index)).toEqual([]);
    expect(searchIndex('  c ', index)).toEqual([]);
  });

  test('label matches rank above text matches', () => {
    const results = searchIndex('caviar', index);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.label).toBe('Caviar');
    const firstTextOnly = results.findIndex((r) => !r.label.toLowerCase().includes('caviar'));
    expect(
      results.slice(firstTextOnly).every((r) => !r.label.toLowerCase().includes('caviar')),
    ).toBe(true);
  });

  test('exact label beats prefix', () => {
    const results = searchIndex('o-toro', index);
    expect(results[0]!.label).toBe('O-Toro');
  });

  test('no Top Pick residue in sublabels', () => {
    expect(index.some((i) => /Top Pick|★/.test(i.sublabel))).toBe(false);
  });

  test('result keys are unique', () => {
    const keys = index.map(resultKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
