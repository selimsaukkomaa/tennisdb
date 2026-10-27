// The v0.990 smoke checks that read the page's source text (everything outside the data
// blob). The port's equivalent of the shipped page is the production build, so this builds
// the app and scans its HTML, JS and CSS.
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'vite';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { assembleDb } from '../../src/core/db';

let outDir = '';
let shipped = '';
let shippedCss = '';

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? filesUnder(p) : [p];
  });
}

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), 'tennisdb-shipped-'));
  await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } });
  const files = filesUnder(outDir).filter((f) => /\.(html|js|css)$/.test(f));
  shipped = files.map((f) => readFileSync(f, 'utf8')).join('\n');
  shippedCss = files
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
}, 60_000);

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

describe('dead code gone from the shipped app', () => {
  test.each([
    'topPick',
    'toppick',
    'tag-top',
    'filter-chip-top',
    'gut-row-top',
    'gut-toppick',
    'Top Pick',
    'summary-section',
    'summary-card',
    'tr.highlight',
    'class="highlight"',
  ])('%s', (needle) => {
    expect(shipped).not.toContain(needle);
  });

  test('string rec-box filter code gone', () => {
    expect(/(?<!g)filter-hide-rec/.test(shipped)).toBe(false);
  });

  test('grip rec-box filter code kept', () => {
    expect(shipped).toContain('gfilter-hide-rec');
  });

  test('no "Connected" anywhere', () => {
    expect(/Connected/.test(shipped)).toBe(false);
  });
});

describe('every tag variant has CSS', () => {
  const db = assembleDb();
  const variants = [
    ...new Set([...db.strings, ...db.hybrids].flatMap((r) => r.feelTags.map((t) => t.variant))),
  ];
  test('six variants in use', () => expect(variants).toHaveLength(6));
  test.each(variants)('.tag-%s', (v) => {
    expect(shippedCss).toContain(`.tag-${v} {`);
  });
});
