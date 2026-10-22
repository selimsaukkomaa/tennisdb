// Dev aid for the port: writes a normalised dump of a page's live DOM after its scripts ran,
// so the legacy page and the new build can be compared with `diff -u`.
//
//   tsx scripts/dom-snapshot.ts <url> <out.txt> [clicks]
//
// `clicks` is a ';'-separated list of CSS selectors clicked in order before the snapshot,
// e.g. '#btn-racquet-percept;#percept-switcher button:nth-child(3)'.
//
// Normalisation: comments, <script>, <style> and <link> dropped; attributes and class tokens
// sorted; inline styles in CSSOM form; whitespace-only text kept as a single ' ' marker
// (it matters between inline elements). Known, intentional differences are erased:
//   - inline onclick handlers (the port uses event delegation)
//   - data-nav-* attributes (the delegation hooks that replace them)
//   - ids of per-racquet brand sections, switcher buttons and filter headers (legacy used a
//     different prefix per racquet; the port uses <racquet>-<brand>-...)
//   - data-render-section (set on three Luxilon sections, read by nothing)
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [url, out, clicks = ''] = process.argv.slice(2);
if (!url || !out) throw new Error('usage: dom-snapshot.ts <url> <out.txt> [clicks]');

// Runs in the page. Plain JS in a string: tsx would otherwise inject helpers the page lacks.
const SNAPSHOT_JS = String.raw`(() => {
  const out = [];
  const DROP_TAGS = new Set(['script', 'style', 'link']);
  const dropId = (el) => {
    if (!el.closest('[id$="-content"]')) return false;
    return el.classList.contains('brand-section') ||
      el.classList.contains('filter-brand-header') ||
      (el.tagName === 'BUTTON' && !!el.parentElement && el.parentElement.classList.contains('switcher'));
  };
  const walk = (node, depth) => {
    for (const child of node.childNodes) {
      const pad = '  '.repeat(depth);
      if (child.nodeType === Node.TEXT_NODE) {
        const text = (child.textContent || '').replace(/\s+/g, ' ');
        out.push(pad + JSON.stringify(text.trim() ? text.trim() : ' '));
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child;
      const tag = el.tagName.toLowerCase();
      if (DROP_TAGS.has(tag)) continue;
      const attrs = [];
      for (const a of el.attributes) {
        if (a.name === 'onclick' || a.name.startsWith('data-nav-')) continue;
        if (a.name === 'data-render-section') continue;
        if (a.name === 'id' && dropId(el)) continue;
        let v = a.value;
        if (a.name === 'class') v = [...el.classList].sort().join(' ');
        if (a.name === 'style') v = el.style.cssText;
        if (a.name === 'class' && !v) continue;
        attrs.push(a.name + '=' + JSON.stringify(v));
      }
      attrs.sort();
      out.push(pad + '<' + tag + (attrs.length ? ' ' + attrs.join(' ') : '') + '>');
      walk(el, depth + 1);
    }
  };
  walk(document.body, 0);
  return out;
})()`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.route(
  (u) => u.hostname !== 'localhost' && u.protocol !== 'file:',
  (r) => r.abort(),
);
await page.goto(url);
await page.waitForLoadState('load');
await page.waitForTimeout(300);
for (const selector of clicks.split(';').filter(Boolean)) {
  await page.locator(selector).first().click();
  await page.waitForTimeout(150);
}
const lines = (await page.evaluate(SNAPSHOT_JS)) as string[];

// Collapse runs of whitespace markers: adjacent text nodes are an artefact of how the
// markup was produced, not of what renders.
const collapsed = lines.filter((l, i) => !(l.trim() === '" "' && lines[i - 1]?.trim() === '" "'));
writeFileSync(out, collapsed.join('\n') + '\n', 'utf8');
console.log(`${collapsed.length} lines -> ${out}`);
await browser.close();
