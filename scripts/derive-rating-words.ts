// Phase 2 step 4, second half (docs/phase-2-data-model.md, D5): rating words derived from the
// score on two scales (src/core/ratings.ts), no longer stored. One-off, kept for provenance.
//
//   { score: 38, label: "Low-Med" }  ->  38
//
// on every string, hybrid, grip and gut-pairing rating. The owner chose the two scales on
// 2026-11-18 (option A) after a sample of five and before-and-after screenshots. Before
// writing, it asserts 458 ratings, how many words change (137, of which 15 only change
// spelling), and the change on each of the five sample ratings.
//
//   tsx scripts/derive-rating-words.ts --sample   prints the sample, writes nothing
//   tsx scripts/derive-rating-words.ts            migrates strings, hybrids, grips, gutHybrids
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ratingLabel, type RatingAxis } from '../src/core/ratings';

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

/** Today's spellings of the scales' own words. */
const SPELLING: Record<string, string> = {
  Moderate: 'Medium',
  'Mod-High': 'Med-High',
  'Low-Mod': 'Low-Med',
  'Med-Low': 'Low-Med',
  Med: 'Medium',
  'High (Slice)': 'High',
};

function main(): void {
  const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
  const read = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
  const write = (f: string, v: unknown): void =>
    writeFileSync(join(DATA, f), `${JSON.stringify(v, null, 2)}\n`);
  type Rec = Record<string, unknown> & { id: string; name?: string };
  type Old = { score: number; label: string };

  const strings = read<Rec[]>('strings.json');
  const hybrids = read<Rec[]>('hybrids.json');
  const grips = read<Record<string, Record<string, Rec[]>>>('grips.json');
  const gut = read<Rec[]>('gutHybrids.json');
  const gripRows = Object.values(grips).flatMap((t) => Object.values(t).flat());

  let total = 0;
  let changed = 0;
  let spelling = 0;
  const changes: string[] = [];
  const convert = (rows: Rec[], fields: [string, RatingAxis][], optional = false): void => {
    for (const r of rows) {
      for (const [field, axis] of fields) {
        const old = r[field] as Old | null | undefined;
        if (old === null || old === undefined) {
          assert(optional, `${r.id}: ${field}`);
          continue;
        }
        assert(Object.keys(old).join() === 'score,label', `${r.id}.${field} is { score, label }`);
        total++;
        const word = ratingLabel(axis, old.score);
        if (word !== old.label) {
          changed++;
          if (SPELLING[old.label] === word) spelling++;
          changes.push(`${r.id}/${field}: ${old.label} -> ${word} (${old.score})`);
        }
        r[field] = old.score;
      }
    }
  };
  convert(strings, [
    ['power', 'power'],
    ['spin', 'spin'],
    ['control', 'control'],
    ['comfort', 'comfort'],
  ]);
  convert(hybrids, [
    ['power', 'power'],
    ['spin', 'spin'],
  ]);
  convert(
    gripRows,
    [
      ['tackiness', 'tackiness'],
      ['absorption', 'absorption'],
      ['durability', 'durability'],
    ],
    true,
  );
  convert(
    gut,
    [
      ['power', 'power'],
      ['spin', 'spin'],
      ['comfort', 'comfort'],
      ['gutProtection', 'gutProtection'],
    ],
    true,
  );

  assert(total === 458, `458 ratings (got ${total})`);
  assert(changed === 137, `137 words change (got ${changed})`);
  assert(spelling === 15, `15 of them only in spelling (got ${spelling})`);
  const SAMPLE = [
    'toroline-enso-pro-carbon/spin: Moderate -> Med-High (60)',
    'luxilon-alu-power/power: Med-Low -> Medium (50)',
    'toroline-vamos/control: Very High -> Very Good (85)',
    'toroline-o-toro/comfort: High -> Very Good (82)',
    'kimony-punch-perforated/absorption: Excellent -> Very High (93)',
  ];
  for (const s of SAMPLE) assert(changes.includes(s), `sample: ${s}`);

  if (process.argv.includes('--sample')) {
    console.log(SAMPLE.join('\n'));
    console.log(
      `\nChecks passed: ${total} ratings, ${changed} words change (${spelling} only in spelling). Nothing written.`,
    );
  } else {
    write('strings.json', strings);
    write('hybrids.json', hybrids);
    write('grips.json', grips);
    write('gutHybrids.json', gut);
    console.log(`Ratings are scores; ${changed} of ${total} words change.`);
  }
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') main();
