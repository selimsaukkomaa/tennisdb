// Runs the data validators against the files on disk. Used by `npm run validate`, the Vite
// plugin in vite.config.ts (every dev start and build) and the Vitest suite.
//
// Besides src/core/validate.ts's invariants it checks the files themselves: data and copy are
// UTF-8 with characters like × – · written as-is (never \u escapes), and source code and markup
// use straight quotes only.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLLECTIONS } from '../src/core/db';
import type { Copy, TennisDb } from '../src/core/types';
import { validateData, type Issue } from '../src/core/validate';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const read = (rel: string): string => readFileSync(join(ROOT, rel), 'utf8');

function filesUnder(dir: string, ext: RegExp): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((name) => {
    const rel = join(dir, name);
    return statSync(join(ROOT, rel)).isDirectory()
      ? filesUnder(rel, ext)
      : ext.test(name)
        ? [rel]
        : [];
  });
}

/** Data and copy as they are on disk now (not the bundled copies). */
export function loadFromDisk(): { db: TennisDb; copy: Copy; css: string } {
  const db = { version: JSON.parse(read('data/meta.json')).version } as TennisDb;
  for (const c of COLLECTIONS) {
    (db as unknown as Record<string, unknown>)[c] = JSON.parse(read(`data/${c}.json`));
  }
  const copy = JSON.parse(read('content/copy.json')) as Copy;
  const css = filesUnder('src/styles', /\.css$/)
    .map(read)
    .join('\n');
  return { db, copy, css };
}

// Built from code points: Prettier rewrites \u escapes in literals into the characters.
const SMART_QUOTES = new RegExp(`[${String.fromCharCode(0x2018, 0x2019, 0x201c, 0x201d)}]`);
const UNICODE_ESCAPE = /\\u[0-9a-fA-F]{4}/;

export function fileIssues(): Issue[] {
  const issues: Issue[] = [];
  for (const rel of [...filesUnder('data', /\.json$/), 'content/copy.json']) {
    const bytes = readFileSync(join(ROOT, rel));
    if (!new TextDecoder('utf-8', { fatal: true }).decode(bytes)) continue;
    if (UNICODE_ESCAPE.test(bytes.toString('utf8'))) {
      issues.push({
        rule: 'utf8-literal',
        where: rel,
        message: 'contains \\u escapes; write the characters as-is',
      });
    }
  }
  const code = [
    ...filesUnder('src', /\.(ts|css)$/),
    ...filesUnder('scripts', /\.ts$/),
    ...filesUnder('tests', /\.ts$/),
    'index.html',
  ];
  for (const rel of code) {
    read(rel)
      .split('\n')
      .forEach((line, i) => {
        if (SMART_QUOTES.test(line)) {
          issues.push({
            rule: 'straight-quotes',
            where: `${rel}:${i + 1}`,
            message: 'smart quote in code or markup',
          });
        }
      });
  }
  return issues;
}

export function collectIssues(): Issue[] {
  const { db, copy, css } = loadFromDisk();
  return [...validateData(db, copy, css), ...fileIssues()];
}

export function formatIssues(issues: Issue[]): string {
  return issues.map((i) => `  [${i.rule}] ${i.where}: ${i.message}`).join('\n');
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') {
  const issues = collectIssues();
  if (issues.length) {
    console.error(`Data validation failed (${issues.length}):\n${formatIssues(issues)}`);
    process.exit(1);
  }
  console.log('Data validation passed.');
}
