// Normalised DOM snapshots for comparing the legacy page and the new build, shared by
// tests/visual/dom-parity.spec.ts and scripts/dom-snapshot.ts.
import type { Page } from '@playwright/test';

/**
 * Runs in the page; plain JS in a string because tsx would inject helpers the page lacks.
 * Comments, <script>, <style> and <link> are dropped; attributes and class tokens sorted;
 * inline styles in CSSOM form; whitespace-only text kept as a ' ' marker (it matters between
 * inline elements). Structural differences of the port are erased here:
 *   - inline onclick handlers (the port uses event delegation) and the data-nav-* hooks
 *   - ids of per-racquet brand sections, switcher buttons and filter headers (legacy used a
 *     different prefix per racquet; the port uses <racquet>-<brand>-...)
 *   - data-render-section (on three Luxilon sections in legacy, read by nothing)
 */
export const SNAPSHOT_JS = String.raw`(() => {
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

/** The page's normalised DOM, one line per node. */
export async function snapshotDom(page: Page): Promise<string[]> {
  const lines = (await page.evaluate(SNAPSHOT_JS)) as string[];
  // Runs of whitespace markers come from how the markup was produced, not from what renders.
  return lines.filter((l, i) => !(l.trim() === '" "' && lines[i - 1]?.trim() === '" "'));
}

export type Step =
  | string
  | { type: [selector: string, text: string] }
  | { select: [selector: string, value: string] }
  | { key: string };

/**
 * Types into a field. The palette focuses its field and selects the text 10 ms after opening
 * (v0.990 and the app alike), so typing there waits for that first: a selection made after
 * the first keys would be replaced by the next one ("caviar" became "viar" under load).
 */
export async function typeInto(page: Page, selector: string, text: string): Promise<void> {
  if (selector === '#search-input') {
    await page.waitForFunction("document.activeElement?.id === 'search-input'");
  }
  await page.locator(selector).first().pressSequentially(text);
}

/** Clicks, typing (then waits out the 120-150 ms debounces), option picks and key presses. */
export async function runSteps(page: Page, steps: readonly Step[]): Promise<void> {
  for (const step of steps) {
    if (typeof step === 'string') {
      await page.locator(step).first().click();
      await page.waitForTimeout(150);
    } else if ('type' in step) {
      await typeInto(page, step.type[0], step.type[1]);
      await page.waitForTimeout(400);
    } else if ('select' in step) {
      await page.locator(step.select[0]).first().selectOption(step.select[1]);
      await page.waitForTimeout(150);
    } else {
      await page.keyboard.press(step.key);
      await page.waitForTimeout(150);
    }
  }
}

const indent = (line: string | undefined): number => (line ?? '').search(/\S|$/);

/**
 * Erases the declared differences from legacy since v0.991 (each one listed in CHANGELOG.md):
 *   - the version tag's text (v0.990 vs the app version)
 *   - the log panel's Export / Import buttons, and the footer they leave on an empty log
 *   - log entry ids (v0.990 made "<timestamp>-<random>" ids; v2 uses UUIDs)
 */
export function eraseDeclaredDifferences(lines: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^\s*"v\d+\.\d+"$/.test(line) && lines[i - 1]?.includes('class="version-tag"')) continue;
    if (line.includes('<span class="log-backup">')) {
      while (indent(lines[i + 1]) > indent(line)) i++;
      continue;
    }
    out.push(line.replace(/(data-entry-id|data-form-id)="[^"]*"/g, '$1="*"'));
  }
  return out.filter(
    (l, i) => !(l.includes('<div class="log-panel-footer">') && indent(out[i + 1]) <= indent(l)),
  );
}

/** Empty when equal; otherwise where the two snapshots first diverge, with context. */
export function describeDifference(legacy: readonly string[], app: readonly string[]): string {
  const n = Math.max(legacy.length, app.length);
  let i = 0;
  while (i < n && legacy[i] === app[i]) i++;
  if (i === n) return '';
  const around = (lines: readonly string[]): string =>
    lines
      .slice(Math.max(0, i - 3), i + 4)
      .map((l, k) => `${Math.max(0, i - 3) + k === i ? '>' : ' '} ${l}`)
      .join('\n');
  return `DOM differs at line ${i + 1} (legacy ${legacy.length} lines, app ${app.length})\n--- legacy\n${around(legacy)}\n--- app\n${around(app)}`;
}
