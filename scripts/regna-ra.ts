// v1.11: the Regna 100's RA corrected from 64 to 65 (the owner's call, 2026-11-19). The specs
// check for the common rackets took Tennis Warehouse's strung stiffness as the source for every
// frame; it measures the Regna 100 at 65, and v0.990's 64 had no recorded source. One-off, kept
// for provenance; the round trip imports the edits to apply them to v0.990's data.
//
// The racket's `ra` in racquets.json, and "64 RA" in the 67 Regna notes that cite it ("In the
// 64 RA frame…", "Full bed in the 64 RA frame…"). A plain swap of the figure: the owner chose no
// parenthetical in the notes; the changelog lists the correction.
//
// Before writing, it asserts that the racket stands at 64, that the notes citing "64 RA" are
// exactly the 67 listed (each once, all Regna pairings), and that no "64 RA" is left in data/ or
// content/ afterwards. With --sample it prints five notes before and after and writes nothing.
//
//   tsx scripts/regna-ra.ts --sample
//   tsx scripts/regna-ra.ts
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { textValues } from './racket-spelling';
import { applyOnce, type TextEdit } from './stiffness-words';

export const REGNA_RA = { racquet: 'regna', from: 64, to: 65 } as const;

/** The Regna pairings whose note cites the figure, in pairings.json order. */
export const REGNA_RA_NOTE_IDS: readonly string[] = [
  'toroline-o-toro-tour',
  'toroline-caviar',
  'toroline-a5-infrared',
  'toroline-o-toro',
  'toroline-o-toro-octa',
  'toroline-wasabi',
  'toroline-toro-toro',
  'toroline-snapper',
  'toroline-super-toro',
  'toroline-truffle-x',
  'toroline-o-toro-snap-tour-flex',
  'solinco-tour-bite',
  'solinco-confidential',
  'solinco-confidential-soft',
  'solinco-hyper-g',
  'solinco-mach-10',
  'solinco-tour-bite-soft',
  'solinco-hyper-g-soft',
  'solinco-revolution',
  'solinco-tb-diamond-rough',
  'solinco-hyper-g-round',
  'solinco-barb-wire',
  'solinco-outlast',
  'yonex-poly-tour-spin',
  'yonex-poly-tour-strike',
  'yonex-poly-tour-rev',
  'yonex-poly-tour-drive',
  'yonex-poly-tour-force',
  'yonex-poly-tour-fire',
  'yonex-poly-tour-air',
  'yonex-poly-tour-tough',
  'restring-vivo',
  'restring-zero',
  'restring-slap-ltd-edition',
  'grapplesnake-tour-sniper',
  'grapplesnake-soldier',
  'grapplesnake-tour-m8',
  'grapplesnake-alpha',
  'grapplesnake-aspera-triplum',
  'grapplesnake-game-changer',
  'grapplesnake-paradox-pro',
  'grapplesnake-tour-mako',
  'grapplesnake-tour-mako-short-fin',
  'luxilon-alu-power',
  'luxilon-alu-power-rough',
  'luxilon-alu-power-soft',
  'luxilon-alu-power-spin',
  'luxilon-alu-power-feel',
  'luxilon-4g',
  'luxilon-4g-rough',
  'luxilon-4g-soft',
  'luxilon-element',
  'luxilon-adrenaline',
  'luxilon-m2-pro',
  'luxilon-eco-power',
  'tourna-big-hitter-black-7',
  'tourna-big-hitter-blue-rough',
  'tourna-big-hitter-silver-rough',
  'tourna-pro-16',
  'tourna-quasi-gut-armor',
  'tourna-pro-tour',
  'toroline-k-pop',
  'toroline-dreddy',
  'toroline-101',
  'toroline-o-snap',
  'toroline-what-the-hybrid',
  'toroline-cole',
];

const FROM = `${REGNA_RA.from} RA`;
const TO = `${REGNA_RA.to} RA`;

/** One edit per note: the figure, once. */
export const REGNA_RA_EDITS: readonly TextEdit[] = REGNA_RA_NOTE_IDS.map((id) => ({
  id,
  field: 'note',
  racquet: REGNA_RA.racquet,
  from: FROM,
  to: TO,
}));

/** The five shown to the owner before the full run (first, quarters, last). */
const SAMPLE = [0, 16, 33, 50, 66];

function assert(ok: boolean, message: string): asserts ok {
  if (!ok) throw new Error(`regna-ra: ${message}`);
}

interface Pairing {
  itemId: string;
  racquetId: string;
  note: string;
}

function main(): void {
  const sample = process.argv.includes('--sample');
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const read = (f: string): unknown => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));
  const racquets = read('data/racquets.json') as { id: string; ra: number }[];
  const pairings = read('data/pairings.json') as Pairing[];

  // ---- the racket
  const regna = racquets.filter((r) => r.id === REGNA_RA.racquet);
  assert(regna.length === 1, 'one Regna 100 in racquets.json');
  assert(regna[0]!.ra === REGNA_RA.from, `the Regna 100 at ${REGNA_RA.from} RA`);

  // ---- the notes: exactly the listed 67, each a Regna pairing citing the figure once
  assert(REGNA_RA_NOTE_IDS.length === 67, '67 notes listed');
  assert(new Set(REGNA_RA_NOTE_IDS).size === 67, 'no id listed twice');
  const citing = pairings.filter((p) => p.note.includes(FROM));
  assert(
    citing.every((p) => p.racquetId === REGNA_RA.racquet),
    `"${FROM}" only in Regna notes`,
  );
  assert(
    citing.map((p) => p.itemId).join() === REGNA_RA_NOTE_IDS.join(),
    'the notes citing the figure are the 67 listed, in order',
  );
  const byId = new Map(citing.map((p) => [p.itemId, p]));

  if (sample) {
    for (const i of SAMPLE) {
      const p = byId.get(REGNA_RA_NOTE_IDS[i]!)!;
      console.log(
        `\n${p.itemId}\n  now: ${p.note}\n  new: ${applyOnce(p.note, REGNA_RA_EDITS[i]!)}`,
      );
    }
    console.log(`\nregna-ra --sample: ${SAMPLE.length} of 67 notes shown, nothing written`);
    return;
  }

  regna[0]!.ra = REGNA_RA.to;
  for (const e of REGNA_RA_EDITS) {
    const p = byId.get(e.id)!;
    p.note = applyOnce(p.note, e);
  }

  // ---- none left anywhere a reader can see
  const files = [
    'data/brandsStrings.json',
    'data/grips.json',
    'data/gutHybrids.json',
    'data/gutStrings.json',
    'data/hybrids.json',
    'data/meta.json',
    'data/strings.json',
    'content/copy.json',
  ];
  const left = [
    ...textValues(pairings, 'pairings'),
    ...files.flatMap((f) => textValues(read(f), f)),
  ].filter(([, t]) => t.includes(FROM));
  assert(left.length === 0, `"${FROM}" left in ${left.map(([p]) => p).join(', ')}`);

  writeFileSync(join(ROOT, 'data/racquets.json'), `${JSON.stringify(racquets, null, 2)}\n`);
  writeFileSync(join(ROOT, 'data/pairings.json'), `${JSON.stringify(pairings, null, 2)}\n`);
  console.log(`regna-ra: the Regna 100 at ${REGNA_RA.to} RA, and 67 notes changed`);
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') main();
