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
    ['stiffness-range', (db) => (str(db, 'toroline-caviar').stiffness.figure!.kgPerMm = { min: 1.0, max: 0.9 })],
    ['stiffness-provenance', (db) => (str(db, 'luxilon-alu-power').stiffness.figure!.source = 'manufacturer')],
    ['stiffness-provenance', (db) => (str(db, 'luxilon-alu-power').stiffness.figure!.retrieved = '2026-11')],
    ['stiffness-provenance', (db) => delete str(db, 'toroline-caviar').stiffness.figure!.pages],
    ['stiffness-provenance', (db) => (str(db, 'luxilon-alu-power').stiffness.figure!.pages = ['luxilon-alu-power-silver-125'])],
    ['plain-text', (db) => (pairing(db, 'toroline-caviar', 'regna').note += ' <b>Firm.</b>')],
    ['plain-text', (db) => (gutOf(db, 'regna').notes += ' Gut &amp; poly.')],
    ['plain-text', (db) => (grip(db, 'Tac').specs[0]!.text = '<em>Wet/tacky</em>')],
    ['plain-text', (db) => (str(db, 'toroline-caviar').feelExpand += '<br>')],
    ['crisp-tag', (db) => (str(db, 'toroline-caviar').feelAttr = '')],
    ['feel-chip-coverage', (db) => db.strings.forEach((s) => (s.feelAttr = s.feelAttr.split(',').filter((t) => t !== 'lively').join(',')))],
    ['grip-tags', (db) => (grip(db, 'Tac').gripFeelAttr = '')],
    ['grip-tags', (db) => (grip(db, 'Tourna Grip Original').gripFeelAttr = 'absorbent')],
    ['grip-tags', (db) => (grip(db, 'Mega Tac').gripFeelAttr = 'firm')],
    ['grip-tags', (db) => (grip(db, 'Pro Tour Leather').gripFeelAttr = 'firm')],
    ['bar-claims', (db) => (grip(db, 'Mega Tac').tackiness = 99)],
    ['bar-claims', (db) => (grip(db, 'Tac').tackiness = 95)],
    ['bar-claims', (db) => (grip(db, 'Last Dry').absorption = 99)],
    ['ids-unique', (db) => (db.strings[1]!.id = db.strings[0]!.id)],
    ['brand-refs', (db) => (str(db, 'toroline-caviar').brand = 'wilson')],
    ['pairings-complete', (db) => db.pairings.splice(db.pairings.indexOf(pairing(db, 'toroline-caviar', 'headpt630')), 1)],
    ['pairings-complete', (db) => db.pairings.push({ ...pairing(db, 'toroline-caviar', 'regna') })],
    ['pairing-refs', (db) => (pairing(db, 'toroline-caviar', 'regna').itemId = 'toroline-nope')],
    ['pairing-refs', (db) => (pairing(db, 'toroline-caviar', 'regna').racquetId = 'pure98')],
    ['tension-range', (db) => (pairing(db, 'toroline-caviar', 'regna').tension = { kind: 'range', minKg: 24, maxKg: 22 })],
    ['gut-racquets', (db) => (gutOf(db, 'regna').racquetId = 'pure98')],
    ['gut-string-refs', (db) => (gutOf(db, 'regna').crosses.stringId = 'luxilon-nope')],
    ['hybrid-string-refs', (db) => (db.hybrids[0]!.mains.stringId = 'toroline-nope')],
    ['hybrid-string-refs', (db) => (db.hybrids[0]!.crosses.stringId = 'toroline-k-pop-spin')],
    ['hybrid-side-band', (db) => (db.hybrids[0]!.mains.shapeFeelLabel = 'Square · Firm')],
    ['hybrid-side-band', (db) => (str(db, 'toroline-wasabi').stiffness.figure!.kgPerMm = 1.1)],
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
    ['a rating score over 100', 'strings.toroline-caviar.spin', (db) => (str(db, 'toroline-caviar').spin = 120)],
    ['a rating score as text', 'strings.toroline-caviar.power', (db) => (loose(str(db, 'toroline-caviar')).power = '38')],
    ['a rating score that is not whole', 'grips.tourna.wet.tourna-tac.durability', (db) => (grip(db, 'Tac').durability = 55.5)],
    ['a stored rating word (derived since v1.6)', 'strings.toroline-caviar.power', (db) => (loose(str(db, 'toroline-caviar')).power = { score: 38, label: 'Low-Med' })],
    ['a stored gut rating word', 'gutHybrids.gh-regna-1.power', (db) => (loose(gutOf(db, 'regna')).power = { score: 88, label: 'Very High' })],
    ['a colour that is not hex', 'brandsStrings.toroline.accent', (db) => (db.brandsStrings.toroline!.accent = 'gold')],
    ['an id that is not kebab-case', 'strings.Toroline Caviar.id', (db) => (str(db, 'toroline-caviar').id = 'Toroline Caviar')],
    ['an unknown grip type', 'grips.tourna.wet.tourna-tac', (db) => (loose(grip(db, 'Tac')).gripType = 'hybrid')],
    ['a tag label with no colour', 'strings.toroline-caviar.feelTags.', (db) => (str(db, 'toroline-caviar').feelTags as string[]).push('Zingy')],
    ['a grip tag on a string', 'strings.toroline-caviar.feelTags.', (db) => (str(db, 'toroline-caviar').feelTags as string[]).push('Tacky')],
    ['a string tag on a grip', 'grips.tourna.wet.tourna-tac.feelTags.1', (db) => (grip(db, 'Tac').feelTags as string[]).push('Lively')],
    ['a stored tag colour (from the table since v1.4)', 'strings.toroline-caviar.feelTags.0', (db) => (loose(str(db, 'toroline-caviar')).feelTags = [{ label: 'Crisp', variant: 'crisp' }])],
    ['a gut pairing with an unknown config', 'gutHybrids.gh-regna-1.config', (db) => (loose(gutOf(db, 'regna')).config = 'gut-both')],
    ['a tension kind the item cannot take', 'pairings.toroline-k-pop/regna.tension', (db) => (loose(pairing(db, 'toroline-k-pop', 'regna')).tension = { kind: 'range', minKg: 22, maxKg: 24 })],
    ['a tension written as text', 'pairings.toroline-caviar/regna.tension', (db) => (loose(pairing(db, 'toroline-caviar', 'regna')).tension = '22–24')],
    ['a tension outside 5–40 kg', 'pairings.toroline-caviar/regna.tension', (db) => (pairing(db, 'toroline-caviar', 'regna').tension = { kind: 'max', maxKg: 60 })],
    ['a head size written as text', 'racquets.regna.headSizeSqIn', (db) => (loose(db.racquets[0]!).headSizeSqIn = '100 sq in')],
    ['a pattern written as text', 'racquets.regna.pattern', (db) => (loose(db.racquets[0]!).pattern = '16×19')],
    ['a stored racquet label (derived since v0.997)', 'racquets.regna', (db) => (loose(db.racquets[0]!).label = 'Yonex Regna 100')],
    ['an unknown stiffness band', 'strings.toroline-vamos.stiffness', (db) => (loose(str(db, 'toroline-vamos').stiffness).band = 'Stiffish')],
    ['"Med" (folded into "Medium" in v1.1)', 'strings.toroline-vamos.stiffness', (db) => (loose(str(db, 'toroline-vamos').stiffness).band = 'Med')],
    ['a stored band beside a figure (derived since v1.1)', 'strings.toroline-caviar.stiffness', (db) => (loose(str(db, 'toroline-caviar').stiffness).band = 'Med-Firm')],
    ['no figure and no band', 'strings.toroline-vamos.stiffness', (db) => delete loose(str(db, 'toroline-vamos').stiffness).band],
    ['a stored Firm token (derived since v1.1)', 'strings.toroline-caviar.feelAttr', (db) => (str(db, 'toroline-caviar').feelAttr = 'crisp,firm')],
    ['a stiffness figure written as text', 'strings.toroline-caviar.stiffness', (db) => (loose(str(db, 'toroline-caviar').stiffness.figure!).kgPerMm = '1.00')],
    ['a stored stiffness label (derived since v0.998)', 'strings.toroline-caviar.stiffness', (db) => (loose(str(db, 'toroline-caviar').stiffness).label = 'Med-Firm · 1.00')],
    ['a disputed reading without its page', 'strings.luxilon-alu-power.stiffness', (db) => delete loose(str(db, 'luxilon-alu-power').stiffness.disputed!).pages],
    ['a figure on a hybrid', 'hybrids.toroline-k-pop.stiffness', (db) => (loose(db.hybrids[0]!.stiffness).figure = null)],
    ['a stored stiffness width (derived since v1.3)', 'strings.toroline-caviar.stiffness', (db) => (loose(str(db, 'toroline-caviar').stiffness).width = 72)],
    ['a stored hybrid stiffness width (derived since v1.3)', 'hybrids.toroline-k-pop.stiffness', (db) => (loose(db.hybrids[0]!.stiffness).width = 75)],
    ['a retrieval date that is not a month', 'strings.toroline-caviar.stiffness.figure.retrieved', (db) => (str(db, 'toroline-caviar').stiffness.figure!.retrieved = 'last year')],
    ['a grip spec as a string (structured since v1.0)', 'grips.kimony.dry.kimony-tourna.specs.0', (db) => (loose(grip(db, 'Tourna')).specs = ['Dry type', 'Made in USA'])],
    ['a grip spec without its emphasis flag', 'grips.kimony.dry.kimony-tourna.specs.1.emphasis', (db) => delete loose(grip(db, 'Tourna').specs[1]!).emphasis],
    ['a hybrid side without its link', 'hybrids.toroline-k-pop.mains.stringId', (db) => delete loose(db.hybrids[0]!.mains).stringId],
    ['copy without the gut intro', 'copy: gutIntro', (_db, copy) => delete loose(copy).gutIntro],
  ])('%s', (_name, where, mutate) => {
    const issues = schemaAfter(mutate);
    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((i) => i.includes(where))).toBe(true);
  });
});

test('a fourth racquet without notes lists exactly what it is missing', () => {
  const db = structuredClone(base.db);
  db.racquets.push({ ...db.racquets[0]!, id: 'test4', model: 'Test 4' });
  const issues = validateData(db, base.copy, base.css);
  const missing = issues.filter((i) => i.rule === 'notes-present');
  expect(missing).toHaveLength(72 + 10);
  expect(missing[0]!.where).toBe('toroline-o-toro-tour/test4');
  expect(issues.filter((i) => i.rule === 'pairings-complete')).toHaveLength(82);
});
