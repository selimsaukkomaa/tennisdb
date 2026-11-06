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
const pairing = (db: TennisDb, itemId: string, racquetId: string) =>
  db.pairings.find((p) => p.itemId === itemId && p.racquetId === racquetId)!;
const gutOf = (db: TennisDb, racquetId: string) =>
  db.gutHybrids.find((p) => p.racquetId === racquetId)!;
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
    ['neutral-text', (db) => (pairing(db, 'toroline-caviar', 'regna').note += ' Ideal for your game.')],
    ['neutral-text', (db) => (gutOf(db, 'regna').notes += ' Avoid it.')],
    ['neutral-grip-text', (db) => (grip(db, 'Tac').notes = 'Best for sweaty hands.')],
    ['neutral-grip-text', (_db, copy) => (copy.gripAbout.kimony += ' A strong pick.')],
    ['notes-present', (db) => (pairing(db, 'toroline-caviar', 'percept').note = 'Short.')],
    ['notes-present', (db) => (gutOf(db, 'percept').notes = '')],
    ['stiffness-band', (db) => (str(db, 'toroline-caviar').stiffness.label = 'Stiffish · 1.00')],
    ['firm-xor-soft', (db) => (str(db, 'toroline-caviar').feelAttr = 'crisp')],
    ['firm-soft-band', (db) => (str(db, 'toroline-o-toro').feelAttr = 'firm,lively')],
    ['crisp-tag', (db) => (str(db, 'toroline-caviar').feelAttr = 'firm')],
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
    ['pairings-complete', (db) => db.pairings.splice(db.pairings.indexOf(pairing(db, 'toroline-caviar', 'headpt630')), 1)],
    ['pairings-complete', (db) => db.pairings.push({ ...pairing(db, 'toroline-caviar', 'regna') })],
    ['pairing-refs', (db) => (pairing(db, 'toroline-caviar', 'regna').itemId = 'toroline-nope')],
    ['pairing-refs', (db) => (pairing(db, 'toroline-caviar', 'regna').racquetId = 'pure98')],
    ['tension-range', (db) => (pairing(db, 'toroline-caviar', 'regna').tension = { kind: 'range', minKg: 24, maxKg: 22 })],
    ['gut-racquets', (db) => (gutOf(db, 'regna').racquetId = 'pure98')],
    ['gut-string-refs', (db) => (gutOf(db, 'regna').crosses.stringId = 'luxilon-nope')],
    ['copy-refs', (_db, copy) => (copy.brandFooters.toroline!.byRacquet = { nope: '<p>x</p>' })],
    ['copy-refs', (_db, copy) => (copy.gripAbout.wilson = 'About Wilson')],
    ['retired', (db) => (str(db, 'toroline-caviar').feelSummary = 'Connected, direct')],
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

/** Schema issues after a mutation, as "where: message" lines. */
function schemaAfter(mutate: (db: TennisDb, copy: Copy) => void): string[] {
  const db = structuredClone(base.db);
  const copy = structuredClone(base.copy);
  mutate(db, copy);
  const issues = validateData(db, copy, base.css);
  expect(issues.every((i) => i.rule === 'schema')).toBe(true);
  return issues.map((i) => `${i.where}: ${i.message}`);
}
const loose = (o: object): Record<string, unknown> => o as Record<string, unknown>;

describe('the schemas catch a bad shape, and nothing else runs until it is fixed', () => {
  test.each<[string, string, (db: TennisDb, copy: Copy) => void]>([
    ['a feel token no chip matches', 'strings.toroline-caviar.feelAttr', (db) => (str(db, 'toroline-caviar').feelAttr += ',muted')],
    ['a shape token no chip matches', 'strings.toroline-caviar.shapeAttr', (db) => (str(db, 'toroline-caviar').shapeAttr = 'hex')],
    ['"square-textured" (retired in v0.990)', 'strings.solinco-tb-diamond-rough.shapeAttr', (db) => (str(db, 'solinco-tb-diamond-rough').shapeAttr = 'square-textured')],
    ['a topPick key (retired in v0.989)', 'strings.toroline-caviar', (db) => (loose(str(db, 'toroline-caviar')).topPick = true)],
    ['an unknown key on a grip', 'grips.tourna.wet.tourna-tac', (db) => (loose(grip(db, 'Tac')).rating = 5)],
    ['a missing field', 'strings.toroline-caviar.feelSummary', (db) => delete loose(str(db, 'toroline-caviar')).feelSummary],
    ['a bar width over 100', 'strings.toroline-caviar.spin.width', (db) => (str(db, 'toroline-caviar').spin.width = 120)],
    ['a bar width as text', 'strings.toroline-caviar.power.width', (db) => (loose(str(db, 'toroline-caviar').power).width = '38')],
    ['a colour that is not hex', 'brandsStrings.toroline.accent', (db) => (db.brandsStrings.toroline!.accent = 'gold')],
    ['an id that is not kebab-case', 'strings.Toroline Caviar.id', (db) => (str(db, 'toroline-caviar').id = 'Toroline Caviar')],
    ['an unknown grip type', 'grips.tourna.wet.tourna-tac', (db) => (loose(grip(db, 'Tac')).gripType = 'hybrid')],
    ['an unknown tag colour', 'strings.toroline-caviar.feelTags.0.variant', (db) => (loose(str(db, 'toroline-caviar').feelTags[0]!).variant = 'gold')],
    ['a gut pairing with an unknown config', 'gutHybrids.gh-regna-1.config', (db) => (loose(gutOf(db, 'regna')).config = 'gut-both')],
    ['a tension kind the item cannot take', 'pairings.toroline-k-pop/regna.tension', (db) => (loose(pairing(db, 'toroline-k-pop', 'regna')).tension = { kind: 'range', minKg: 22, maxKg: 24 })],
    ['a tension written as text', 'pairings.toroline-caviar/regna.tension', (db) => (loose(pairing(db, 'toroline-caviar', 'regna')).tension = '22–24')],
    ['a tension outside 5–40 kg', 'pairings.toroline-caviar/regna.tension', (db) => (pairing(db, 'toroline-caviar', 'regna').tension = { kind: 'max', maxKg: 60 })],
    ['copy without the gut intro', 'copy: gutIntro', (_db, copy) => delete loose(copy).gutIntro],
  ])('%s', (_name, where, mutate) => {
    const issues = schemaAfter(mutate);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.includes(where))).toBe(true);
  });
});

test('a fourth racquet without notes lists exactly what it is missing', () => {
  const db = structuredClone(base.db);
  db.racquets.push({ ...db.racquets[0]!, id: 'test4', label: 'Test 4' });
  const issues = validateData(db, base.copy, base.css);
  const missing = issues.filter((i) => i.rule === 'notes-present');
  expect(missing).toHaveLength(72 + 10);
  expect(missing[0]!.where).toBe('toroline-o-toro-tour/test4');
  expect(issues.filter((i) => i.rule === 'pairings-complete')).toHaveLength(82);
});
