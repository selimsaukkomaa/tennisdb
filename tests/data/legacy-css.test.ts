// src/styles is v0.990's <style> block split verbatim; imported in index.css order, the files
// must concatenate back to the original.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const read = (rel: string): string =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

test('split stylesheets concatenate to the legacy <style> block', () => {
  const legacy = read('../../legacy/tennis_equipmentdb_v0_990.html');
  const styleBody = legacy.match(/<style>\n([\s\S]*?)<\/style>/)![1]!;
  const imports = [...read('../../src/styles/index.css').matchAll(/@import '\.\/([\w-]+\.css)';/g)]
    .map((m) => m[1]!)
    .filter((f) => f !== 'fonts.css');
  expect(imports).toHaveLength(8);
  const joined = imports.map((f) => read(`../../src/styles/${f}`)).join('');
  expect(joined).toBe(styleBody);
});
