// Phase 2 step 4 (docs/phase-2-data-model.md, D1): the stiffness figures re-checked against
// Racketpedia (brand listings read on 2026-11-18). One-off, kept for provenance.
//
//   match:    the stored figure equals Racketpedia's at a gauge (and colour) the string is sold
//             in -> source "Racketpedia", retrieved "2026-11", the pages it comes from; approx
//             drops, since the figure is now a measurement (30 strings)
//   adopt:    Racketpedia's figure replaces ours or fills a gap, where a second lab (Tennis
//             Warehouse University's impact tests) sides with it or there was none (4 strings)
//   dispute:  Racketpedia disagrees and TWU sides with our figure, is level, or has no data;
//             or Racketpedia's reading looks wrong. Our figure stays, marked legacy, and the
//             reading is kept as stiffness.disputed and listed in the changelog; the notes say
//             nothing of it, the owner's call (20 strings)
//
// The owner approved the classification on 2026-11-18, after the full comparison and the TWU
// check. Before writing, it asserts every count, that each match equals its stored figure,
// and that each text edit's text occurs exactly once (the 4G note, Barb Wire's feel text).
//
//   tsx scripts/recheck-stiffness.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/recheck-stiffness.ts            migrates strings.json and pairings.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyOnce, type TextEdit } from './stiffness-words';

type K = number | { min: number; max: number };
const RETRIEVED = '2026-11';
const r = (min: number, max: number): K => ({ min, max });

/** Stored figure confirmed: Racketpedia's value and the pages (colour and gauge) it comes from. */
const MATCHES: Record<string, [K, string[]]> = {
  'toroline-o-toro-tour': [1.1, ['toroline-o-toro-tour-neon-mint-123']],
  'toroline-caviar': [1.0, ['toroline-caviar-neon-yellow-124']],
  'toroline-a5': [0.9, ['toroline-a5-carbon-gray-125']],
  'toroline-o-toro': [0.95, ['toroline-o-toro-fluo-green-123']],
  'toroline-wasabi': [
    r(0.95, 1.0),
    ['toroline-wasabi-neon-green-123', 'toroline-wasabi-pomegranate-red-123'],
  ],
  'toroline-toro-toro': [0.95, ['toroline-toro-toro-neon-pink-123']],
  'toroline-enso-pro-carbon': [0.9, ['toroline-enso-pro-carbon-125']],
  'toroline-snapper': [0.85, ['toroline-snapper-lavender-123']],
  'toroline-super-toro': [0.9, ['toroline-super-toro-blue-123']],
  'solinco-tour-bite': [1.12, ['solinco-tour-bite-grey-125']],
  'solinco-confidential': [1.0, ['solinco-confidential-black-125']],
  'solinco-hyper-g': [1.1, ['solinco-hyper-g-green-125']],
  'solinco-mach-10': [0.85, ['solinco-mach-10-cyan-130']],
  'solinco-tour-bite-soft': [0.85, ['solinco-tour-bite-soft-grey-125']],
  'solinco-hyper-g-round': [0.95, ['solinco-hyper-g-round-green-120']],
  'yonex-poly-tour-spin': [1.08, ['yonex-poly-tour-spin-blue-125']],
  'yonex-poly-tour-strike': [0.92, ['yonex-poly-tour-strike-grey-125']],
  'yonex-poly-tour-pro': [
    1.05,
    ['yonex-poly-tour-pro-yellow-125', 'yonex-poly-tour-pro-blue-blue-125'],
  ],
  'yonex-poly-tour-rev': [
    r(0.85, 0.95),
    [
      'yonex-poly-tour-rev-purple-125',
      'yonex-poly-tour-rev-orange-125',
      'yonex-poly-tour-rev-white-125',
    ],
  ],
  'yonex-poly-tour-fire': [0.8, ['yonex-poly-tour-fire-red-125']],
  'yonex-poly-tour-air': [0.72, ['yonex-poly-tour-air-azur-125']],
  'yonex-poly-tour-tough': [0.77, ['yonex-poly-tour-tough-black-125']],
  'restring-vivo': [1.05, ['restring-vivo-blue-123']],
  'restring-sync': [r(0.85, 0.95), ['restring-sync-silver-120', 'restring-sync-silver-125']],
  'restring-zero': [r(1.05, 1.1), ['restring-zero-sky-blue-123', 'restring-zero-sky-blue-128']],
  'grapplesnake-tour-sniper': [1.05, ['grapplesnake-tour-sniper-metallic-grey-125']],
  'grapplesnake-tour-m8': [
    r(0.9, 0.95),
    ['grapplesnake-tour-m8-olive-green-125', 'grapplesnake-tour-m8-olive-green-130'],
  ],
  'grapplesnake-alpha': [0.9, ['grapplesnake-alpha-yellow-125']],
  'grapplesnake-tour-mako': [0.45, ['grapplesnake-tour-mako-green-125']],
  'luxilon-element': [0.85, ['luxilon-element-bronze-130']],
};

/** Racketpedia's figure adopted: what we stored before, and the new value. */
const ADOPT: Record<string, [K | null, K, string[]]> = {
  'luxilon-4g': [1.1, 1.18, ['luxilon-4g-gold-125']],
  'solinco-barb-wire': [0.95, 0.9, ['solinco-barb-wire-black-125']],
  'solinco-confidential-soft': [null, 0.85, ['solinco-confidential-soft-pink-125']],
  'solinco-vanquish-multi': [
    null,
    r(0.55, 0.65),
    ['solinco-vanquish-natural-120', 'solinco-vanquish-natural-130'],
  ],
};

/**
 * Racketpedia disagrees; our figure stays, and the reading is kept in the data
 * (stiffness.disputed) and listed in the changelog, not in the note text (the owner's call on
 * 2026-11-18: such a disclaimer is irrelevant to the reader). The reading, its page, and why it
 * isn't adopted.
 */
type Why = 'twu' | 'none' | 'level' | 'doubt';
export const DISPUTES: Record<string, [number, string, Why, string?]> = {
  'luxilon-alu-power': [0.78, 'luxilon-alu-power-silver-125', 'twu'],
  'luxilon-alu-power-rough': [0.72, 'luxilon-alu-power-rough-silver-125', 'twu'],
  'luxilon-alu-power-soft': [0.73, 'luxilon-alu-power-soft-silver-125', 'twu'],
  'luxilon-alu-power-spin': [0.83, 'luxilon-alu-power-spin-silver-127', 'twu'],
  'luxilon-alu-power-feel': [0.78, 'luxilon-alu-power-feel-silver-120', 'twu'],
  'luxilon-4g-rough': [0.83, 'luxilon-4g-rough-gold-125', 'twu'],
  'luxilon-4g-soft': [1.13, 'luxilon-4g-soft-gold-125', 'twu'],
  'luxilon-adrenaline': [0.77, 'luxilon-adrenaline-silver-125', 'twu'],
  'luxilon-eco-power': [1.05, 'luxilon-eco-power-green-125', 'twu'],
  'tourna-big-hitter-black-7': [0.77, 'tourna-big-hitter-black-7-black-125', 'twu'],
  'solinco-revolution': [1.15, 'solinco-revolution-blue-125', 'twu'],
  'solinco-tb-diamond-rough': [0.55, 'solinco-tour-bite-diamond-rough-grey-125', 'twu'],
  'yonex-poly-tour-drive': [0.6, 'yonex-poly-tour-drive-silver-125', 'twu'],
  'solinco-outlast': [1.08, 'solinco-outlast-red-125', 'level'],
  'restring-slap-ltd-edition': [0.75, 'restring-slap-black-123', 'none'],
  'grapplesnake-paradox-pro': [0.7, 'grapplesnake-paradox-pro-forest-green-129', 'none'],
  'grapplesnake-aspera-triplum': [0.5, 'grapplesnake-aspera-triplum-lime-yellow-119', 'none'],
  'grapplesnake-irukandji': [0.6, 'grapplesnake-irukandji-silver-117', 'none'],
  'solinco-hyper-g-soft': [
    1.1,
    'solinco-hyper-g-soft-green-125',
    'doubt',
    'the same as standard Hyper-G, and its 1.30 page reads "105"; TWU puts it well below Hyper-G',
  ],
  'toroline-truffle-x': [
    0.2,
    'toroline-truffle-x-purple-130',
    'doubt',
    "a third of natural gut's 0.55; not adopted",
  ],
};

/**
 * Text that states a figure this re-check changed, as the same edits v1.2 used (one exact
 * occurrence each); the tests apply them to legacy v0.990 too (patch G). The 4G note carries the
 * correction's parenthetical, as the conventions ask.
 */
export const RECHECK_TEXT_EDITS: readonly TextEdit[] = [
  {
    id: 'luxilon-4g',
    field: 'note',
    racquet: 'regna',
    from: 'Firmer than ALU Power (1.10 kg/mm)',
    to: 'Firmer than ALU Power (1.18 kg/mm)',
  },
  {
    id: 'luxilon-4g',
    field: 'note',
    racquet: 'regna',
    from: 'how firm the bed already is.',
    to: 'how firm the bed already is. (Earlier notes gave 1.10 kg/mm.)',
  },
  {
    id: 'solinco-barb-wire',
    field: 'feelExpand',
    from: 'medium stiffness',
    to: 'medium-soft stiffness',
  },
];

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

function main(): void {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const read = <T>(f: string): T => JSON.parse(readFileSync(join(ROOT, f), 'utf8')) as T;
  const write = (f: string, v: unknown): void =>
    writeFileSync(join(ROOT, f), `${JSON.stringify(v, null, 2)}\n`);
  type Figure = {
    kgPerMm: K;
    approx: boolean;
    source: string;
    retrieved: string | null;
    pages?: string[];
  };
  type Stiffness = { band?: string; figure: Figure | null; disputed?: unknown };
  type Row = { id: string; name: string; stiffness: Stiffness; feelExpand: string };
  type Pairing = { itemId: string; racquetId: string; note: string };

  const strings = read<Row[]>('data/strings.json');
  const pairings = read<Pairing[]>('data/pairings.json');
  const before = structuredClone({ strings, pairings });
  const same = (a: K, b: K): boolean => JSON.stringify(a) === JSON.stringify(b);
  const byId = (id: string): Row => {
    const s = strings.find((x) => x.id === id);
    assert(!!s, `string ${id}`);
    return s!;
  };
  const approxDropped: string[] = [];

  for (const [id, [k, pages]] of Object.entries(MATCHES)) {
    const s = byId(id);
    const f = s.stiffness.figure;
    assert(
      !!f && f.source === 'legacy' && same(f.kgPerMm, k),
      `${id}: stored figure equals Racketpedia's`,
    );
    if (f!.approx) approxDropped.push(id);
    s.stiffness.figure = {
      kgPerMm: k,
      approx: false,
      source: 'Racketpedia',
      retrieved: RETRIEVED,
      pages,
    };
  }
  for (const [id, [was, k, pages]] of Object.entries(ADOPT)) {
    const s = byId(id);
    const stored = s.stiffness.figure?.kgPerMm ?? null;
    assert(
      was === null ? stored === null : stored !== null && same(stored, was),
      `${id}: stored figure`,
    );
    s.stiffness = {
      figure: { kgPerMm: k, approx: false, source: 'Racketpedia', retrieved: RETRIEVED, pages },
    };
  }
  for (const [id, [k, page]] of Object.entries(DISPUTES)) {
    const s = byId(id);
    assert(!s.stiffness.figure || s.stiffness.figure.source === 'legacy', `${id}: stays legacy`);
    s.stiffness.disputed = {
      source: 'Racketpedia',
      kgPerMm: k,
      pages: [page],
      retrieved: RETRIEVED,
    };
  }
  for (const e of RECHECK_TEXT_EDITS) {
    if (e.field === 'note') {
      const p = pairings.find((x) => x.itemId === e.id && x.racquetId === e.racquet)!;
      p.note = applyOnce(p.note, e);
    } else {
      const s = byId(e.id) as unknown as Record<string, string>;
      s[e.field] = applyOnce(s[e.field]!, e);
    }
  }

  // ---- counts
  const all = [...Object.keys(MATCHES), ...Object.keys(ADOPT), ...Object.keys(DISPUTES)];
  assert(new Set(all).size === all.length, 'each string in one list');
  assert(
    Object.keys(MATCHES).length === 30 &&
      Object.keys(ADOPT).length === 4 &&
      Object.keys(DISPUTES).length === 20,
    '30 / 4 / 20',
  );
  const racketpedia = strings.filter((s) => s.stiffness.figure?.source === 'Racketpedia').length;
  assert(racketpedia === 34, `34 Racketpedia figures (got ${racketpedia})`);
  assert(
    JSON.stringify(approxDropped) === JSON.stringify(['solinco-hyper-g-round']),
    `the ~ drops on Hyper-G Round only (got ${approxDropped})`,
  );

  if (process.argv.includes('--sample')) {
    const fig = (s: Row): string => JSON.stringify(s.stiffness);
    for (const id of [
      'toroline-o-toro-tour',
      'solinco-hyper-g-round',
      'luxilon-4g',
      'solinco-vanquish-multi',
      'luxilon-alu-power',
    ]) {
      const was = before.strings.find((x) => x.id === id)!;
      console.log(`${was.name}\n  was: ${fig(was)}\n  now: ${fig(byId(id))}\n`);
    }
    const note = (list: Pairing[]) =>
      list.find((p) => p.itemId === 'luxilon-4g' && p.racquetId === 'regna')!.note;
    console.log(`4G, Regna note\n  was: ${note(before.pairings)}\n  now: ${note(pairings)}\n`);
    console.log(
      'Checks passed: 30 matches equal their stored figures, 4 adopted, 20 disputed, 3 text edits. Nothing written.',
    );
  } else {
    write('data/strings.json', strings);
    write('data/pairings.json', pairings);
    console.log(
      'Re-checked 54 figures: 30 confirmed, 4 adopted, 20 disputed (kept, reading recorded).',
    );
  }
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') main();
