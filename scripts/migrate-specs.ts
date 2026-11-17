// Phase 2 step 2, sixth move (docs/phase-2-data-model.md, D9): the data as plain text.
// One-off, kept for provenance.
//
//   grip specs:  "0.50mm"  ->  { text: "0.50mm", emphasis: false }
//                "<em style=\"color:#d97706;\">Made in USA</em>"
//                          ->  { text: "Made in USA", emphasis: true }
//
// One grip spec carried markup, the only HTML in the data. With it structured, every string in
// data/ is plain text: the notes already were, so no note changes, and the views can escape
// them like any other text instead of injecting them as HTML.
//
// Before writing, it asserts 35 grips with 73 specs, exactly one of them emphasised, that every
// spec prints back to the string it was, that nothing else in grips.json changed, and that no
// string anywhere in data/ holds a tag or an entity (302 notes among them).
//
//   tsx scripts/migrate-specs.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/migrate-specs.ts            migrates data/grips.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const read = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
const write = (f: string, v: unknown): void =>
  writeFileSync(join(DATA, f), `${JSON.stringify(v, null, 2)}\n`);

const FILES = [
  'meta.json',
  'racquets.json',
  'brandsStrings.json',
  'strings.json',
  'hybrids.json',
  'pairings.json',
  'grips.json',
  'gutStrings.json',
  'gutHybrids.json',
];

interface Spec {
  text: string;
  emphasis: boolean;
}
interface Grip {
  id: string;
  name: string;
  specs: (string | Spec)[];
  notes: string;
  [key: string]: unknown;
}
type Grips = Record<string, Record<string, Grip[]>>;

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

/** The one form of markup in the data: v0.990's amber emphasis. */
const EMPHASIS = /^<em style="color:#d97706;">([^<>&]+)<\/em>$/;
/** A tag or a character entity: what plain text must not contain. */
const MARKUP = /<[a-zA-Z/!]|&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/;

function parse(old: string): Spec {
  const m = old.match(EMPHASIS);
  if (m) return { text: m[1]!, emphasis: true };
  assert(!/[<>&]/.test(old), `spec "${old}" is plain text`);
  return { text: old, emphasis: false };
}

/** The markup the page shows (src/ui/tables.ts draws it for the UI). */
const print = (s: Spec): string =>
  s.emphasis ? `<em style="color:#d97706;">${s.text}</em>` : s.text;

const before = read<Grips>('grips.json');
const after = structuredClone(before);
const gripsOf = (g: Grips): Grip[] =>
  Object.values(g).flatMap((byType) => Object.values(byType).flat());

for (const g of gripsOf(after)) {
  g.specs = (g.specs as string[]).map((old) => {
    const spec = parse(old);
    assert(print(spec) === old, `${g.id}: "${print(spec)}" vs stored "${old}"`);
    return spec;
  });
}

// ---- counts
const specs = gripsOf(after).flatMap((g) => g.specs as Spec[]);
const count = {
  grips: gripsOf(after).length,
  specs: specs.length,
  emphasised: specs.filter((s) => s.emphasis).length,
};
const EXPECTED = { grips: 35, specs: 73, emphasised: 1 };
assert(
  JSON.stringify(count) === JSON.stringify(EXPECTED),
  `counts ${JSON.stringify(EXPECTED)} (got ${JSON.stringify(count)})`,
);

// ---- nothing else changed
const undo = structuredClone(after);
for (const g of gripsOf(undo)) g.specs = (g.specs as Spec[]).map(print);
assert(
  JSON.stringify(undo) === JSON.stringify(before),
  'converting back gives grips.json as it was',
);

// ---- every string in data/ is now plain text
let strings = 0;
const dirty: string[] = [];
const walk = (file: string, v: unknown, path: string): void => {
  if (typeof v === 'string') {
    strings++;
    if (MARKUP.test(v)) dirty.push(`${file} ${path}: ${v.slice(0, 80)}`);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(file, x, `${path}[${i}]`));
  else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) walk(file, x, path ? `${path}.${k}` : k);
  }
};
for (const f of FILES) walk(f, f === 'grips.json' ? after : read(f), '');
assert(dirty.length === 0, `no string in data/ holds a tag or an entity:\n${dirty.join('\n')}`);

const notes = {
  pairings: read<{ note: string }[]>('pairings.json').length,
  grips: gripsOf(after).length,
  gut: read<{ notes: string }[]>('gutHybrids.json').length,
};
assert(
  notes.pairings === 246 && notes.grips === 35 && notes.gut === 21,
  `246 + 35 + 21 notes (got ${JSON.stringify(notes)})`,
);

if (process.argv.includes('--sample')) {
  const show = (id: string): void => {
    const was = gripsOf(before).find((g) => g.id === id)!;
    const now = gripsOf(after).find((g) => g.id === id)!;
    console.log(`${was.name} (${id})`);
    was.specs.forEach((old, i) => {
      console.log(`  was: ${JSON.stringify(old)}\n  now: ${JSON.stringify(now.specs[i])}`);
    });
    console.log('');
  };
  show(gripsOf(after).find((g) => (g.specs as Spec[]).some((s) => s.emphasis))!.id);
  show('kimony-hi-soft-ex');
  show('tourna-tac');
  console.log(
    `Checks passed: ${JSON.stringify(count)}; every spec prints back exactly; nothing else in grips.json changes; none of the ${strings} strings in data/ holds a tag or an entity, the ${notes.pairings + notes.grips + notes.gut} notes included (no note changes). Nothing written.`,
  );
} else {
  write('grips.json', after);
  console.log(`Structured ${count.specs} specs on ${count.grips} grips.`);
}
