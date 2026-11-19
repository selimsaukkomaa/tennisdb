// Normalised DOM snapshots of the app, shared by tests/visual/dom.spec.ts (the DOM baselines)
// and scripts/dom-snapshot.ts.
import type { Page } from '@playwright/test';
import { settle } from './support';

/**
 * Runs in the page; plain JS in a string because tsx would inject helpers the page lacks.
 * Comments, <script>, <style> and <link> are dropped; attributes and class tokens sorted;
 * inline styles in CSSOM form; whitespace-only text kept as a ' ' marker (it matters between
 * inline elements). Elements that do not render (display: none, or inside such an element) are
 * left out. The version tag's text is erased: it changes with every release.
 */
export const SNAPSHOT_JS = String.raw`(() => {
  const out = [];
  const DROP_TAGS = new Set(['script', 'style', 'link']);
  const walk = (node, depth) => {
    for (const child of node.childNodes) {
      const pad = '  '.repeat(depth);
      if (child.nodeType === Node.TEXT_NODE) {
        const text = (child.textContent || '').replace(/\s+/g, ' ');
        const versionTag = node.classList && node.classList.contains('version-tag');
        out.push(pad + JSON.stringify(versionTag ? 'v*' : text.trim() ? text.trim() : ' '));
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child;
      const tag = el.tagName.toLowerCase();
      if (DROP_TAGS.has(tag)) continue;
      // Only what renders: a hidden racquet, brand or panel is left out (the baselines stay small).
      if (!el.checkVisibility()) continue;
      const attrs = [];
      for (const a of el.attributes) {
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
  | { key: string }
  /** Reloads the page, keeping what it stored (the remembered racquet and strings, v1.10). */
  | { reload: true };

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

/** Clicks, typing (then waits out the 120-150 ms debounces), option picks, key presses, reloads. */
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
    } else if ('reload' in step) {
      await page.reload();
      await settle(page);
    } else {
      await page.keyboard.press(step.key);
      await page.waitForTimeout(150);
    }
  }
}
