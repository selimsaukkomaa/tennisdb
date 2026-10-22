// The extracted data must be the v0.990 data, unchanged.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { assembleDb, copy } from '../../src/core/db';

const legacyHtml = readFileSync(
  fileURLToPath(new URL('../../legacy/tennis_equipmentdb_v0_990.html', import.meta.url)),
  'utf8',
);
const legacyJson = legacyHtml.match(
  /<script id="tennis-data" type="application\/json">([\s\S]*?)<\/script>/,
)![1]!;

describe('data/ round trip against legacy v0.990', () => {
  test('reassembled TENNIS_DB is byte-identical to the embedded blob', () => {
    expect(JSON.stringify(assembleDb())).toBe(legacyJson);
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
