// The data must still hold exactly the v0.990 data. Since v0.995 it is stored differently
// (pairings.json, numeric tensions, gut pairings as a list), so it is converted back to the
// v0.990 shape, tensions printed by the app's own tensionLabel, and compared value for value:
// every key and every value, arrays in order. (Until v0.994 this was a byte comparison. Key
// order inside a record can no longer match, because v0.990 put perRacquet mid-record in some
// records, and key order carries no meaning in JSON.)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { assembleDb, copy } from '../../src/core/db';
import { tensionLabel } from '../../src/core/pairings';
import type { GutPairing, TennisDb } from '../../src/core/types';

const legacyHtml = readFileSync(
  fileURLToPath(new URL('../../legacy/tennis_equipmentdb_v0_990.html', import.meta.url)),
  'utf8',
);
const legacyJson = legacyHtml.match(
  /<script id="tennis-data" type="application\/json">([\s\S]*?)<\/script>/,
)![1]!;

/** TENNIS_DB as v0.990 stored it: perRacquet inside each item, gut pairings keyed by racquet. */
function toV0990(db: TennisDb): unknown {
  const { pairings, ...rest } = db;
  const perRacquet = (itemId: string) =>
    Object.fromEntries(
      pairings
        .filter((p) => p.itemId === itemId)
        .map((p) => [p.racquetId, { tension: tensionLabel(p.tension), note: p.note }]),
    );
  type V0990GutPairing = Omit<GutPairing, 'racquetId' | 'tension'> & { tension: string };
  const gut: Record<string, V0990GutPairing[]> = {};
  for (const { racquetId, ...p } of db.gutHybrids) {
    (gut[racquetId] ??= []).push({ ...p, tension: tensionLabel(p.tension) });
  }
  return {
    ...rest,
    strings: db.strings.map((s) => ({ ...s, perRacquet: perRacquet(s.id) })),
    hybrids: db.hybrids.map((h) => ({ ...h, perRacquet: perRacquet(h.id) })),
    gutHybrids: gut,
  };
}

describe('data/ against legacy v0.990', () => {
  test('converted back to the v0.990 shape, it equals the embedded blob', () => {
    expect(toV0990(assembleDb())).toStrictEqual(JSON.parse(legacyJson));
  });

  test('and serialises to the same length (no character lost or added)', () => {
    expect(JSON.stringify(toV0990(assembleDb())).length).toBe(legacyJson.length);
  });

  test('assembleDb returns independent copies', () => {
    const a = assembleDb();
    a.strings[0]!.name = 'changed';
    expect(assembleDb().strings[0]!.name).toBe('O-Toro Tour');
  });
});

describe('content/copy.json against legacy v0.990', () => {
  const footers = Object.values(copy.brandFooters).flatMap((f) => [
    f.default,
    ...Object.values(f.byRacquet ?? {}),
  ]);
  const cards = Object.values(copy.hybridCards).flatMap((c) => [c.heading, c.intro]);
  const legendText = [...copy.legends.strings, ...copy.legends.grips].flatMap((l) => [
    l.swatch,
    l.label,
  ]);

  test.each([...footers, ...cards, ...Object.values(copy.gripAbout), ...legendText])(
    'appears verbatim in the legacy source: %s',
    (text) => {
      expect(legacyHtml.includes(text)).toBe(true);
    },
  );

  test('gut intro matches the concatenated literals in the tennis-gut script', () => {
    const literals = legacyHtml
      .match(/'<div class="gut-intro-blurb">'([\s\S]*?)\+\s*'<\/div>'/)![1]!
      .match(/'((?:[^'\\]|\\.)*)'/g)!
      .map((s) => s.slice(1, -1))
      .join('');
    expect(copy.gutIntro).toBe(literals);
  });
});
