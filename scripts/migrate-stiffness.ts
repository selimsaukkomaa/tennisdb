// Phase 2 step 2, fourth move (docs/phase-2-data-model.md, D1): stiffness as values.
// One-off, kept for provenance.
//
//   strings:  { label: "Firm · ~1.10", width: 88 }
//         ->  { band: "Firm",
//               figure: { kgPerMm: 1.1, approx: true, source: "legacy", retrieved: null },
//               width: 88 }
//             a range is kgPerMm: { min, max }; a string without a figure has figure: null
//   hybrids:  { label: "Med-Firm", width: 70 }  ->  { band: "Med-Firm", width: 70 }
//
// The 62 existing figures are marked source "legacy" with no retrieval date, the owner's
// decision for D1; a later check upgrades each to a named source and date. The band and the
// bar width stay stored for now: D2 derives the band from the figure and D3 the width, each
// as its own visible release. "Med" and "Medium" both stay, as the page shows them today.
//
// Before writing, it asserts every count and that each label prints back exactly.
//
//   tsx scripts/migrate-stiffness.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/migrate-stiffness.ts            migrates data/strings.json and hybrids.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const read = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
const write = (f: string, v: unknown): void =>
  writeFileSync(join(DATA, f), `${JSON.stringify(v, null, 2)}\n`);

const BANDS = ['Very Soft', 'Soft', 'Med-Soft', 'Med', 'Medium', 'Med-Firm', 'Firm', 'Very Firm'];

type KgPerMm = number | { min: number; max: number };
interface Figure {
  kgPerMm: KgPerMm;
  approx: boolean;
  source: 'legacy';
  retrieved: null;
}
interface Stiffness {
  band: string;
  figure?: Figure | null;
  width: number;
}
interface Item {
  id: string;
  name: string;
  stiffness: { label: string; width: number } | Stiffness;
  [key: string]: unknown;
}

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

/** The label the page shows (src/core/stiffness.ts prints it for the UI). */
function label(s: Stiffness): string {
  if (!s.figure) return s.band;
  const k = s.figure.kgPerMm;
  const text = typeof k === 'number' ? k.toFixed(2) : `${k.min.toFixed(2)}–${k.max.toFixed(2)}`;
  return `${s.band} · ${s.figure.approx ? '~' : ''}${text}`;
}

function parse(old: { label: string; width: number }, withFigure: boolean): Stiffness {
  const [band, text, ...rest] = old.label.split(' · ');
  assert(rest.length === 0 && BANDS.includes(band!), `band in "${old.label}"`);
  if (!withFigure) {
    assert(text === undefined, `a hybrid has no figure ("${old.label}")`);
    return { band: band!, width: old.width };
  }
  if (text === undefined) return { band: band!, figure: null, width: old.width };
  const m = text.match(/^(~?)(\d\.\d\d)(?:–(\d\.\d\d))?$/);
  assert(!!m, `figure in "${old.label}"`);
  const kgPerMm = m![3] ? { min: Number(m![2]), max: Number(m![3]) } : Number(m![2]);
  return {
    band: band!,
    figure: { kgPerMm, approx: m![1] === '~', source: 'legacy', retrieved: null },
    width: old.width,
  };
}

const strings = read<Item[]>('strings.json');
const hybrids = read<Item[]>('hybrids.json');
const migrate = (items: Item[], withFigure: boolean): Item[] =>
  items.map((item) => {
    const old = item.stiffness as { label: string; width: number };
    const next = parse(old, withFigure);
    assert(label(next) === old.label, `${item.id}: "${label(next)}" vs stored "${old.label}"`);
    return { ...item, stiffness: next };
  });
const newStrings = migrate(strings, true);
const newHybrids = migrate(hybrids, false);

// ---- counts
const st = newStrings.map((s) => s.stiffness as Stiffness);
const figures = st.flatMap((s) => (s.figure ? [s.figure] : []));
const count = {
  strings: st.length,
  withFigure: figures.length,
  approx: figures.filter((f) => f.approx).length,
  ranges: figures.filter((f) => typeof f.kgPerMm !== 'number').length,
  withoutFigure: st.filter((s) => s.figure === null).length,
  hybrids: newHybrids.length,
};
assert(
  JSON.stringify(count) ===
    JSON.stringify({
      strings: 72,
      withFigure: 62,
      approx: 15,
      ranges: 5,
      withoutFigure: 10,
      hybrids: 10,
    }),
  `counts 72 / 62 / 15 / 5 / 10 / 10 (got ${JSON.stringify(count)})`,
);
const bands = st.reduce<Record<string, number>>(
  (n, s) => ({ ...n, [s.band]: (n[s.band] ?? 0) + 1 }),
  {},
);
const EXPECTED_BANDS: Record<string, number> = {
  Firm: 16,
  'Med-Firm': 17,
  Med: 5,
  'Med-Soft': 9,
  Medium: 15,
  Soft: 6,
  'Very Soft': 2,
  'Very Firm': 2,
};
for (const [band, n] of Object.entries(EXPECTED_BANDS)) {
  assert(bands[band] === n, `${n} strings in band ${band} (got ${bands[band]})`);
}
for (const f of figures) {
  if (typeof f.kgPerMm !== 'number') assert(f.kgPerMm.min < f.kgPerMm.max, 'range runs forwards');
}

if (process.argv.includes('--sample')) {
  const pick = (id: string) => newStrings.find((s) => s.id === id)!;
  const sample = [
    pick('toroline-o-toro-tour'),
    newStrings.find((s) => (s.stiffness as Stiffness).figure?.approx)!,
    newStrings.find((s) => typeof (s.stiffness as Stiffness).figure?.kgPerMm === 'object')!,
    newStrings.find((s) => (s.stiffness as Stiffness).figure === null)!,
    newHybrids[0]!,
  ];
  for (const item of sample) {
    const old = [...strings, ...hybrids].find((x) => x.id === item.id)!.stiffness;
    console.log(
      `${item.name}\n  was: ${JSON.stringify(old)}\n  now: ${JSON.stringify(item.stiffness)}\n  prints as: "${label(item.stiffness as Stiffness)}"\n`,
    );
  }
  console.log(
    `Checks passed: ${JSON.stringify(count)}; every label prints back exactly. Nothing written.`,
  );
} else {
  write('strings.json', newStrings);
  write('hybrids.json', newHybrids);
  console.log(`Migrated stiffness on ${count.strings} strings and ${count.hybrids} hybrids.`);
}
