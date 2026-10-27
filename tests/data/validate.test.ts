// The data invariants hold for the current data, and each rule actually fires when the data
// breaks it (so none of them passes vacuously).
import { describe, expect, test } from 'vitest';
import type { Copy, TennisDb } from '../../src/core/types';
import { validateData } from '../../src/core/validate';
import { fileIssues, loadFromDisk } from '../../scripts/validate-data';

const base = loadFromDisk();

function rulesAfter(mutate: (db: TennisDb, copy: Copy) => void, css = base.css): string[] {
  const db = structuredClone(base.db);
  const copy = structuredClone(base.copy);
  mutate(db, copy);
  return [...new Set(validateData(db, copy, css).map((i) => i.rule))];
}

const str = (db: TennisDb, id: string) => db.strings.find((s) => s.id === id)!;
const grip = (db: TennisDb, name: string) =>
  Object.values(db.grips)
    .flatMap((t) => Object.values(t).flat())
    .find((g) => g!.name === name)!;

test('the current data passes every invariant', () => {
  expect(validateData(base.db, base.copy, base.css)).toEqual([]);
});

test('data files are UTF-8 without \\u escapes, and code has no smart quotes', () => {
  expect(fileIssues()).toEqual([]);
});

describe('each rule fires on broken data', () => {
  test.each<[string, (db: TennisDb, copy: Copy) => void]>([
    ['neutral-text', (db) => (str(db, 'toroline-caviar').perRacquet.regna!.note += ' Ideal for your game.')],
    ['neutral-text', (db) => (db.gutHybrids.regna![0]!.notes += ' Avoid it.')],
    ['neutral-grip-text', (db) => (grip(db, 'Tac').notes = 'Best for sweaty hands.')],
    ['neutral-grip-text', (_db, copy) => (copy.gripAbout.kimony += ' A strong pick.')],
    ['notes-present', (db) => (str(db, 'toroline-caviar').perRacquet.percept!.note = 'Short.')],
    ['notes-present', (db) => (db.gutHybrids.percept![0]!.notes = '')],
    ['stiffness-band', (db) => (str(db, 'toroline-caviar').stiffness.label = 'Stiffish · 1.00')],
    ['firm-xor-soft', (db) => (str(db, 'toroline-caviar').feelAttr = 'crisp')],
    ['firm-soft-band', (db) => (str(db, 'toroline-o-toro').feelAttr = 'firm,lively')],
    ['crisp-tag', (db) => (str(db, 'toroline-caviar').feelAttr = 'firm')],
    ['feel-tokens', (db) => (str(db, 'toroline-caviar').feelAttr += ',muted')],
    ['shape-tokens', (db) => (str(db, 'toroline-caviar').shapeAttr = 'hex')],
    ['feel-chip-coverage', (db) => db.strings.forEach((s) => (s.feelAttr = s.feelAttr.replace(',lively', '')))],
    ['grip-tags', (db) => (grip(db, 'Tac').gripFeelAttr = '')],
    ['grip-tags', (db) => (grip(db, 'Tourna Grip Original').gripFeelAttr = 'absorbent')],
    ['grip-tags', (db) => (grip(db, 'Mega Tac').gripFeelAttr = 'firm')],
    ['grip-tags', (db) => (grip(db, 'Pro Tour Leather').gripFeelAttr = 'firm')],
    ['tag-variant', (db) => (str(db, 'toroline-caviar').feelTags[0]!.variant = 'firm')],
    ['tag-variant', (db) => str(db, 'toroline-caviar').feelTags.push({ label: 'Zingy', variant: 'crisp' })],
    ['bar-claims', (db) => (grip(db, 'Mega Tac').tackiness!.width = 99)],
    ['bar-claims', (db) => (grip(db, 'Tac').tackiness!.width = 95)],
    ['bar-claims', (db) => (grip(db, 'Last Dry').absorption!.width = 99)],
    ['ids-unique', (db) => (db.strings[1]!.id = db.strings[0]!.id)],
    ['brand-refs', (db) => (str(db, 'toroline-caviar').brand = 'wilson')],
    ['per-racquet-keys', (db) => delete str(db, 'toroline-caviar').perRacquet.headpt630],
    ['gut-racquets', (db) => (db.gutHybrids.pure98 = [])],
    ['gut-string-refs', (db) => (db.gutHybrids.regna![0]!.crosses.stringId = 'luxilon-nope')],
    ['copy-refs', (_db, copy) => (copy.brandFooters.toroline!.byRacquet = { nope: '<p>x</p>' })],
    ['copy-refs', (_db, copy) => (copy.gripAbout.wilson = 'About Wilson')],
    ['retired', (db) => ((str(db, 'toroline-caviar') as unknown as Record<string, unknown>).topPick = true)],
    ['retired', (db) => (str(db, 'toroline-caviar').feelSummary = 'Connected, direct')],
    ['retired', (db) => (str(db, 'solinco-tb-diamond-rough').shapeAttr = 'square-textured')],
  ])('%s', (rule, mutate) => {
    expect(rulesAfter(mutate)).toContain(rule);
  });

  test('tag-css', () => {
    expect(rulesAfter(() => {}, base.css.replace(/\.tag-plush\s*\{/g, '.tag-gone {'))).toContain('tag-css');
  });
  test('grip-header-css', () => {
    expect(
      rulesAfter(() => {}, base.css.replace(/\.gfilter-header-tourna\s*\{/g, '.gone {')),
    ).toContain('grip-header-css');
  });
});

test('a fourth racquet without notes lists exactly what it is missing', () => {
  const db = structuredClone(base.db);
  db.racquets.push({ ...db.racquets[0]!, id: 'test4', label: 'Test 4' });
  const issues = validateData(db, base.copy, base.css);
  const missing = issues.filter((i) => i.rule === 'notes-present');
  expect(missing).toHaveLength(72 + 10);
  expect(missing[0]!.where).toBe('toroline-o-toro-tour/test4');
  expect(issues.filter((i) => i.rule === 'per-racquet-keys')).toHaveLength(82);
});
