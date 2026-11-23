import { describe, expect, test } from 'vitest';
import { assembleDb } from '../../src/core/db';
import { perRacquet } from '../../src/core/pairings';
import {
  RACQUET_ICON,
  SEARCH_GROUPS,
  buildSearchIndex,
  resultKey,
  searchIndex,
  type SearchItem,
} from '../../src/core/search';

const db = assembleDb();
const index = buildSearchIndex(db, 'regna');
const percept = buildSearchIndex(db, 'percept');

describe('search index', () => {
  test('for the racquet on screen: each string and hybrid once, its gut pairings, every racquet', () => {
    const count = (type: SearchItem['type']): number => index.filter((i) => i.type === type).length;
    expect(count('racquet')).toBe(3);
    expect(count('string')).toBe(72);
    expect(count('hybrid')).toBe(10);
    expect(count('grip')).toBe(35);
    expect(count('guthybrid')).toBe(7);
    const opensIn = (items: SearchItem[]): (string | undefined)[] => [
      ...new Set(
        items.filter((i) => i.type !== 'grip' && i.type !== 'racquet').map((i) => i.racquet),
      ),
    ];
    expect(opensIn(index)).toEqual(['regna']);
    expect(opensIn(percept)).toEqual(['percept']);
  });

  test("a string matches the racquet on screen's note, not another racquet's", () => {
    const id = 'toroline-caviar';
    const regnaNote = perRacquet(db, id, 'regna')!.note;
    const perceptNote = perRacquet(db, id, 'percept')!.note;
    expect(regnaNote).not.toBe(perceptNote);
    const inPercept = percept.find((i) => i.id === id)!;
    expect(inPercept.sourceText).toContain(perceptNote);
    expect(inPercept.sourceText).not.toContain(regnaNote);
  });

  test('racquets come first, labelled by model with brand and spec', () => {
    expect(SEARCH_GROUPS[0]).toEqual({ type: 'racquet', label: 'Rackets' });
    const regna = index.find((i) => i.type === 'racquet' && i.id === 'regna')!;
    expect(regna).toMatchObject({
      label: 'Regna 100',
      sublabel: 'Yonex · 65 RA · 16×19 · 100 sq in',
      racquet: 'regna',
      icon: RACQUET_ICON,
    });
    expect(regna.brand).toBeUndefined();
    expect(searchIndex('regna', index)[0]).toBe(regna);
    expect(searchIndex('yonex percept', index)[0]!.id).toBe('percept');
  });

  test('labels and sublabels follow v0.990', () => {
    const caviar = percept.find((i) => i.id === 'toroline-caviar')!;
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

  test('grip specs are searched as text, not as markup (since v1.0)', () => {
    const ids = (q: string): string[] => searchIndex(q, index).map((i) => i.id);
    expect(ids('made in usa')).toContain('kimony-tourna');
    // v0.990 searched the spec's inline HTML, so the colour code found this grip.
    expect(ids('d97706')).toEqual([]);
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
    for (const items of [index, percept]) {
      const keys = items.map(resultKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});
