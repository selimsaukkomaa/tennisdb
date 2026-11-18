// The data must still hold exactly the v0.990 data. Since v0.995 it is stored differently
// (pairings.json, numeric tensions, gut pairings as a list), so it is converted back to the
// v0.990 shape, tensions printed by the app's own tensionLabel, and compared value for value:
// every key and every value, arrays in order. (Until v0.994 this was a byte comparison. Key
// order inside a record can no longer match, because v0.990 put perRacquet mid-record in some
// records, and key order carries no meaning in JSON.)
//
// Since v1.1 the stiffness labels and Firm/Soft chips are derived by a rule that moves 33 labels
// and 8 chips. The blob is compared with that declared change applied to it, by the same code
// that patches the legacy page in the parity suite (V0990_STIFFNESS_RULE), so everything else is
// still checked value for value. v1.2's edits to the stiffness words in 23 texts and 14 hybrid
// side labels are applied the same way (V0990_TEXT_EDITS, patch G).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { assembleDb, copy } from '../../src/core/db';
import { racquetLabel } from '../../src/core/labels';
import { tensionLabel } from '../../src/core/pairings';
import { ratingBar, type Rating } from '../../src/core/ratings';
import type { GutPairing, Hybrid, TennisDb } from '../../src/core/types';
import { feelTokens, stiffnessBar } from '../../src/core/stiffness';
import { specHtml } from '../../src/ui/tables';
import { STIFFNESS_WORD_EDITS } from '../../scripts/stiffness-words';
import { V0990_STIFFNESS_RULE, V0990_TEXT_EDITS } from '../visual/legacy-fixes';

const legacyHtml = readFileSync(
  fileURLToPath(new URL('../../legacy/tennis_equipmentdb_v0_990.html', import.meta.url)),
  'utf8',
);
const legacyJson = legacyHtml.match(
  /<script id="tennis-data" type="application\/json">([\s\S]*?)<\/script>/,
)![1]!;

/** v0.999 stores a rating as { score, label }; v0.990 had the bar, { label, width }. */
function withBars<T extends object>(rec: T, fields: readonly string[]): T {
  const copy = { ...rec } as Record<string, unknown>;
  for (const field of fields) {
    const rating = copy[field] as Rating | null | undefined;
    if (rating) copy[field] = ratingBar(rating);
  }
  return copy as T;
}

/** TENNIS_DB as v0.990 stored it: perRacquet inside each item, gut pairings keyed by racquet. */
function toV0990(db: TennisDb): unknown {
  const { pairings, ...rest } = db;
  const perRacquet = (itemId: string) =>
    Object.fromEntries(
      pairings
        .filter((p) => p.itemId === itemId)
        .map((p) => [p.racquetId, { tension: tensionLabel(p.tension), note: p.note }]),
    );
  // v0.996 linked each hybrid side to its string; v0.990 had only the name.
  const withoutLink = (side: Hybrid['mains']) => {
    const copy: Partial<Hybrid['mains']> = { ...side };
    delete copy.stringId;
    return copy;
  };
  type V0990GutPairing = Omit<GutPairing, 'racquetId' | 'tension'> & { tension: string };
  const gut: Record<string, V0990GutPairing[]> = {};
  for (const { racquetId, ...p } of db.gutHybrids) {
    (gut[racquetId] ??= []).push({
      ...withBars(p, ['power', 'spin', 'comfort', 'gutProtection']),
      tension: tensionLabel(p.tension),
    });
  }
  return {
    ...rest,
    // v0.997 stores head size and pattern as values and derives the label.
    racquets: db.racquets.map((r) => ({
      id: r.id,
      brand: r.brand,
      model: r.model,
      headSize: `${r.headSizeSqIn} sq in`,
      pattern: `${r.pattern.mains}×${r.pattern.crosses}`,
      ra: r.ra,
      label: racquetLabel(r),
    })),
    // v0.998 stores stiffness as a figure (v1.1: the band derived from it); v0.990 had the
    // label. v1.1 derives Firm/Soft from the band; v0.990 stored them with the other tokens.
    strings: db.strings.map((s) => ({
      ...withBars(s, ['power', 'spin', 'control', 'comfort']),
      feelAttr: feelTokens(s),
      stiffness: stiffnessBar(s.stiffness),
      perRacquet: perRacquet(s.id),
    })),
    hybrids: db.hybrids.map((h) => ({
      ...withBars(h, ['power', 'spin']),
      feelAttr: feelTokens(h),
      stiffness: stiffnessBar(h.stiffness),
      mains: withoutLink(h.mains),
      crosses: withoutLink(h.crosses),
      perRacquet: perRacquet(h.id),
    })),
    grips: Object.fromEntries(
      Object.entries(db.grips).map(([brand, byType]) => [
        brand,
        Object.fromEntries(
          Object.entries(byType).map(([type, list]) => [
            type,
            list.map((g) => ({
              ...withBars(g, ['tackiness', 'absorption', 'durability']),
              // v1.0 stores a spec as { text, emphasis }; v0.990 had the markup the page draws.
              specs: g.specs.map((s) => specHtml(s).value),
            })),
          ]),
        ),
      ]),
    ),
    gutHybrids: gut,
  };
}

/**
 * The v0.990 blob with the declared changes applied: v1.1's stiffness rule (33 labels, 8 chips)
 * and v1.2's stiffness words (23 texts, 14 hybrid side labels).
 */
const applyStiffnessRule = new Function(`return ${V0990_STIFFNESS_RULE}`)() as (db: unknown) => unknown;
const applyTextEdits = new Function(`return ${V0990_TEXT_EDITS}`)() as (
  db: unknown,
  edits: typeof STIFFNESS_WORD_EDITS,
) => unknown[];
const expected = (): unknown => {
  const db = applyStiffnessRule(JSON.parse(legacyJson));
  expect(applyTextEdits(db, STIFFNESS_WORD_EDITS)).toHaveLength(37);
  return db;
};

describe('data/ against legacy v0.990', () => {
  test('converted back to the v0.990 shape, it equals the embedded blob with the declared moves', () => {
    expect(toV0990(assembleDb())).toStrictEqual(expected());
  });

  test('and serialises to the same length (no character lost or added)', () => {
    expect(JSON.stringify(toV0990(assembleDb())).length).toBe(JSON.stringify(expected()).length);
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
