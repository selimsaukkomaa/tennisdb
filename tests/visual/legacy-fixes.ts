// Declared differences from legacy v0.990 since v0.992, applied to the legacy page before every
// comparison so the rest of each view is still checked pixel for pixel and node for node.
// Each patch reproduces one change (listed in CHANGELOG.md), through legacy's own functions
// where it can:
//   A. grip filters cover every brand: getGripBrandSections returns all three sections, and
//      Tourna gets the filter header Kimony and Yonex have, in its brand colour;
//   B. one string filter state for every racquet: each applyFilters pass runs legacy's own
//      pass once per racquet, the active one last;
//   C. the palette's clear button shows while the field has text, and the browser's own is
//      hidden. Legacy's handlers set an inline display the app no longer uses, so it is removed;
//   D. v0.993's rename: the topbar wordmark reads "strung" in heavy DM Sans with a blue line
//      under it, instead of EQUIP + a dimmed DB in Space Mono. Weight 800 comes from the same
//      Google Fonts file the tests already route to the bundled copy.
//   E. v0.998: the notes column is headed "Notes" in the string and hybrid tables (v0.990:
//      "Notes for Your Setup", 24 headers) and in compare (v0.990: "Note"). Compare redraws its
//      table on every change, so that header is renamed whenever it appears.
//   F. v1.1: stiffness bands by D2's thresholds on the figure (docs/phase-2-data-model.md), "Med"
//      folded into "Medium", and the Firm/Soft chip following the band: 33 labels and 8 chips
//      move. V0990_STIFFNESS_RULE applies it to legacy's own data, working from its labels, not
//      from the app's code; the patch then redraws the label cells and data-feel of the rows
//      already on the page. Compare reads the data, so it follows.
//   G. v1.2: the stiffness words in 23 texts and 14 hybrid side labels
//      (scripts/stiffness-words.ts: STIFFNESS_WORD_EDITS). V0990_TEXT_EDITS applies the same
//      edits to legacy's data, each text found exactly once; the patch then swaps the old text
//      for the new in the cells already on the page: a feel text and a side label in each
//      racquet's row, a note in its racquet's row.
//   H. v1.3: stiffness bars on one scale for every brand (0.55 kg/mm at 10%, 1.15 at 100%, at
//      least 4%; without a figure, and for hybrids, at the band's midpoint), 78 bars, and the
//      footers' sentence about bars (OLD_BAR_SENTENCE -> NEW_BAR_SENTENCE in
//      scripts/derive-stiffness-widths.ts), 15 footers on the page. V0990_STIFFNESS_SCALE works
//      from legacy's labels after F; the patch redraws the bars already on the page.
//   I. v1.4: one colour per grip tag label; five grip tags take their label's majority colour
//      (scripts/derive-tag-colours.ts: GRIP_TAG_CHANGES), in legacy's data and on the page.
//   J. v1.5: the stiffness re-check against Racketpedia changes five labels (V0990_RECHECK_LABELS:
//      4G 1.18, Barb Wire 0.90, Confidential Soft 0.85, Vanquish 0.55–0.65 and Hyper-G Round
//      measured, no longer "~"); V0990_STIFFNESS_SCALE redraws their bars (4 change), and the
//      cells already on the page follow. Its two text corrections (scripts/recheck-stiffness.ts:
//      RECHECK_TEXT_EDITS) go through G with v1.2's.
//   K. v1.6: every rating's word derived from its score on two scales (src/core/ratings.ts):
//      V0990_RATING_WORDS sets legacy's words from its own bar widths (137 change), and the
//      words beside the rating bars already on the page follow (310: strings and hybrids in three
//      racquets, grips once). Compare and the gut table draw from the data.
// The CSS repeats the rules in src/styles/additions.css; a change there must change it here.
import type { Page } from '@playwright/test';
import { NEW_BAR_SENTENCE, OLD_BAR_SENTENCE } from '../../scripts/derive-stiffness-widths';
import { GRIP_TAG_CHANGES } from '../../scripts/derive-tag-colours';
import { RECHECK_TEXT_EDITS } from '../../scripts/recheck-stiffness';
import { STIFFNESS_WORD_EDITS } from '../../scripts/stiffness-words';

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

const LEGACY_FIXES_JS = String.raw`(() => {
  // F (first, so every other patch sees the new data)
  (${V0990_STIFFNESS_RULE})(window.TENNIS_DB);
  const stringsById = new Map(window.TENNIS_DB.strings.map((s) => [s.id, s]));
  let redrawn = 0;
  for (const tr of document.querySelectorAll('tr[data-type="string"][data-id]')) {
    const s = stringsById.get(tr.dataset.id);
    const label = tr.querySelector('.bar-fill.stiff').closest('.bar-cell').querySelector('.bar-label');
    if (label.textContent !== s.stiffness.label) {
      label.textContent = s.stiffness.label;
      redrawn++;
    }
    tr.dataset.feel = s.feelAttr;
  }
  if (redrawn !== 99) throw new Error('expected 99 stiffness labels redrawn (33 x 3 racquets), got ' + redrawn);

  // H (the bars follow F's labels)
  (${V0990_STIFFNESS_SCALE})(window.TENNIS_DB);
  const rowsById = new Map([...window.TENNIS_DB.strings, ...window.TENNIS_DB.hybrids].map((r) => [r.id, r]));
  let resized = 0;
  for (const tr of document.querySelectorAll('tr[data-id]')) {
    const r = rowsById.get(tr.dataset.id);
    const fill = r && tr.querySelector('.bar-fill.stiff');
    if (!fill) continue;
    const style = 'width:' + r.stiffness.width + '%';
    if (fill.getAttribute('style') !== style) {
      fill.setAttribute('style', style);
      resized++;
    }
  }
  if (resized !== 234) throw new Error('expected 234 stiffness bars redrawn (78 x 3 racquets), got ' + resized);
  const brandNames = Object.values(window.TENNIS_DB.brandsStrings).map((b) => b.name);
  const oldSentence = ${OLD_BAR_SENTENCE.toString()};
  const newSentence = ${NEW_BAR_SENTENCE.toString()};
  let footers = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const name of brandNames) {
      if (node.nodeValue.includes(oldSentence(name))) {
        node.nodeValue = node.nodeValue.replace(oldSentence(name), () => newSentence(name));
        footers++;
      }
    }
  }
  if (footers !== 15) throw new Error('expected 15 footers (5 brands x 3 racquets), got ' + footers);

  // J (after H, so the scale redraws exactly the re-checked bars)
  for (const [id, was, now] of ${JSON.stringify(V0990_RECHECK_LABELS)}) {
    const s = window.TENNIS_DB.strings.find((x) => x.id === id);
    if (s.stiffness.label !== was) throw new Error('patch J: ' + id + ' reads ' + s.stiffness.label);
    s.stiffness.label = now;
  }
  (${V0990_STIFFNESS_SCALE})(window.TENNIS_DB, 4);
  let rechecked = 0;
  for (const [id] of ${JSON.stringify(V0990_RECHECK_LABELS)}) {
    const s = window.TENNIS_DB.strings.find((x) => x.id === id);
    for (const tr of document.querySelectorAll('tr[data-type="string"][data-id="' + id + '"]')) {
      const fill = tr.querySelector('.bar-fill.stiff');
      fill.closest('.bar-cell').querySelector('.bar-label').textContent = s.stiffness.label;
      fill.setAttribute('style', 'width:' + s.stiffness.width + '%');
      rechecked++;
    }
  }
  if (rechecked !== 15) throw new Error('expected 15 re-checked rows (5 x 3 racquets), got ' + rechecked);

  // K
  const words = (${V0990_RATING_WORDS})(window.TENNIS_DB);
  if (words !== 137) throw new Error('expected 137 rating words to change, got ' + words);
  const ratingWord = ${V0990_RATING_SCALES};
  let reworded = 0;
  for (const fill of document.querySelectorAll('.bar-fill')) {
    const axis = [...fill.classList].find((c) => c !== 'bar-fill' && c !== 'stiff');
    if (!axis) continue;
    const label = fill.closest('.bar-cell').querySelector('.bar-label');
    const w = ratingWord(axis, parseFloat(fill.style.width));
    if (label.textContent !== w) {
      label.textContent = w;
      reworded++;
    }
  }
  if (reworded !== 310) throw new Error('expected 310 rating words redrawn, got ' + reworded);

  // I
  const allGrips = Object.values(window.TENNIS_DB.grips).flatMap((t) => Object.values(t).flat());
  let recoloured = 0;
  for (const c of ${JSON.stringify(GRIP_TAG_CHANGES)}) {
    const tag = allGrips.find((g) => g.id === c.gripId).feelTags.find((t) => t.label === c.label);
    if (!tag || tag.variant !== c.from) throw new Error('patch I: ' + c.gripId + ' has no ' + c.from + ' ' + c.label);
    tag.variant = c.to;
    for (const span of document.querySelectorAll('tr[data-id="' + c.gripId + '"] .tag.tag-' + c.from)) {
      if (span.textContent === c.label) {
        span.className = 'tag tag-' + c.to;
        recoloured++;
      }
    }
  }
  if (recoloured !== 5) throw new Error('expected 5 grip tags recoloured, got ' + recoloured);

  // G
  const swapText = (root, from, to) => {
    let n = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.nodeValue === from) {
        node.nodeValue = to;
        n++;
      }
    }
    return n;
  };
  const changes = (${V0990_TEXT_EDITS})(window.TENNIS_DB, ${JSON.stringify(V0990_ALL_TEXT_EDITS)});
  if (changes.length !== 39) throw new Error('expected 39 changed texts and labels, got ' + changes.length);
  for (const c of changes) {
    let n = 0;
    let expected = 3;
    if (c.field === 'note') {
      expected = 1;
      for (const tr of document.querySelectorAll('#' + c.racquet + '-content tr[data-id="' + c.id + '"]'))
        n += swapText(tr.querySelector('td.notes'), c.before, c.after);
    } else if (c.field === 'mains' || c.field === 'crosses') {
      for (const tr of document.querySelectorAll('tr[data-type="hybrid"][data-id="' + c.id + '"]'))
        n += swapText(tr.children[c.field === 'mains' ? 1 : 2], c.before, c.after);
    } else {
      // legacy writes the feel text as a text node, the expand after a space in its own span
      const pad = c.field === 'feelExpand' ? ' ' : '';
      for (const tr of document.querySelectorAll('tr[data-type="string"][data-id="' + c.id + '"]'))
        n += swapText(tr, pad + c.before, pad + c.after);
    }
    if (n !== expected)
      throw new Error('patch G: ' + c.id + ' ' + c.field + ' swapped ' + n + ' times, expected ' + expected);
  }

  const css = document.createElement('style');
  css.textContent = [
    '.gfilter-brand-header.gfilter-header-tourna { color: #1e40af; border-left-color: #1e40af; }',
    '#search-input::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }',
    '#search-clear.search-clear-visible { display: block; }',
    '#palette #search-clear { position: relative; top: auto; right: auto; transform: none;' +
      ' width: 26px; padding: 4px 0; text-align: center; margin: 0 4px 0 -38px; }',
    "@font-face { font-family: 'DM Sans'; font-style: normal; font-weight: 800;" +
      " src: url('https://fonts.gstatic.com/s/dmsans/v17/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2')" +
      " format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6," +
      " U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193," +
      " U+2212, U+2215, U+FEFF, U+FFFD; }",
    ".topbar-mark { font-family: 'DM Sans', sans-serif; font-weight: 800; font-size: 1.15rem;" +
      " letter-spacing: -0.04em; line-height: 1; }",
    ".topbar-mark::after { content: ''; display: block; height: 2px; margin: 2px 1px 0;" +
      " border-radius: 2px; background: #1f4fff; }",
  ].join('\n');
  document.head.appendChild(css);

  // D
  document.querySelector('.topbar-mark').textContent = 'strung';

  // E
  const setupHeads = [...document.querySelectorAll('th')].filter(
    (th) => th.textContent === 'Notes for Your Setup',
  );
  if (setupHeads.length !== 24) throw new Error('expected 24 notes headers, got ' + setupHeads.length);
  for (const th of setupHeads) th.textContent = 'Notes';
  const renameCompareNote = () => {
    for (const th of document.querySelectorAll('tr.cmp-row-note th.cmp-attr-head')) {
      if (th.textContent === 'Note') th.textContent = 'Notes';
    }
  };
  new MutationObserver(renameCompareNote).observe(document.getElementById('compare-modal'), {
    childList: true,
    subtree: true,
  });

  // A
  const tourna = document.getElementById('grip-tourna-section');
  const header = document.createElement('div');
  header.className = 'gfilter-brand-header gfilter-header-tourna';
  header.id = 'gfh-tourna';
  header.textContent = 'Tourna';
  tourna.before(header, document.createTextNode('\n'));
  window.getGripBrandSections = () =>
    ['kimony', 'yonex', 'tourna'].map((b) => document.getElementById('grip-' + b + '-section'));

  // B
  const activeRacquet = window.getActiveRacquet;
  const applyOne = window.applyFilters;
  window.applyFilters = function () {
    const current = activeRacquet();
    for (const id of ['regna', 'percept', 'headpt630']) {
      if (id === current) continue;
      window.getActiveRacquet = () => id;
      applyOne();
    }
    window.getActiveRacquet = activeRacquet;
    return applyOne();
  };

  // C
  const input = document.getElementById('search-input');
  const clear = document.getElementById('search-clear');
  const sync = () => {
    clear.removeAttribute('style');
    clear.classList.toggle('search-clear-visible', input.value.length > 0);
  };
  input.addEventListener('input', sync);
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') sync(); });
  clear.addEventListener('click', sync);

  // D's weight is only requested once the page lays the wordmark out again; load it now so the
  // caller can wait for it (the harness waited for fonts before the patch).
  return document.fonts.load("800 16px 'DM Sans'", 'strung');
})()`;

export async function applyLegacyFixes(page: Page): Promise<void> {
  await page.evaluate(LEGACY_FIXES_JS);
}
