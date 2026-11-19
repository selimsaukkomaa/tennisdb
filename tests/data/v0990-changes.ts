// The declared changes to the data since v0.990, applied to a v0.990 TENNIS_DB so that
// tests/data/legacy-roundtrip.test.ts can still compare the data with v0.990 value for value.
// Until v1.7 the same functions also patched the legacy page for the pixel and DOM parity suite
// (retired with the redesign); they run as JavaScript source, so they stay strings.
import { RECHECK_TEXT_EDITS } from "../../scripts/recheck-stiffness";
import { STIFFNESS_WORD_EDITS } from "../../scripts/stiffness-words";

/**
 * v1.1's stiffness rule applied to a v0.990 TENNIS_DB, in place, as JavaScript source: the
 * legacy page runs it (patch F) and tests/data/legacy-roundtrip.test.ts runs it on the embedded
 * blob. Throws unless exactly the declared 33 labels and 8 chips move.
 */
export const V0990_STIFFNESS_RULE = String.raw`((db) => {
  const bandFor = (m) =>
    m < 700 ? 'Very Soft' : m < 850 ? 'Soft' : m < 920 ? 'Med-Soft' : m < 980 ? 'Medium'
      : m < 1050 ? 'Med-Firm' : m < 1100 ? 'Firm' : 'Very Firm';
  const FIRM = ['Med-Firm', 'Firm', 'Very Firm'];
  let labels = 0;
  let chips = 0;
  for (const s of db.strings) {
    const [stored, figure] = s.stiffness.label.split(' · ');
    let band = stored === 'Med' ? 'Medium' : stored;
    if (figure) {
      const n = figure.replace('~', '').split('–').map(Number);
      band = bandFor(Math.round((n.length === 2 ? (n[0] + n[1]) / 2 : n[0]) * 1000));
    }
    const label = figure ? band + ' · ' + figure : band;
    const chip = FIRM.includes(band) ? 'firm' : 'soft';
    const feel = s.feelAttr.split(',').map((t) => (t === 'firm' || t === 'soft' ? chip : t)).join(',');
    if (label !== s.stiffness.label) labels++;
    if (feel !== s.feelAttr) chips++;
    s.stiffness.label = label;
    s.feelAttr = feel;
  }
  if (labels !== 33 || chips !== 8)
    throw new Error('stiffness rule: expected 33 labels and 8 chips, got ' + labels + ' and ' + chips);
  return db;
})`;

/**
 * v1.2's text edits applied to a v0.990 TENNIS_DB, in place, as JavaScript source: patch G runs
 * it on the legacy page and the round-trip test on the embedded blob. Each edit's text must
 * occur exactly once in its field. Returns each changed field with its old and new text.
 */
export const V0990_TEXT_EDITS = String.raw`((db, edits) => {
  const changes = new Map();
  for (const e of edits) {
    const item = db.strings.find((s) => s.id === e.id) || db.hybrids.find((h) => h.id === e.id);
    const holder =
      e.field === 'note' ? item.perRacquet[e.racquet]
        : e.field === 'mains' || e.field === 'crosses' ? item[e.field]
        : item;
    const key = e.field === 'note' ? 'note' : e.field === 'mains' || e.field === 'crosses' ? 'shapeFeelLabel' : e.field;
    const n = holder[key].split(e.from).length - 1;
    if (n !== 1) throw new Error('text edit ' + e.id + ' ' + e.field + ': "' + e.from + '" occurs ' + n + ' times');
    const k = e.id + '|' + e.field + '|' + (e.racquet || '');
    if (!changes.has(k)) changes.set(k, { id: e.id, field: e.field, racquet: e.racquet, before: holder[key] });
    holder[key] = holder[key].replace(e.from, () => e.to);
    changes.get(k).after = holder[key];
  }
  return [...changes.values()];
})`;

/**
 * v1.3's stiffness scale applied to a v0.990 TENNIS_DB whose labels v1.1's rule already set, in
 * place, as JavaScript source: patch H runs it on the legacy page and the round-trip test on the
 * embedded blob. Throws unless exactly 78 bars change (68 strings, 10 hybrids).
 */
export const V0990_STIFFNESS_SCALE = String.raw`((db, expected = 78) => {
  const MIDPOINT = { 'Very Soft': 650, Soft: 780, 'Med-Soft': 880, Medium: 950, 'Med-Firm': 1010, Firm: 1070, 'Very Firm': 1120 };
  const widthOf = (label) => {
    const [band, figure] = label.split(' · ');
    let m = MIDPOINT[band];
    if (figure) {
      const n = figure.replace('~', '').split('–').map(Number);
      m = Math.round((n.length === 2 ? (n[0] + n[1]) / 2 : n[0]) * 1000);
    }
    return Math.min(100, Math.max(4, Math.round((200 + 3 * (m - 550)) / 20)));
  };
  let changed = 0;
  for (const r of [...db.strings, ...db.hybrids]) {
    const w = widthOf(r.stiffness.label);
    if (w !== r.stiffness.width) changed++;
    r.stiffness.width = w;
  }
  if (changed !== expected)
    throw new Error('stiffness scale: expected ' + expected + ' bars to change, got ' + changed);
  return db;
})`;

/** v1.5's declared label changes (patch J), as v0.990 labels after F: [id, was, now]. */
export const V0990_RECHECK_LABELS: readonly [string, string, string][] = [
  ['luxilon-4g', 'Very Firm · 1.10', 'Very Firm · 1.18'],
  ['solinco-barb-wire', 'Medium · ~0.95', 'Med-Soft · 0.90'],
  ['solinco-confidential-soft', 'Medium', 'Med-Soft · 0.85'],
  ['solinco-vanquish-multi', 'Soft', 'Very Soft · 0.55–0.65'],
  ['solinco-hyper-g-round', 'Medium · ~0.95', 'Medium · 0.95'],
];

/** All text edits applied to legacy since v1.2: the stiffness words, then the re-check's. */
export const V0990_ALL_TEXT_EDITS = [...STIFFNESS_WORD_EDITS, ...RECHECK_TEXT_EDITS];

/**
 * v1.6's rating words, derived from a v0.990 TENNIS_DB's own scores (the bar widths), in place,
 * as JavaScript source: patch K runs it on the legacy page and the round-trip test on the blob.
 * Returns how many words changed (137).
 */
export const V0990_RATING_SCALES = String.raw`(() => {
  const AMOUNT = [['Low', 0], ['Low-Med', 35], ['Medium', 45], ['Med-High', 60], ['High', 75], ['Very High', 85], ['Elite', 95]];
  const QUALITY = [['Low', 0], ['Moderate', 45], ['Good', 60], ['Very Good', 78], ['Excellent', 88], ['Outstanding', 95]];
  const SCALE = { power: AMOUNT, spin: AMOUNT, tackiness: AMOUNT, absorption: AMOUNT, gutProtection: AMOUNT, 'gut-protection': AMOUNT, control: QUALITY, comfort: QUALITY, durability: QUALITY };
  return (axis, score) => [...SCALE[axis]].reverse().find(([, from]) => score >= from)[0];
})()`;

export const V0990_RATING_WORDS = String.raw`((db) => {
  const word = ${V0990_RATING_SCALES};
  let changed = 0;
  const set = (rows, fields) => {
    for (const r of rows) for (const f of fields) {
      const bar = r[f];
      if (!bar) continue;
      const w = word(f, bar.width);
      if (w !== bar.label) changed++;
      bar.label = w;
    }
  };
  set(db.strings, ['power', 'spin', 'control', 'comfort']);
  set(db.hybrids, ['power', 'spin']);
  set(Object.values(db.grips).flatMap((t) => Object.values(t).flat()), ['tackiness', 'absorption', 'durability']);
  set(Object.values(db.gutHybrids).flat(), ['power', 'spin', 'comfort', 'gutProtection']);
  return changed;
})`;
