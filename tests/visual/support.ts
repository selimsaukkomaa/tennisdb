// Parity harness: opens the legacy v0.990 page and the new build side by side, settles both
// the same way, and compares full-page screenshots.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  test as base,
  expect,
  type BrowserContext,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { APP_PORT, LEGACY_PORT } from '../../playwright.config';

export const LEGACY_URL = `http://localhost:${LEGACY_PORT}/tennis_equipmentdb_v0_990.html`;
export const APP_URL = `http://localhost:${APP_PORT}/`;

/** pixelmatch per-pixel colour threshold, and the share of differing pixels a view may have. */
const PIXEL_THRESHOLD = 0.1;
const MAX_DIFF_RATIO = 0.001;

/** Fixed "now", so the log form's default date and anything time-based render the same. */
const FIXED_NOW = new Date('2026-10-22T10:00:00Z');

const FONTS_DIR = new URL('../../src/assets/fonts/', import.meta.url);
const GOOGLE_CSS = readFileSync(fileURLToPath(new URL('google-fonts.css', FONTS_DIR)), 'utf8');

/** Same naming as scripts/vendor-fonts.ts: fonts.gstatic.com/s/a/v1/b.woff2 -> a-v1-b.woff2 */
function localFontName(url: string): string {
  return new URL(url).pathname.replace(/^\/s\//, '').replaceAll('/', '-');
}

/**
 * Serves Google Fonts from the vendored copies and refuses every other off-host request, so
 * both pages render the same font bytes and the suite runs offline.
 */
async function isolateNetwork(context: BrowserContext): Promise<void> {
  // Routes registered later run first.
  await context.route(
    (url) => url.hostname !== 'localhost',
    (route) => route.abort(),
  );
  await context.route(
    (url) => url.hostname === 'fonts.googleapis.com',
    (route) => route.fulfill({ contentType: 'text/css; charset=utf-8', body: GOOGLE_CSS }),
  );
  await context.route(
    (url) => url.hostname === 'fonts.gstatic.com',
    (route) =>
      route.fulfill({
        contentType: 'font/woff2',
        headers: { 'access-control-allow-origin': '*' },
        body: readFileSync(fileURLToPath(new URL(localFontName(route.request().url()), FONTS_DIR))),
      }),
  );
}

/** Waits for load, web fonts and two frames; the new build also signals data-ready. */
async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('load');
  if (page.url().startsWith(APP_URL)) {
    await page.locator('html[data-ready="1"]').waitFor({ state: 'attached' });
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  });
}

export async function open(context: BrowserContext, url: string): Promise<Page> {
  const page = await context.newPage();
  await page.goto(url);
  await settle(page);
  return page;
}

/** Which web-font families have at least one face loaded on the page. */
export async function loadedFontFamilies(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [
      ...new Set(
        [...document.fonts]
          .filter((f) => f.status === 'loaded')
          .map((f) => f.family.replace(/"/g, '')),
      ),
    ].sort(),
  );
}

export interface ShotOptions {
  /** Regions that legitimately differ (each one is a declared, changelogged difference). */
  mask?: (page: Page) => Locator[];
  /** Capture only this element instead of the full page. */
  element?: string;
}

export async function screenshot(page: Page, opts: ShotOptions = {}): Promise<Buffer> {
  await settle(page);
  const options = {
    animations: 'disabled' as const,
    caret: 'hide' as const,
    mask: opts.mask?.(page) ?? [],
    maskColor: '#ff00ff',
  };
  if (opts.element) return page.locator(opts.element).first().screenshot(options);
  return page.screenshot({ ...options, fullPage: true });
}

/** Writes a PNG under test-results/<test>/ and attaches it to the report. */
async function keep(testInfo: TestInfo, name: string, png: Buffer): Promise<void> {
  const path = testInfo.outputPath(`${name}.png`);
  writeFileSync(path, png);
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

/** Compares two screenshots; keeps both and the diff image. */
export async function expectSameRendering(
  testInfo: TestInfo,
  legacyPng: Buffer,
  appPng: Buffer,
): Promise<void> {
  await keep(testInfo, 'legacy', legacyPng);
  await keep(testInfo, 'app', appPng);
  const a = PNG.sync.read(legacyPng);
  const b = PNG.sync.read(appPng);
  expect(`${b.width}x${b.height}`, 'page size (legacy vs app)').toBe(`${a.width}x${a.height}`);
  const diff = new PNG({ width: a.width, height: a.height });
  const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {
    threshold: PIXEL_THRESHOLD,
  });
  await keep(testInfo, 'diff', PNG.sync.write(diff));
  const ratio = changed / (a.width * a.height);
  expect(ratio, `${changed} pixels differ (${(ratio * 100).toFixed(3)}%)`).toBeLessThanOrEqual(
    MAX_DIFF_RATIO,
  );
}

/** The same stringing log in v0.990's format (tennis_log_v1) and v0.991's (tennis_log_v2). */
const LOG_SEED = JSON.parse(
  readFileSync(fileURLToPath(new URL('../fixtures/log-seed.json', import.meta.url)), 'utf8'),
) as Record<string, unknown>;

/** Seeds both pages' localStorage with the fixture log before they load. */
export async function seedLog(context: BrowserContext): Promise<void> {
  await context.addInitScript(
    (items: Record<string, string>) => {
      for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
    },
    Object.fromEntries(Object.entries(LOG_SEED).map(([k, v]) => [k, JSON.stringify(v)])),
  );
}

/** Every test gets a context with the network isolated and the clock fixed. */
export const test = base.extend({
  context: async ({ context }, use) => {
    await isolateNetwork(context);
    await context.clock.setFixedTime(FIXED_NOW);
    await use(context);
  },
});

export { expect };
