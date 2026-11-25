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
// side labels are applied the same way (V0990_TEXT_EDITS, patch G), and v1.3's stiffness scale
// (V0990_STIFFNESS_SCALE, patch H), which also changes one sentence in the brand footers.
// v1.8's "racket" for "racquet" (scripts/racket-spelling.ts) changes one note, four grip texts
// and the Yonex About box; each is applied here, or undone on the copy, phrase by phrase.
// v1.11 corrects the Regna 100's RA from 64 to 65 (scripts/regna-ra.ts): the figure, and "64 RA"
// in the 67 Regna notes that cite it, applied after the other text edits.
// v1.13 adds the Pure Drive 2025, a racket v0.990 never had: it is set aside with its 82
// pairings and 7 gut pairings before the conversion (ADDED_RACQUETS), and nothing else is.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';
import { assembleDb, copy } from '../../src/core/db';
import { racquetLabel } from '../../src/core/labels';
import { tensionLabel } from '../../src/core/pairings';
import { ratingBar, type RatingAxis } from '../../src/core/ratings';
import type { GutPairing, Hybrid, TennisDb } from '../../src/core/types';
import { feelTokens, stiffnessBar } from '../../src/core/stiffness';
import { GRIP_TAG_COLOURS, STRING_TAG_COLOURS } from '../../src/core/tags';
import { specHtml } from '../../src/ui/tables';
import { GRIP_TAG_CHANGES } from '../../scripts/derive-tag-colours';
import { RACKET_ABOUT_EDITS, RACKET_GRIP_EDITS } from '../../scripts/racket-spelling';
import { REGNA_RA } from '../../scripts/regna-ra';
import { STIFFNESS_WORD_EDITS } from '../../scripts/stiffness-words';
import { NEW_BAR_SENTENCE, OLD_BAR_SENTENCE } from '../../scripts/derive-stiffness-widths';
import {
  V0990_ALL_TEXT_EDITS,
  V0990_RATING_WORDS,
  V0990_RECHECK_LABELS,
  V0990_STIFFNESS_RULE,
  V0990_STIFFNESS_SCALE,
  V0990_TEXT_EDITS,
} from './v0990-changes';

const legacyHtml = readFileSync(
  fileURLToPath(new URL('../../legacy/tennis_equipmentdb_v0_990.html', import.meta.url)),
  'utf8',
);
const legacyJson = legacyHtml.match(
  /<script id="tennis-data" type="application\/json">([\s\S]*?)<\/script>/,
)![1]!;

/** Rackets added since v0.990, with how many pairings and gut pairings each brought. */
const ADDED_RACQUETS = [{ id: 'puredrive2025', pairings: 82, gutHybrids: 7 }] as const;

/** The data without the rackets added since v0.990; asserts each took exactly its own. */
function withoutAdded(db: TennisDb): TennisDb {
  const ids = new Set<string>(ADDED_RACQUETS.map((r) => r.id));
  for (const r of ADDED_RACQUETS) {
    expect(db.racquets.filter((x) => x.id === r.id)).toHaveLength(1);
    expect(db.pairings.filter((p) => p.racquetId === r.id)).toHaveLength(r.pairings);
    expect(db.gutHybrids.filter((g) => g.racquetId === r.id)).toHaveLength(r.gutHybrids);
  }
  return {
    ...db,
    racquets: db.racquets.filter((r) => !ids.has(r.id)),
    pairings: db.pairings.filter((p) => !ids.has(p.racquetId)),
    gutHybrids: db.gutHybrids.filter((g) => !ids.has(g.racquetId)),
  };
}

/** v1.6 stores a rating as its score (v0.999-v1.5: { score, label }); v0.990 had the bar. */
function withBars<T extends object>(rec: T, fields: readonly RatingAxis[]): T {
  const copy = { ...rec } as Record<string, unknown>;
  for (const field of fields) {
    const score = copy[field] as number | null | undefined;
    if (score !== null && score !== undefined) copy[field] = ratingBar(field, score);
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
      // v1.4 stores a tag's label; the colour comes from the table.
      feelTags: s.feelTags.map((label) => ({ label, variant: STRING_TAG_COLOURS[label] })),
      stiffness: stiffnessBar(s.stiffness),
      perRacquet: perRacquet(s.id),
    })),
    hybrids: db.hybrids.map((h) => ({
      ...withBars(h, ['power', 'spin']),
      feelAttr: feelTokens(h),
      feelTags: h.feelTags.map((label) => ({ label, variant: STRING_TAG_COLOURS[label] })),
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
              feelTags: g.feelTags.map((label) => ({ label, variant: GRIP_TAG_COLOURS[label] })),
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
 * v1.2's stiffness words (23 texts, 14 hybrid side labels), v1.3's scale (78 bars) and v1.4's
 * grip tag colours (5 tags).
 */
const applyStiffnessRule = new Function(`return ${V0990_STIFFNESS_RULE}`)() as (db: unknown) => unknown;
const applyTextEdits = new Function(`return ${V0990_TEXT_EDITS}`)() as (
  db: unknown,
  edits: typeof STIFFNESS_WORD_EDITS,
) => unknown[];
const applyStiffnessScale = new Function(`return ${V0990_STIFFNESS_SCALE}`)() as (
  db: unknown,
  expected?: number,
) => unknown;
const applyRatingWords = new Function(`return ${V0990_RATING_WORDS}`)() as (db: unknown) => number;
const expected = (): unknown => {
  const db = applyStiffnessScale(applyStiffnessRule(JSON.parse(legacyJson))) as {
    strings: { id: string; stiffness: { label: string } }[];
  };
  // v1.5: the re-check's five labels, then their bars on the scale.
  for (const [id, was, now] of V0990_RECHECK_LABELS) {
    const s = db.strings.find((x) => x.id === id)!;
    expect(s.stiffness.label).toBe(was);
    s.stiffness.label = now;
  }
  applyStiffnessScale(db, 4);
  // v1.6: every rating's word from its score (patch K).
  expect(applyRatingWords(db)).toBe(137);
  // 39 fields until v1.7; v1.8's "racket" adds Revolution's Regna note; v1.11's Regna RA adds
  // the 58 of its 67 notes that no earlier edit touched (98).
  expect(applyTextEdits(db, V0990_ALL_TEXT_EDITS)).toHaveLength(98);
  // v1.11: the Regna 100 at 65 RA (scripts/regna-ra.ts).
  const regna = (db as unknown as { racquets: { id: string; ra: number }[] }).racquets.find(
    (r) => r.id === REGNA_RA.racquet,
  )!;
  expect(regna.ra).toBe(REGNA_RA.from);
  regna.ra = REGNA_RA.to;
  // v1.4: the five grip tags that took their label's majority colour (patch I).
  type V0990Grip = { id: string; feelTags: { label: string; variant: string }[] };
  const grips = Object.values(
    (db as unknown as { grips: Record<string, Record<string, V0990Grip[]>> }).grips,
  )
    .flatMap((byType) => Object.values(byType).flat());
  for (const c of GRIP_TAG_CHANGES) {
    const tag = grips.find((g) => g.id === c.gripId)!.feelTags.find((t) => t.label === c.label)!;
    expect(tag.variant).toBe(c.from);
    tag.variant = c.to;
  }
  // v1.8: "racket" in four grip texts.
  for (const e of RACKET_GRIP_EDITS) {
    const g = grips.find((x) => x.id === e.gripId) as unknown as Record<string, string>;
    expect(g[e.field]!.split(e.from)).toHaveLength(2);
    g[e.field] = g[e.field]!.replace(e.from, () => e.to);
  }
  return db;
};

describe('data/ against legacy v0.990', () => {
  test('converted back to the v0.990 shape, it equals the embedded blob with the declared moves', () => {
    expect(toV0990(withoutAdded(assembleDb()))).toStrictEqual(expected());
  });

  test('and serialises to the same length (no character lost or added)', () => {
    expect(JSON.stringify(toV0990(withoutAdded(assembleDb()))).length).toBe(JSON.stringify(expected()).length);
  });

  test('assembleDb returns independent copies', () => {
    const a = assembleDb();
    a.strings[0]!.name = 'changed';
    expect(assembleDb().strings[0]!.name).toBe('O-Toro Tour');
  });
});

describe('content/copy.json against legacy v0.990', () => {
  // v1.3 changed one sentence in every footer; the rest must still be v0.990's, verbatim.
  const db = assembleDb();
  const footers = Object.entries(copy.brandFooters).flatMap(([brand, f]) => {
    const name = db.brandsStrings[brand]!.name;
    return [f.default, ...Object.values(f.byRacquet ?? {})].map((text) => {
      expect(text).toContain(NEW_BAR_SENTENCE(name));
      return text.replace(NEW_BAR_SENTENCE(name), () => OLD_BAR_SENTENCE(name));
    });
  });
  const cards = Object.values(copy.hybridCards).flatMap((c) => [c.heading, c.intro]);
  const legendText = [...copy.legends.strings, ...copy.legends.grips].flatMap((l) => [
    l.swatch,
    l.label,
  ]);

  // v1.8 changed "racquet" to "racket" in one About box; undone here, the rest is v0.990's.
  const about = Object.entries(copy.gripAbout).map(([brand, text]) =>
    RACKET_ABOUT_EDITS.filter((e) => e.brand === brand).reduce((t, e) => {
      expect(t.split(e.to)).toHaveLength(2);
      return t.replace(e.to, () => e.from);
    }, text),
  );

  test.each([...footers, ...cards, ...about, ...legendText])(
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
