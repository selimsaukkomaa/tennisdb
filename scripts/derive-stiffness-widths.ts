// Phase 2 step 3, third release (docs/phase-2-data-model.md, D3): stiffness bars on one scale
// for every brand, derived, no longer stored. One-off, kept for provenance; the tests import the
// footer sentences to apply the same change to legacy v0.990 (patch H) and to its copy.
//
//   strings:  { figure: {...}, width: 88 }          ->  { figure: {...} }
//             { band: "Medium", figure: null, width: 62 }  ->  { band: "Medium", figure: null }
//   hybrids:  { band: "Med-Firm", width: 75 }        ->  { band: "Med-Firm" }
//   footers:  "Bars are relative within the Toroline lineup."
//         ->  "Stiffness bars share one scale across every brand, 0.55 to 1.15 kg/mm; a string
//              without a figure is drawn at its band's midpoint. The rating bars are relative
//              within the Toroline lineup."
//
// The width is stiffnessWidth() in src/core/stiffness.ts: 0.55 kg/mm at 10%, 1.15 at 100%,
// linear, at least 4%; a string without a figure and every hybrid at its band's midpoint. The
// owner approved the scale on 2026-11-04 and the preview, the footer wording (A) and hybrids at
// their band's midpoint on 2026-11-18.
//
// Before writing, it asserts how many bars change (68 of 72 strings, all 10 hybrids), the
// widths at the ends of the scale, and that each footer holds its sentence exactly once.
//
//   tsx scripts/derive-stiffness-widths.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/derive-stiffness-widths.ts            migrates strings, hybrids and copy.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stiffnessWidth } from '../src/core/stiffness';

/** The footer sentence about bars, before and after, for a brand's display name. */
export const OLD_BAR_SENTENCE = (brand: string): string =>
  `Bars are relative within the ${brand} lineup.`;
export const NEW_BAR_SENTENCE = (brand: string): string =>
  `Stiffness bars share one scale across every brand, 0.55 to 1.15 kg/mm; a string without a figure is drawn at its band's midpoint. The rating bars are relative within the ${brand} lineup.`;

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

function main(): void {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const read = <T>(f: string): T => JSON.parse(readFileSync(join(ROOT, f), 'utf8')) as T;
  const write = (f: string, v: unknown): void =>
    writeFileSync(join(ROOT, f), `${JSON.stringify(v, null, 2)}\n`);
  type Row = { id: string; name: string; brand: string; stiffness: Record<string, unknown> };
  type Footer = { default: string; byRacquet?: Record<string, string> };

  const strings = read<Row[]>('data/strings.json');
  const hybrids = read<Row[]>('data/hybrids.json');
  const brands = read<Record<string, { name: string }>>('data/brandsStrings.json');
  const copy = read<{ brandFooters: Record<string, Footer> }>('content/copy.json');
  assert(strings.length === 72 && hybrids.length === 10, '72 strings and 10 hybrids');

  const report: string[] = [];
  const migrate = (rows: Row[]): { rows: Row[]; changed: string[] } => {
    const changed: string[] = [];
    const out = rows.map((r) => {
      const { width, ...rest } = r.stiffness;
      assert(typeof width === 'number', `${r.id}: a stored width`);
      const next = stiffnessWidth(rest as Parameters<typeof stiffnessWidth>[0]);
      if (next !== width) changed.push(r.id);
      report.push(`${r.name}: ${String(width)} -> ${next}`);
      return { ...r, stiffness: rest };
    });
    return { rows: out, changed };
  };
  const s = migrate(strings);
  const h = migrate(hybrids);
  assert(s.changed.length === 68, `68 string bars change (got ${s.changed.length})`);
  const unchanged = strings.map((x) => x.id).filter((id) => !s.changed.includes(id));
  assert(
    JSON.stringify(unchanged.sort()) ===
      JSON.stringify([
        'luxilon-alu-power-soft',
        'luxilon-element',
        'luxilon-m2-pro',
        'solinco-confidential',
      ]),
    `the four unchanged bars (got ${unchanged.join(', ')})`,
  );
  assert(h.changed.length === 10, 'all 10 hybrid bars change');
  const widthOf = (id: string): number =>
    stiffnessWidth(
      s.rows.find((x) => x.id === id)!.stiffness as Parameters<typeof stiffnessWidth>[0],
    );
  assert(widthOf('tourna-pro-tour') === 10, 'Pro Tour, 0.55 kg/mm, at 10%');
  assert(widthOf('grapplesnake-tour-mako') === 4, 'Tour Mako, 0.45 kg/mm, at the 4% minimum');
  assert(
    widthOf('yonex-poly-tour-force') === 79,
    "Poly Tour Force, no figure, at Med-Firm's midpoint",
  );
  for (const id of [
    'yonex-poly-tour-pro',
    'restring-vivo',
    'grapplesnake-tour-sniper',
    'luxilon-alu-power',
  ]) {
    assert(widthOf(id) === 85, `${id}: 1.05 kg/mm at 85% in every brand`);
  }

  // ---- footers
  let footers = 0;
  for (const [brand, f] of Object.entries(copy.brandFooters)) {
    const name = brands[brand]!.name;
    const swap = (text: string): string => {
      const n = text.split(OLD_BAR_SENTENCE(name)).length - 1;
      assert(n === 1, `${brand} footer holds its bar sentence once (got ${n})`);
      footers++;
      return text.replace(OLD_BAR_SENTENCE(name), () => NEW_BAR_SENTENCE(name));
    };
    f.default = swap(f.default);
    for (const r of Object.keys(f.byRacquet ?? {})) f.byRacquet![r] = swap(f.byRacquet![r]!);
  }
  assert(footers === 7, `7 footers (5 brands, 2 with a Pro Tour 630 variant), got ${footers}`);

  if (process.argv.includes('--sample')) {
    for (const name of ['O-Toro Tour', 'Poly Tour Force', 'Tour Mako', 'ALU Power', 'K-Pop']) {
      console.log(report.find((l) => l.startsWith(`${name}:`)));
    }
    console.log(`\nToroline footer:\n  ${copy.brandFooters.toroline!.default}`);
    console.log(
      '\nChecks passed: 68 of 72 string bars and all 10 hybrid bars change, the scale ends hold, 1.05 kg/mm at 85% in every brand, 7 footers. Nothing written.',
    );
  } else {
    write('data/strings.json', s.rows);
    write('data/hybrids.json', h.rows);
    write('content/copy.json', copy);
    console.log('Derived 82 stiffness bars (78 changed) and updated 7 footers.');
  }
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') main();
