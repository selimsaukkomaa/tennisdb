// Phase 2 step 3, fourth release (docs/phase-2-data-model.md, D8): feel tags store their label,
// and the colour comes from a table (src/core/tags.ts). One-off, kept for provenance; the tests
// import GRIP_TAG_CHANGES to apply the same change to legacy v0.990 (patch I).
//
//   { label: "Tacky", variant: "crisp" }  ->  "Tacky"   (Tacky is red, "firm", for every grip)
//
// Strings and hybrids keep every colour (v0.990's table already held). On the grips, four labels
// had two colours; the owner chose the majority colour for each on 2026-11-18 (scheme A), which
// changes exactly the five tags below.
//
// Before writing, it asserts that every string, hybrid and grip tag has its table's colour except
// those five, and the number of tags.
//
//   tsx scripts/derive-tag-colours.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/derive-tag-colours.ts            migrates strings, hybrids and grips
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GRIP_TAG_COLOURS, STRING_TAG_COLOURS } from '../src/core/tags';

/** The five grip tags whose colour changes: the odd ones out under each label. */
export const GRIP_TAG_CHANGES: readonly {
  gripId: string;
  label: string;
  from: string;
  to: string;
}[] = [
  { gripId: 'kimony-forte', label: 'Firm', from: 'firm', to: 'crisp' },
  { gripId: 'kimony-tourna', label: 'Classic', from: 'crisp', to: 'firm' },
  { gripId: 'yonex-dry-grap', label: 'Dry', from: 'crisp', to: 'round' },
  { gripId: 'tourna-tac', label: 'Tacky', from: 'crisp', to: 'firm' },
  { gripId: 'tourna-tourna-grip-original', label: 'Classic', from: 'crisp', to: 'firm' },
];

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

function main(): void {
  const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
  const read = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
  const write = (f: string, v: unknown): void =>
    writeFileSync(join(DATA, f), `${JSON.stringify(v, null, 2)}\n`);
  type Tag = { label: string; variant: string };
  type Row = { id: string; name: string; feelTags: Tag[] | string[] };

  const strings = read<Row[]>('strings.json');
  const hybrids = read<Row[]>('hybrids.json');
  const grips = read<Record<string, Record<string, Row[]>>>('grips.json');
  const gripRows = Object.values(grips).flatMap((byType) => Object.values(byType).flat());
  assert(
    strings.length === 72 && hybrids.length === 10 && gripRows.length === 35,
    '72 strings, 10 hybrids, 35 grips',
  );

  const changed: string[] = [];
  let tags = 0;
  const convert = (rows: Row[], table: Record<string, string>, isGrip: boolean): void => {
    for (const r of rows) {
      r.feelTags = (r.feelTags as Tag[]).map((t) => {
        tags++;
        const colour = table[t.label];
        assert(colour !== undefined, `${r.id}: "${t.label}" has a colour in its table`);
        if (colour !== t.variant) {
          const expected =
            isGrip && GRIP_TAG_CHANGES.find((c) => c.gripId === r.id && c.label === t.label);
          assert(
            !!expected && expected.from === t.variant && expected.to === colour,
            `${r.id}: "${t.label}" ${t.variant} -> ${colour} is not an approved change`,
          );
          changed.push(`${r.id}/${t.label}`);
        }
        return t.label;
      });
    }
  };
  convert(strings, STRING_TAG_COLOURS, false);
  convert(hybrids, STRING_TAG_COLOURS, false);
  convert(gripRows, GRIP_TAG_COLOURS, true);
  assert(changed.length === 5, `exactly the 5 approved grip tags change (got ${changed.length})`);
  console.log(`${tags} tags checked`);

  if (process.argv.includes('--sample')) {
    const show = (r: Row) => console.log(`${r.name}: ${JSON.stringify(r.feelTags)}`);
    show(strings[0]!);
    show(hybrids[0]!);
    for (const c of GRIP_TAG_CHANGES) {
      const g = gripRows.find((x) => x.id === c.gripId)!;
      console.log(`${g.name}: ${JSON.stringify(g.feelTags)}  (${c.label}: ${c.from} -> ${c.to})`);
    }
    console.log(
      'Checks passed: every tag has its table colour except the 5 approved grip tags. Nothing written.',
    );
  } else {
    write('strings.json', strings);
    write('hybrids.json', hybrids);
    write('grips.json', grips);
    console.log('Feel tags now store their label; 5 grip tags change colour.');
  }
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') main();
