// Dev aid for the port: writes a normalised dump of a page's live DOM after its scripts ran,
// so the legacy page and the new build can be compared with `diff -u`. The automated version
// of this comparison is tests/visual/dom-parity.spec.ts.
//
//   tsx scripts/dom-snapshot.ts <url> <out.txt> [steps]
//
// `steps` is a ';'-separated list run in order before the snapshot. A step is a CSS selector
// to click, `type <selector> := <text>` to type into a field (then waits out the debounce),
// `select <selector> := <value>` to pick an option, or `key <Key>` to press a key, e.g.
//   '#btn-filters;type #filter-search := hex;key Escape'
// Confirm dialogs are accepted. SEED_FILE=<json> seeds localStorage before the page loads:
// a {key: value} object, values stringified. See tests/visual/dom.ts for the normalisation.
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import { runSteps, snapshotDom, type Step } from '../tests/visual/dom';

const [url, out, steps = ''] = process.argv.slice(2);
if (!url || !out) throw new Error('usage: dom-snapshot.ts <url> <out.txt> [steps]');

function parseStep(step: string): Step {
  const typing = step.match(/^type (.+?) := (.*)$/);
  if (typing) return { type: [typing[1]!, typing[2]!] };
  const choose = step.match(/^select (.+?) := (.*)$/);
  if (choose) return { select: [choose[1]!, choose[2]!] };
  const key = step.match(/^key (.+)$/);
  if (key) return { key: key[1]! };
  return step;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.route(
  (u) => u.hostname !== 'localhost' && u.protocol !== 'file:',
  (r) => r.abort(),
);
page.on('dialog', (d) => void d.accept());
if (process.env.SEED_FILE) {
  const seed = JSON.parse(readFileSync(process.env.SEED_FILE, 'utf8')) as Record<string, unknown>;
  await page.addInitScript(
    (items: Record<string, string>) => {
      for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
    },
    Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)])),
  );
}
await page.goto(url);
await page.waitForLoadState('load');
await page.waitForTimeout(300);
await runSteps(page, steps.split(';').filter(Boolean).map(parseStep));
const lines = await snapshotDom(page);
writeFileSync(out, lines.join('\n') + '\n', 'utf8');
console.log(`${lines.length} lines -> ${out}`);
await browser.close();
