// v1.8: "racket", never "racquet", in anything a reader sees (the owner's call, 2026-11-19).
// One-off, kept for provenance; the round trip imports the edits to apply them to v0.990's data.
// Six phrases in the data and copy: one string note, four grip texts and the Yonex grip About box.
// The UI's own words (the card's "Racket" label, the empty gut message) are in src/ui, and the
// `racket` rule in src/core/validate.ts keeps the old spelling out of data/ and content/. Code
// names (racquets.json, racquetId, data-racquet) keep it: nobody reads them.
//
// Before writing, it asserts each phrase occurs exactly once where it is listed, and that no
// "racquet" is left in any text value of data/ or content/copy.json.
//
//   tsx scripts/racket-spelling.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyOnce, type TextEdit } from './stiffness-words';

/** The string note: Revolution in the Regna. */
export const RACKET_NOTE_EDITS: readonly TextEdit[] = [
  {
    id: 'solinco-revolution',
    field: 'note',
    racquet: 'regna',
    from: 'lower racquet-head speeds',
    to: 'lower racket-head speeds',
  },
];

export interface GripTextEdit {
  gripId: string;
  field: 'notes' | 'feelExpand';
  from: string;
  to: string;
}

export const RACKET_GRIP_EDITS: readonly GripTextEdit[] = [
  {
    gripId: 'yonex-ultimum-leather',
    field: 'feelExpand',
    from: 'direct racquet feedback',
    to: 'direct racket feedback',
  },
  {
    gripId: 'yonex-synthetic-leather-excel-grip',
    field: 'notes',
    from: 'many Yonex racquets',
    to: 'many Yonex rackets',
  },
  {
    gripId: 'tourna-tourna-grip-xl',
    field: 'notes',
    from: 'extended-length racquets',
    to: 'extended-length rackets',
  },
  {
    gripId: 'tourna-synthetic-pro',
    field: 'notes',
    from: 'their racquet manufacturer',
    to: 'their racket manufacturer',
  },
];

/** The grip About boxes in content/copy.json, by brand. */
export const RACKET_ABOUT_EDITS: readonly { brand: string; from: string; to: string }[] = [
  {
    brand: 'yonex',
    from: 'largest racquet sports manufacturer',
    to: 'largest racket sports manufacturer',
  },
];

function assert(ok: boolean, message: string): asserts ok {
  if (!ok) throw new Error(`racket-spelling: ${message}`);
}

/** Every string value in `v` with its path; keys (racquetId, byRacquet) are not text. */
export function textValues(v: unknown, path = ''): [string, string][] {
  if (typeof v === 'string') return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => textValues(x, `${path}[${i}]`));
  if (v && typeof v === 'object')
    return Object.entries(v).flatMap(([k, x]) => textValues(x, path ? `${path}.${k}` : k));
  return [];
}

type Grip = Record<string, unknown> & { id: string };

function main(): void {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const read = (f: string): unknown => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
  const pairings = read('data/pairings.json') as {
    itemId: string;
    racquetId: string;
    note: string;
  }[];
  const grips = read('data/grips.json') as Record<string, Record<string, Grip[]>>;
  const copy = read('content/copy.json') as { gripAbout: Record<string, string> };

  for (const e of RACKET_NOTE_EDITS) {
    const p = pairings.filter((x) => x.itemId === e.id && x.racquetId === e.racquet);
    assert(p.length === 1, `one pairing ${e.id}/${e.racquet}`);
    p[0]!.note = applyOnce(p[0]!.note, e);
  }
  const allGrips = Object.values(grips).flatMap((byType) => Object.values(byType).flat());
  for (const e of RACKET_GRIP_EDITS) {
    const g = allGrips.filter((x) => x.id === e.gripId);
    assert(g.length === 1, `one grip ${e.gripId}`);
    const text = g[0]![e.field];
    assert(typeof text === 'string', `${e.gripId}.${e.field} is text`);
    g[0]![e.field] = applyOnce(text, { id: e.gripId, field: 'note', from: e.from, to: e.to });
  }
  for (const e of RACKET_ABOUT_EDITS) {
    const text = copy.gripAbout[e.brand];
    assert(text !== undefined, `an About box for ${e.brand}`);
    copy.gripAbout[e.brand] = applyOnce(text, {
      id: e.brand,
      field: 'note',
      from: e.from,
      to: e.to,
    });
  }

  // ---- counts: 1 + 4 + 1 phrases, and none left anywhere a reader can see
  assert(
    RACKET_NOTE_EDITS.length + RACKET_GRIP_EDITS.length + RACKET_ABOUT_EDITS.length === 6,
    'six phrases',
  );
  const files = [
    'data/brandsStrings.json',
    'data/gutHybrids.json',
    'data/gutStrings.json',
    'data/hybrids.json',
    'data/meta.json',
    'data/racquets.json',
    'data/strings.json',
  ];
  const left = [
    ...textValues(pairings, 'pairings'),
    ...textValues(grips, 'grips'),
    ...textValues(copy, 'copy'),
    ...files.flatMap((f) => textValues(read(f), f)),
  ].filter(([, t]) => /racquet/i.test(t));
  assert(left.length === 0, `"racquet" left in ${left.map(([p]) => p).join(', ')}`);

  for (const [f, v] of [
    ['data/pairings.json', pairings],
    ['data/grips.json', grips],
    ['content/copy.json', copy],
  ] as const) {
    writeFileSync(join(ROOT, f), `${JSON.stringify(v, null, 2)}\n`);
  }
  console.log('racket-spelling: 6 phrases changed (1 note, 4 grip texts, 1 About box)');
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') main();
