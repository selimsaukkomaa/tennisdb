// Phase 2 step 2, fifth move (docs/phase-2-data-model.md, D5): ratings as a score and a label.
// One-off, kept for provenance.
//
//   { label: "Low-Med", width: 38 }  ->  { score: 38, label: "Low-Med" }
//
// on power, spin, control and comfort (strings), power and spin (hybrids), tackiness,
// absorption and durability (grips), and power, spin, comfort and gut protection (gut
// pairings). The score is the number that was the bar's width; the page draws it as before.
// Stiffness is not a rating and is untouched.
//
// Each label is checked against its axis's list of today's words, written lowest first. The
// words are not unified here (the owner's decision for D5): "Medium" and "Moderate", "Med-High"
// and "Mod-High" all stay until a content pass of their own.
//
// Before writing, it asserts the number of ratings per collection, that every label is on its
// axis's list, that every listed word is in use, and that the lowest score of each word never
// falls along its list.
//
//   tsx scripts/migrate-ratings.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/migrate-ratings.ts            migrates strings, hybrids, grips and gutHybrids
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const read = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
const write = (f: string, v: unknown): void =>
  writeFileSync(join(DATA, f), `${JSON.stringify(v, null, 2)}\n`);

/** Today's words per axis, lowest first. Strings and hybrids share the string lists. */
const WORDS = {
  power: ['Low', 'Low-Med', 'Med-Low', 'Medium', 'Med-High', 'High', 'Very High'],
  spin: [
    'Low',
    'Low-Med',
    'Med-Low',
    'Medium',
    'Moderate',
    'Mod-High',
    'Med-High',
    'High',
    'High (Slice)',
    'Very High',
    'Elite',
  ],
  control: ['Low-Med', 'Moderate', 'Good', 'Very Good', 'Very High', 'Excellent', 'Outstanding'],
  comfort: [
    'Low',
    'Low-Mod',
    'Med-Low',
    'Moderate',
    'Medium',
    'Good',
    'Med-High',
    'Very Good',
    'High',
    'Very High',
    'Excellent',
    'Elite',
  ],
  tackiness: ['Low', 'Low-Med', 'Moderate', 'High', 'Very High', 'Elite'],
  absorption: ['Low', 'Med-Low', 'Medium', 'Moderate', 'High', 'Very High', 'Excellent', 'Elite'],
  durability: ['Low', 'Moderate', 'Medium', 'Good', 'Very Good', 'Excellent'],
  gutPower: ['Med-Low', 'Med', 'Med-High', 'High', 'Very High'],
  gutSpin: ['Med-Low', 'Med', 'Med-High', 'High', 'Very High'],
  gutComfort: ['Very Good', 'Excellent', 'Outstanding'],
  gutProtection: ['Med-Low', 'Med', 'Med-High', 'High', 'Very High'],
} as const;
type Axis = keyof typeof WORDS;

interface OldBar {
  label: string;
  width: number;
}
interface Rating {
  score: number;
  label: string;
}
type Rec = Record<string, unknown> & { id: string; name?: string };

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

/** Every rating converted, by axis, for the checks. */
const seen = new Map<Axis, Rating[]>();

function convert(rec: Rec, field: string, axis: Axis, optional = false): void {
  const old = rec[field] as OldBar | null | undefined;
  if (old === null || old === undefined) {
    assert(optional, `${rec.id}: no ${field}`);
    return;
  }
  assert(
    Object.keys(old).join() === 'label,width' && Number.isInteger(old.width),
    `${rec.id}.${field} is a { label, width } bar`,
  );
  assert(
    (WORDS[axis] as readonly string[]).includes(old.label),
    `${rec.id}.${field}: "${old.label}"`,
  );
  const rating: Rating = { score: old.width, label: old.label };
  rec[field] = rating;
  seen.set(axis, [...(seen.get(axis) ?? []), rating]);
}

type Grips = Record<string, Record<string, Rec[]>>;
const before = {
  strings: read<Rec[]>('strings.json'),
  hybrids: read<Rec[]>('hybrids.json'),
  grips: read<Grips>('grips.json'),
  gutHybrids: read<Rec[]>('gutHybrids.json'),
};
const after = structuredClone(before);

for (const s of after.strings) {
  for (const axis of ['power', 'spin', 'control', 'comfort'] as const) convert(s, axis, axis);
}
for (const h of after.hybrids) {
  for (const axis of ['power', 'spin'] as const) convert(h, axis, axis);
}
const gripsOf = (g: Grips): Rec[] =>
  Object.values(g).flatMap((byType) => Object.values(byType).flat());
for (const g of gripsOf(after.grips)) {
  // The replacement grips have no bars.
  for (const axis of ['tackiness', 'absorption', 'durability'] as const)
    convert(g, axis, axis, true);
}
for (const p of after.gutHybrids) {
  convert(p, 'power', 'gutPower');
  convert(p, 'spin', 'gutSpin');
  convert(p, 'comfort', 'gutComfort');
  // null on the gut-crosses pairings.
  convert(p, 'gutProtection', 'gutProtection', true);
}

// ---- counts
const n = (...axes: Axis[]): number => axes.reduce((sum, a) => sum + (seen.get(a)?.length ?? 0), 0);
const count = {
  // Strings and hybrids share the power and spin lists: 72 × 4 + 10 × 2.
  stringsAndHybrids: n('power', 'spin', 'control', 'comfort'),
  grips: n('tackiness', 'absorption', 'durability'),
  gut: n('gutPower', 'gutSpin', 'gutComfort'),
  gutProtection: n('gutProtection'),
  total: [...seen.values()].reduce((sum, list) => sum + list.length, 0),
};
const EXPECTED = { stringsAndHybrids: 308, grips: 78, gut: 63, gutProtection: 9, total: 458 };
assert(
  JSON.stringify(count) === JSON.stringify(EXPECTED),
  `counts ${JSON.stringify(EXPECTED)} (got ${JSON.stringify(count)})`,
);
assert(
  after.strings.length === 72 && after.hybrids.length === 10 && after.gutHybrids.length === 21,
  '72 strings, 10 hybrids, 21 gut pairings',
);
assert(gripsOf(after.grips).length === 35, '35 grips');

// ---- the lists: every word in use, and the lowest scores never fall along a list
const table: string[] = [];
for (const axis of Object.keys(WORDS) as Axis[]) {
  const ratings = seen.get(axis) ?? [];
  let floor = -1;
  const cells: string[] = [];
  for (const word of WORDS[axis]) {
    const scores = ratings.filter((r) => r.label === word).map((r) => r.score);
    assert(scores.length > 0, `${axis}: "${word}" is in use`);
    const low = Math.min(...scores);
    const high = Math.max(...scores);
    assert(
      low >= floor,
      `${axis}: "${word}" starts at ${low}, below the word before it (${floor})`,
    );
    floor = low;
    cells.push(`${word} ${low === high ? low : `${low}–${high}`} (${scores.length})`);
  }
  table.push(`  ${axis} (${ratings.length}): ${cells.join(' · ')}`);
}

// ---- no other bar is left, and nothing else changed
const leftover = JSON.stringify(after).match(/"label":"[^"]*","width"/g) ?? [];
assert(leftover.length === 0, `no { label, width } bar is left (found ${leftover.length})`);
const undo = (text: string): string =>
  text.replace(/\{"score":(\d+),"label":("[^"]*")\}/g, '{"label":$2,"width":$1}');
assert(
  undo(JSON.stringify(after)) === JSON.stringify(before),
  'converting back gives the data as it was',
);

if (process.argv.includes('--sample')) {
  const show = (title: string, was: Rec, now: Rec, fields: string[]): void => {
    console.log(title);
    for (const f of fields) {
      console.log(
        `  ${f.padEnd(14)} was: ${JSON.stringify(was[f])}\n  ${''.padEnd(14)} now: ${JSON.stringify(now[f])}`,
      );
    }
    console.log('');
  };
  const at = (list: Rec[], id: string): Rec => list.find((r) => r.id === id)!;
  const pick = (key: 'strings' | 'hybrids' | 'gutHybrids', id: string, fields: string[]): void =>
    show(
      `${at(before[key], id).name ?? id} (${key})`,
      at(before[key], id),
      at(after[key], id),
      fields,
    );
  pick('strings', 'toroline-o-toro-tour', ['power', 'spin', 'control', 'comfort']);
  pick('hybrids', 'toroline-k-pop', ['power', 'spin']);
  const gripId = 'kimony-hi-soft-ex';
  show('Hi-Soft EX (grips)', at(gripsOf(before.grips), gripId), at(gripsOf(after.grips), gripId), [
    'tackiness',
    'absorption',
    'durability',
  ]);
  pick('gutHybrids', 'gh-regna-1', ['power', 'spin', 'comfort', 'gutProtection']);
  const crosses = after.gutHybrids.find((p) => p.gutProtection === null)!;
  pick('gutHybrids', crosses.id, ['gutProtection']);
  console.log('Words per axis, lowest first, with the scores each covers today and its count:');
  console.log(table.join('\n'));
  console.log(
    `\nChecks passed: ${JSON.stringify(count)}; every label is on its list, every word is in use, lowest scores never fall along a list, converting back gives the data as it was. Nothing written.`,
  );
} else {
  write('strings.json', after.strings);
  write('hybrids.json', after.hybrids);
  write('grips.json', after.grips);
  write('gutHybrids.json', after.gutHybrids);
  console.log(`Migrated ${count.total} ratings.`);
}
