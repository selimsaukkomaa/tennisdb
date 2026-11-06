// Phase 2 step 2, first move (docs/phase-2-data-model.md, D6 and D7). One-off, kept for
// provenance like extract-legacy.ts:
//
//   - every string's and hybrid's `perRacquet` becomes records in data/pairings.json:
//     { itemId, itemKind, racquetId, tension, note }
//   - data/gutHybrids.json goes from { racquetId: [pairing] } to a flat list, each pairing
//     carrying its `racquetId` (the bars differ per racquet, so a pairing stays one record)
//   - every tension becomes numbers: range / max / prestretch / split
//
// It asserts every count, that each tension prints back to its original text, and that every
// note is carried over unchanged, before it writes anything.
//
//   tsx scripts/migrate-pairings.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/migrate-pairings.ts            migrates data/
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const read = (f: string): unknown => JSON.parse(readFileSync(join(DATA, f), 'utf8'));
const write = (f: string, v: unknown): void =>
  writeFileSync(join(DATA, f), `${JSON.stringify(v, null, 2)}\n`);

type Tension =
  | { kind: 'range'; minKg: number; maxKg: number }
  | { kind: 'max'; maxKg: number }
  | { kind: 'prestretch'; kg: number; prestretchPct: number }
  | { kind: 'split'; mainsKg: number; crossesKg: number };

const N = String.raw`(\d+(?:\.\d+)?)`;
const FORMS: [RegExp, (m: number[]) => Tension][] = [
  [new RegExp(`^${N}–${N}$`), ([a, b]) => ({ kind: 'range', minKg: a!, maxKg: b! })],
  [new RegExp(`^max ${N}$`), ([a]) => ({ kind: 'max', maxKg: a! })],
  [
    new RegExp(`^${N} \\(${N}% PS\\)$`),
    ([a, b]) => ({ kind: 'prestretch', kg: a!, prestretchPct: b! }),
  ],
  [new RegExp(`^${N}/${N}$`), ([a, b]) => ({ kind: 'split', mainsKg: a!, crossesKg: b! })],
];

export function parseTension(text: string): Tension {
  for (const [re, make] of FORMS) {
    const m = text.match(re);
    if (m) return make(m.slice(1).map(Number));
  }
  throw new Error(`unrecognised tension "${text}"`);
}

/** The same text the data held (src/core/pairings.ts prints it for the UI). */
export function tensionText(t: Tension): string {
  switch (t.kind) {
    case 'range':
      return `${t.minKg}–${t.maxKg}`;
    case 'max':
      return `max ${t.maxKg}`;
    case 'prestretch':
      return `${t.kg} (${t.prestretchPct}% PS)`;
    case 'split':
      return `${t.mainsKg}/${t.crossesKg}`;
  }
}

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

interface Item {
  id: string;
  perRacquet?: Record<string, { tension: string; note: string }>;
}
interface GutPairing {
  id: string;
  tension: string;
  [key: string]: unknown;
}

export function migrate() {
  const racquets = (read('racquets.json') as { id: string }[]).map((r) => r.id);
  const strings = read('strings.json') as Item[];
  const hybrids = read('hybrids.json') as Item[];
  const gut = read('gutHybrids.json') as Record<string, GutPairing[]>;

  const pairings = (
    [
      ['string', strings],
      ['hybrid', hybrids],
    ] as const
  ).flatMap(([itemKind, items]) =>
    items.flatMap((item) =>
      Object.entries(item.perRacquet ?? {}).map(([racquetId, per]) => {
        const tension = parseTension(per.tension);
        assert(tensionText(tension) === per.tension, `${item.id}/${racquetId} tension round trip`);
        return { itemId: item.id, itemKind, racquetId, tension, note: per.note };
      }),
    ),
  );
  const stripped = (items: Item[]) =>
    items.map((item) => {
      const rest = { ...item };
      delete rest.perRacquet;
      return rest;
    });
  const gutPairings = Object.entries(gut).flatMap(([racquetId, list]) =>
    list.map((p) => {
      const tension = parseTension(p.tension);
      assert(tensionText(tension) === p.tension, `${p.id} tension round trip`);
      // Same key order, with racquetId after id.
      const { id, ...rest } = p;
      return { id, racquetId, ...rest, tension };
    }),
  );

  // ---- counts: 72 strings and 10 hybrids in 3 racquets, 21 gut pairings
  const kinds = (k: string) => pairings.filter((p) => p.itemKind === k).length;
  assert(kinds('string') === 72 * 3, `216 string pairings (got ${kinds('string')})`);
  assert(kinds('hybrid') === 10 * 3, `30 hybrid pairings (got ${kinds('hybrid')})`);
  assert(gutPairings.length === 21, `21 gut pairings (got ${gutPairings.length})`);
  const byKind = [...pairings, ...gutPairings].reduce<Record<string, number>>((n, p) => {
    n[p.tension.kind] = (n[p.tension.kind] ?? 0) + 1;
    return n;
  }, {});
  assert(
    JSON.stringify(byKind) === JSON.stringify({ range: 212, max: 2, prestretch: 2, split: 51 }),
    `tension kinds 212 / 2 / 2 / 51 (got ${JSON.stringify(byKind)})`,
  );
  assert(
    pairings.every((p) => (p.itemKind === 'hybrid') === (p.tension.kind === 'split')),
    'hybrids and only hybrids have split tensions',
  );
  for (const p of pairings) {
    assert(racquets.includes(p.racquetId), `${p.itemId}: unknown racquet ${p.racquetId}`);
  }
  // ---- notes carried over unchanged
  const notesBefore = [...strings, ...hybrids].flatMap((i) =>
    Object.values(i.perRacquet ?? {}).map((p) => p.note),
  );
  assert(
    JSON.stringify(pairings.map((p) => p.note)) === JSON.stringify(notesBefore),
    'notes unchanged and in order',
  );

  return {
    pairings,
    strings: stripped(strings),
    hybrids: stripped(hybrids),
    gutHybrids: gutPairings,
    byKind,
  };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const out = migrate();
  if (process.argv.includes('--sample')) {
    const pick = (pred: (p: (typeof out.pairings)[number]) => boolean) => out.pairings.find(pred);
    const sample = [
      pick((p) => p.itemId === 'toroline-o-toro-tour' && p.racquetId === 'regna'),
      pick((p) => p.tension.kind === 'max'),
      pick((p) => p.tension.kind === 'prestretch'),
      pick((p) => p.itemKind === 'hybrid'),
    ];
    const shorten = (note: string) => (note.length > 70 ? `${note.slice(0, 70)}…` : note);
    console.log('Pairings (data/pairings.json), notes shortened here:');
    for (const p of sample) console.log(JSON.stringify({ ...p!, note: shorten(p!.note) }, null, 2));
    const gutSample = out.gutHybrids[0]!;
    console.log('Gut pairing (data/gutHybrids.json), top-level keys and tension:');
    console.log(
      JSON.stringify({ keys: Object.keys(gutSample), tension: gutSample.tension }, null, 2),
    );
    console.log(
      `Checks passed: ${out.pairings.length} pairings, ${out.gutHybrids.length} gut pairings, tensions ${JSON.stringify(out.byKind)}, every tension prints back to its original text, notes unchanged. Nothing written.`,
    );
  } else {
    write('pairings.json', out.pairings);
    write('strings.json', out.strings);
    write('hybrids.json', out.hybrids);
    write('gutHybrids.json', out.gutHybrids);
    console.log(
      `Migrated: ${out.pairings.length} pairings, ${out.gutHybrids.length} gut pairings.`,
    );
  }
}
