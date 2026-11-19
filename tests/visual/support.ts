// Browser-suite harness: opens the app the same way every time (network isolated, clock fixed,
// fonts loaded, two frames settled), so its screenshots and DOM can be compared with the approved
// baselines in tests/visual/baselines. Until v1.7 the suite compared the app with legacy v0.990
// instead; that comparison was retired with the redesign (CHANGELOG.md, v1.7).
import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { APP_PORT } from '../../playwright.config';

export const APP_URL = `http://localhost:${APP_PORT}/`;

/** Fixed "now", so anything time-based renders the same. */
const FIXED_NOW = new Date('2026-10-22T10:00:00Z');

/** What navigator.platform reports in every test. */
const PLATFORM = 'MacIntel';

/** Waits for load, the app's data-ready signal, web fonts and two frames. */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('load');
  await page.locator('html[data-ready="1"]').waitFor({ state: 'attached' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  });
}

/** Opens the app and settles it. */
export async function open(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await page.goto(APP_URL);
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

/** Every test gets a context that can reach only the local server, with the clock fixed. */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(
      (url) => url.hostname !== 'localhost',
      (route) => route.abort(),
    );
    await context.clock.setFixedTime(FIXED_NOW);
    // The palette shows its shortcut as "⌘K" on a Mac and "Ctrl K" elsewhere; pin the platform
    // so the DOM baselines read the same on the Mac and on CI's Linux.
    await context.addInitScript((platform) => {
      Object.defineProperty(Navigator.prototype, 'platform', { get: () => platform });
    }, PLATFORM);
    await use(context);
  },
});

export { expect };
