// Phase 2 step 2, third move (docs/phase-2-data-model.md, D4): racquet fields as values.
// One-off, kept for provenance.
//
//   headSize: "100 sq in"  ->  headSizeSqIn: 100     (sq in, the owner's pick for D4)
//   pattern:  "16×19"      ->  pattern: { mains: 16, crosses: 19 }
//   label                  ->  dropped; it is always `${brand} ${model}`
//
// Before writing, it asserts three racquets, and that each record's label and its
// context-line spec ("64 RA · 16×19 · 100 sq in") print back exactly from the new fields.
//
//   tsx scripts/migrate-racquets.ts --sample   prints the result, writes nothing
//   tsx scripts/migrate-racquets.ts            migrates data/racquets.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'racquets.json');

interface Old {
  id: string;
  brand: string;
  model: string;
  headSize: string;
  pattern: string;
  ra: number;
  label: string;
}

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

const old = JSON.parse(readFileSync(FILE, 'utf8')) as Old[];
assert(old.length === 3, `3 racquets (got ${old.length})`);

const migrated = old.map((r) => {
  const head = r.headSize.match(/^(\d+) sq in$/);
  const pattern = r.pattern.match(/^(\d+)×(\d+)$/);
  assert(!!head, `${r.id}: head size "${r.headSize}"`);
  assert(!!pattern, `${r.id}: pattern "${r.pattern}"`);
  const next = {
    id: r.id,
    brand: r.brand,
    model: r.model,
    headSizeSqIn: Number(head![1]),
    pattern: { mains: Number(pattern![1]), crosses: Number(pattern![2]) },
    ra: r.ra,
  };
  // What src/core/labels.ts will derive must equal what the data held.
  const label = `${next.brand} ${next.model}`;
  const spec = `${next.ra} RA · ${next.pattern.mains}×${next.pattern.crosses} · ${next.headSizeSqIn} sq in`;
  assert(label === r.label, `${r.id}: label "${label}" vs stored "${r.label}"`);
  assert(spec === `${r.ra} RA · ${r.pattern} · ${r.headSize}`, `${r.id}: spec "${spec}"`);
  return { next, label, spec };
});

if (process.argv.includes('--sample')) {
  for (const { next, label, spec } of migrated) {
    console.log(JSON.stringify(next, null, 2));
    console.log(`  prints as: "${label}" and "${spec}"\n`);
  }
  console.log(
    'Checks passed: 3 racquets; every label and spec prints back exactly. Nothing written.',
  );
} else {
  writeFileSync(
    FILE,
    `${JSON.stringify(
      migrated.map((m) => m.next),
      null,
      2,
    )}\n`,
  );
  console.log(`Migrated ${migrated.length} racquets.`);
}
