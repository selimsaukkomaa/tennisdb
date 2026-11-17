// Phase 2 step 3, first release (docs/phase-2-data-model.md, D2 and D8's Firm/Soft): the
// stiffness band and the Firm/Soft chip are derived, no longer stored. One-off, kept for
// provenance.
//
//   a string with a figure:    { band: "Firm", figure: { kgPerMm: 1.1, ... }, width: 88 }
//                          ->  { figure: { kgPerMm: 1.1, ... }, width: 88 }
//                              (the band comes from the figure: src/core/stiffness.ts)
//   a string without one:      { band: "Med", figure: null, width: 62 }
//                          ->  { band: "Medium", figure: null, width: 62 }   ("Med" folds)
//   feelAttr, strings and hybrids:  "crisp,firm,lively"  ->  "crisp,lively"
//                              (Firm or Soft comes from the band: Med-Firm and firmer is Firm)
//
// The rule moves 32 of the 62 bands with a figure and folds one "Med" without a figure
// (Vamos); 8 strings move from the Firm chip to the Soft one. The owner approved the full list
// on 2026-11-17 after a preview with screenshots. Before writing, the script asserts exactly
// those moves, by id, and that every other band and chip comes out as stored.
//
//   tsx scripts/derive-stiffness-bands.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/derive-stiffness-bands.ts            migrates data/strings.json and hybrids.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
const read = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
const write = (f: string, v: unknown): void =>
  writeFileSync(join(DATA, f), `${JSON.stringify(v, null, 2)}\n`);

type KgPerMm = number | { min: number; max: number };
interface Row {
  id: string;
  name: string;
  feelAttr: string;
  stiffness: { band?: string; figure?: { kgPerMm: KgPerMm } | null; width: number };
  [key: string]: unknown;
}

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

/** D2's thresholds, on the figure or a range's midpoint (compared in thousandths). */
function bandFor(k: KgPerMm): string {
  const m = Math.round((typeof k === 'number' ? k : (k.min + k.max) / 2) * 1000);
  if (m < 700) return 'Very Soft';
  if (m < 850) return 'Soft';
  if (m < 920) return 'Med-Soft';
  if (m < 980) return 'Medium';
  if (m < 1050) return 'Med-Firm';
  if (m < 1100) return 'Firm';
  return 'Very Firm';
}
const fold = (band: string): string => (band === 'Med' ? 'Medium' : band);
const chipFor = (band: string): string =>
  ['Med-Firm', 'Firm', 'Very Firm'].includes(band) ? 'firm' : 'soft';

/** The moves the owner approved, by id: band before and after. */
const MOVES: Record<string, [string, string]> = {
  'toroline-o-toro-tour': ['Firm', 'Very Firm'],
  'toroline-a5': ['Med', 'Med-Soft'],
  'toroline-o-toro': ['Med-Soft', 'Medium'],
  'toroline-o-toro-octa': ['Firm', 'Very Firm'],
  'toroline-snapper': ['Soft', 'Med-Soft'],
  'solinco-tour-bite': ['Firm', 'Very Firm'],
  'solinco-hyper-g': ['Firm', 'Very Firm'],
  'yonex-poly-tour-strike': ['Med-Firm', 'Medium'],
  'yonex-poly-tour-pro': ['Med-Firm', 'Firm'],
  'yonex-poly-tour-rev': ['Med-Firm', 'Med-Soft'],
  'yonex-poly-tour-drive': ['Medium', 'Med-Soft'],
  'yonex-poly-tour-fire': ['Medium', 'Soft'],
  'yonex-poly-tour-tough': ['Med-Soft', 'Soft'],
  'restring-sync': ['Med-Firm', 'Med-Soft'],
  'grapplesnake-soldier': ['Firm', 'Med-Firm'],
  'grapplesnake-tour-m8': ['Med-Firm', 'Medium'],
  'grapplesnake-alpha': ['Medium', 'Med-Soft'],
  'grapplesnake-game-changer': ['Medium', 'Med-Soft'],
  'grapplesnake-paradox-pro': ['Med-Firm', 'Medium'],
  'grapplesnake-irukandji': ['Medium', 'Med-Soft'],
  'luxilon-alu-power-soft': ['Med', 'Med-Soft'],
  'luxilon-alu-power-spin': ['Firm', 'Med-Firm'],
  'luxilon-alu-power-feel': ['Med-Firm', 'Medium'],
  'luxilon-4g-soft': ['Med-Firm', 'Medium'],
  'luxilon-element': ['Med', 'Med-Soft'],
  'luxilon-adrenaline': ['Firm', 'Med-Firm'],
  'luxilon-m2-pro': ['Med', 'Med-Soft'],
  'tourna-big-hitter-black-7': ['Firm', 'Med-Firm'],
  'tourna-big-hitter-silver-rough': ['Med-Firm', 'Medium'],
  'tourna-pro-16': ['Firm', 'Med-Firm'],
  'tourna-quasi-gut-armor': ['Soft', 'Very Soft'],
  'tourna-pro-tour': ['Soft', 'Very Soft'],
};
/** Without a figure, only the fold. */
const FOLDS = ['toroline-vamos'];
const CHIP_MOVES = [
  'yonex-poly-tour-strike',
  'yonex-poly-tour-rev',
  'restring-sync',
  'grapplesnake-tour-m8',
  'grapplesnake-paradox-pro',
  'luxilon-alu-power-feel',
  'luxilon-4g-soft',
  'tourna-big-hitter-silver-rough',
];

const strings = read<Row[]>('strings.json');
const hybrids = read<Row[]>('hybrids.json');
assert(strings.length === 72 && hybrids.length === 10, '72 strings and 10 hybrids');

const moved: string[] = [];
const folded: string[] = [];
const chipsMoved: string[] = [];
let emptyFeel = 0;

/** The stored tokens without firm/soft, after checking the chip the band gives. */
function storedFeel(row: Row, band: string): string {
  const tokens = row.feelAttr.split(',');
  const chips = tokens.filter((t) => t === 'firm' || t === 'soft');
  assert(chips.length === 1, `${row.id}: exactly one of firm/soft`);
  // Firm or Soft sits after Crisp and before Plush and Lively; derived, it goes back there.
  const i = tokens.indexOf(chips[0]!);
  assert(i === (tokens[0] === 'crisp' ? 1 : 0), `${row.id}: firm/soft in its usual place`);
  if (chips[0] !== chipFor(band)) chipsMoved.push(row.id);
  const rest = tokens.filter((t) => t !== 'firm' && t !== 'soft').join(',');
  if (rest === '') emptyFeel++;
  return rest;
}

const newStrings = strings.map((s) => {
  const { band, figure, width } = s.stiffness;
  assert(typeof band === 'string' && figure !== undefined, `${s.id}: a v1.0 stiffness`);
  let next: Row['stiffness'];
  let derived: string;
  if (figure) {
    derived = bandFor(figure.kgPerMm);
    if (derived !== band) {
      moved.push(s.id);
      assert(
        JSON.stringify(MOVES[s.id]) === JSON.stringify([band, derived]),
        `${s.id}: ${band} -> ${derived} is not an approved move`,
      );
    }
    next = { figure, width };
  } else {
    derived = fold(band!);
    if (derived !== band) folded.push(s.id);
    next = { band: derived, figure: null, width };
  }
  return { ...s, feelAttr: storedFeel(s, derived), stiffness: next };
});
const newHybrids = hybrids.map((h) => {
  const band = h.stiffness.band!;
  assert(fold(band) === band, `${h.id}: no hybrid is "Med"`);
  return { ...h, feelAttr: storedFeel(h, band) };
});

// ---- exactly the approved moves
const same = (a: string[], b: string[]): boolean =>
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
assert(same(moved, Object.keys(MOVES)), `the 32 approved moves (got ${moved.length})`);
assert(moved.length === 32, '32 moves');
assert(same(folded, FOLDS), 'one fold, Vamos');
assert(same(chipsMoved, CHIP_MOVES), `the 8 chips (got ${chipsMoved.join(', ')})`);
assert(emptyFeel === 25, `25 rows store no feel token (got ${emptyFeel})`);
const withFigure = newStrings.filter((s) => s.stiffness.figure).length;
assert(withFigure === 62, '62 strings derive their band');
assert(
  newStrings.every((s) => 'band' in s.stiffness === (s.stiffness.figure === null)),
  'a stored band exactly when there is no figure',
);

if (process.argv.includes('--sample')) {
  const show = (was: Row, now: Row): void => {
    console.log(
      `${was.name}\n  was: ${JSON.stringify({ band: was.stiffness.band, feelAttr: was.feelAttr })}\n  now: ${JSON.stringify(now.stiffness.figure ? { band: '(derived)', feelAttr: now.feelAttr } : { band: now.stiffness.band, feelAttr: now.feelAttr })}\n`,
    );
  };
  for (const id of [
    'toroline-o-toro-tour',
    'yonex-poly-tour-rev',
    'toroline-caviar',
    'toroline-vamos',
  ]) {
    show(
      strings.find((s) => s.id === id)!,
      newStrings.find((s) => s.id === id)!,
    );
  }
  show(hybrids[0]!, newHybrids[0]!);
  console.log(
    `Checks passed: 32 approved moves, the Vamos fold, 8 chips, 62 bands derived, 25 rows with no stored feel token. Nothing written.`,
  );
} else {
  write('strings.json', newStrings);
  write('hybrids.json', newHybrids);
  console.log(`Derived ${withFigure} bands (32 moved), folded 1, moved 8 chips.`);
}
