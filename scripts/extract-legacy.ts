// One-off: split the v0.990 single-file app into data/*.json (the TENNIS_DB blob, one file per
// collection) and content/copy.json (prose that lived in markup or JS). Kept for provenance.
// Every extraction asserts its expected count. `--sample` prints a preview and writes nothing.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'legacy', 'tennis_equipmentdb_v0_990.html');
const SAMPLE = process.argv.includes('--sample');

function assertEq<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, got ${actual}`);
}

const html = readFileSync(SRC, 'utf8');

// ---------------------------------------------------------------- TENNIS_DB
const dataMatch = html.match(
  /<script id="tennis-data" type="application\/json">([\s\S]*?)<\/script>/,
);
if (!dataMatch?.[1]) throw new Error('tennis-data script not found');
const rawJson = dataMatch[1];
const db = JSON.parse(rawJson) as Record<string, unknown> & {
  version: string;
  racquets: { id: string }[];
  brandsStrings: Record<string, unknown>;
  strings: unknown[];
  hybrids: unknown[];
  grips: Record<string, Record<string, unknown[]>>;
  gutStrings: unknown[];
  gutHybrids: Record<string, unknown[]>;
};

// Collection order is the TENNIS_DB key order; src/core/db.ts reassembles in the same order.
const COLLECTIONS = [
  'racquets',
  'brandsStrings',
  'strings',
  'hybrids',
  'grips',
  'gutStrings',
  'gutHybrids',
] as const;
assertEq(Object.keys(db).join(','), ['version', ...COLLECTIONS].join(','), 'TENNIS_DB keys');
assertEq(db.version, '0.990', 'version');
assertEq(db.racquets.length, 3, 'racquets');
assertEq(Object.keys(db.brandsStrings).length, 7, 'string brands');
assertEq(db.strings.length, 72, 'strings');
assertEq(db.hybrids.length, 10, 'hybrids');
const gripCount = Object.values(db.grips).reduce(
  (n, byType) => n + Object.values(byType).reduce((m, a) => m + a.length, 0),
  0,
);
assertEq(gripCount, 35, 'grips');
assertEq(db.gutStrings.length, 2, 'gut strings');
assertEq(Object.keys(db.gutHybrids).length, 3, 'gut racquet keys');
const gutCount = Object.values(db.gutHybrids).reduce((n, a) => n + a.length, 0);
assertEq(gutCount, 21, 'gut pairings');
const racquetIds = db.racquets.map((r) => r.id);

// ---------------------------------------------------------------- copy from markup
const { document } = new JSDOM(html).window;

// Brand footers: one per brand that has one, per racquet view. A brand's text is stored once as
// `default` (the most common variant) plus per-racquet overrides where the text differs.
const footersByBrand: Record<string, Record<string, string>> = {};
let footerCount = 0;
for (const rid of racquetIds) {
  const container = document.getElementById(`${rid}-content`);
  if (!container) throw new Error(`#${rid}-content missing`);
  container.querySelectorAll('.brand-section .footer').forEach((el) => {
    const section = el.closest('.brand-section');
    const brand = section?.className.match(/\b([a-z]+)-view\b/)?.[1];
    if (!brand) throw new Error('footer outside a brand view');
    (footersByBrand[brand] ??= {})[rid] = el.innerHTML.trim();
    footerCount++;
  });
}
assertEq(footerCount, 15, 'brand footers');
const brandFooters: Record<string, { default: string; byRacquet?: Record<string, string> }> = {};
for (const [brand, byRacquet] of Object.entries(footersByBrand)) {
  assertEq(Object.keys(byRacquet).length, racquetIds.length, `footer coverage for ${brand}`);
  const tally = new Map<string, number>();
  for (const rid of racquetIds) {
    const text = byRacquet[rid]!;
    tally.set(text, (tally.get(text) ?? 0) + 1);
  }
  const def = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]![0];
  const overrides = Object.fromEntries(
    racquetIds.filter((rid) => byRacquet[rid] !== def).map((rid) => [rid, byRacquet[rid]!]),
  );
  brandFooters[brand] = Object.keys(overrides).length
    ? { default: def, byRacquet: overrides }
    : { default: def };
}

// Hybrid cards: heading + intro, identical in every racquet view.
const cards = [...document.querySelectorAll('.brand-section .card')];
assertEq(cards.length, 3, 'hybrid cards');
const hybridCards: Record<string, { heading: string; intro: string }> = {};
for (const card of cards) {
  const brand = card.closest('.brand-section')?.className.match(/\b([a-z]+)-view\b/)?.[1];
  const heading = card.querySelector('h3')?.innerHTML.trim();
  const intro = card.querySelector('p')?.innerHTML.trim();
  if (!brand || heading == null || intro == null) throw new Error('malformed hybrid card');
  const prev = hybridCards[brand];
  if (prev && (prev.heading !== heading || prev.intro !== intro)) {
    throw new Error(`hybrid card for ${brand} differs between racquets`);
  }
  hybridCards[brand] = { heading, intro };
}
assertEq(Object.keys(hybridCards).join(','), 'toroline', 'hybrid card brands');

// Grip About boxes, one per grip brand.
const aboutBoxes = [...document.querySelectorAll('#grips-content .rec-box')];
assertEq(aboutBoxes.length, 3, 'grip About boxes');
const gripAbout: Record<string, string> = {};
for (const box of aboutBoxes) {
  const brand = box.closest('.brand-section')?.id.match(/^grip-([a-z]+)-section$/)?.[1];
  if (!brand) throw new Error('About box outside a grip brand section');
  gripAbout[brand] = box.innerHTML.trim();
}

// Legends: the string legend is repeated per racquet view and must be identical.
function legendItems(el: Element): { swatch: string; label: string }[] {
  return [...el.querySelectorAll('.legend-item')].map((item) => {
    // Read the raw attribute: the CSSOM would normalise the hex colours to rgb().
    const style = item.querySelector('.legend-swatch')?.getAttribute('style') ?? '';
    const swatch = style.match(/^background:(.+)$/)?.[1];
    if (!swatch) throw new Error('legend swatch missing: ' + style);
    return { swatch, label: item.textContent!.trim() };
  });
}
const stringLegends = racquetIds.map((rid) => {
  const legends = document.querySelectorAll(`#${rid}-content .legend`);
  assertEq(legends.length, 1, `legend in ${rid}`);
  return legendItems(legends[0]!);
});
for (const l of stringLegends) {
  assertEq(JSON.stringify(l), JSON.stringify(stringLegends[0]), 'string legends identical');
}
const gripLegendEls = document.querySelectorAll('#grips-content .legend');
assertEq(gripLegendEls.length, 1, 'grip legend');
const legends = { strings: stringLegends[0]!, grips: legendItems(gripLegendEls[0]!) };
assertEq(legends.strings.length, 5, 'string legend items');
assertEq(legends.grips.length, 4, 'grip legend items');

// Gut intro blurb: a concatenation of single-quoted literals in the tennis-gut script.
const blurbMatches = [
  ...html.matchAll(
    /'<div class="gut-intro-blurb">'((?:\s*\+\s*'(?:[^'\\]|\\.)*')+)\s*\+\s*'<\/div>'/g,
  ),
];
assertEq(blurbMatches.length, 1, 'gut intro blurb');
const gutIntro = [...blurbMatches[0]![1]!.matchAll(/'((?:[^'\\]|\\.)*)'/g)]
  .map((m) => m[1]!.replace(/\\(.)/g, '$1'))
  .join('');

const copy = { brandFooters, hybridCards, gripAbout, gutIntro, legends };

// ---------------------------------------------------------------- output
const pretty = (v: unknown): string => JSON.stringify(v, null, 2) + '\n';

// Round trip: reassembling the collections must reproduce the original blob exactly,
// including key order. The compact form is also compared byte for byte with the source.
const reassembled: Record<string, unknown> = { version: db.version };
for (const c of COLLECTIONS) reassembled[c] = JSON.parse(pretty(db[c]));
assertEq(JSON.stringify(reassembled), JSON.stringify(db), 'reassembled TENNIS_DB');
const byteIdentical = JSON.stringify(db) === rawJson;

if (SAMPLE) {
  const strings = db.strings as { id: string }[];
  console.log('--- data/meta.json\n' + pretty({ version: db.version }));
  console.log('--- data/racquets.json\n' + pretty(db.racquets));
  console.log('--- data/strings.json (first 2 of 72)\n' + pretty(strings.slice(0, 2)));
  console.log(
    '--- content/copy.json: brandFooters.toroline\n' + pretty(copy.brandFooters.toroline),
  );
  console.log('--- content/copy.json: gutIntro\n' + pretty(copy.gutIntro));
} else {
  mkdirSync(join(ROOT, 'data'), { recursive: true });
  mkdirSync(join(ROOT, 'content'), { recursive: true });
  writeFileSync(join(ROOT, 'data', 'meta.json'), pretty({ version: db.version }), 'utf8');
  for (const c of COLLECTIONS)
    writeFileSync(join(ROOT, 'data', `${c}.json`), pretty(db[c]), 'utf8');
  writeFileSync(join(ROOT, 'content', 'copy.json'), pretty(copy), 'utf8');
}

console.log(
  [
    `counts: ${racquetIds.length} racquets, ${Object.keys(db.brandsStrings).length} brands,`,
    `${db.strings.length} strings, ${db.hybrids.length} hybrids, ${gripCount} grips,`,
    `${db.gutStrings.length} gut strings, ${gutCount} gut pairings`,
  ].join(' '),
);
console.log(
  `copy: ${footerCount} footers -> ${Object.keys(brandFooters).length} brands ` +
    `(${Object.values(brandFooters).filter((f) => f.byRacquet).length} with overrides), ` +
    `${cards.length} hybrid cards -> ${Object.keys(hybridCards).length}, ` +
    `${aboutBoxes.length} About boxes, 1 gut blurb, legends ${legends.strings.length}+${legends.grips.length}`,
);
console.log(
  `round trip: deep-equal with key order OK; compact form byte-identical to source: ${byteIdentical}`,
);
console.log(
  SAMPLE ? 'sample mode: nothing written' : 'written: data/*.json (8 files), content/copy.json',
);
