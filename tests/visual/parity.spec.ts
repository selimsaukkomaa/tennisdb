import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import {
  APP_URL,
  LEGACY_URL,
  expect,
  expectSameRendering,
  loadedFontFamilies,
  open,
  screenshot,
  test,
} from './support';

const HEX = '[data-filter-group="shape"][data-filter-value="hexagonal"]';
const GRIP_DRY = '[data-gfilter-group="feel"][data-gfilter-value="dry"]';
const compareBox = (id: string): string => `#regna-content input[data-compare-id="${id}"]`;

/** The same stringing log in v0.990's format (tennis_log_v1) and v0.991's (tennis_log_v2). */
const LOG_SEED = JSON.parse(
  readFileSync(fileURLToPath(new URL('../fixtures/log-seed.json', import.meta.url)), 'utf8'),
) as Record<string, unknown>;

interface View {
  name: string;
  /** Selectors clicked in order on both pages before the screenshot. */
  clicks: string[];
  /** Set while the view depends on unported modules: the test is then expected to fail. */
  pending?: string;
  /** Compare only this element instead of the full page. */
  element?: string;
  /** Text typed into a field after the clicks: [selector, text]. */
  type?: [string, string];
  /** Seed both pages with the fixture stringing log. */
  seedLog?: boolean;
}

// Key views from the parity plan.
const VIEWS: View[] = [
  { name: 'default (Strings / Regna / Toroline)', clicks: [] },
  { name: 'Percept 100D', clicks: ['#btn-racquet-percept'] },
  { name: 'Pro Tour 630', clicks: ['#btn-racquet-headpt630'] },
  { name: 'Grips', clicks: ['#btn-cat-grips'] },
  { name: 'gut hybrids expanded', clicks: ['[data-gut-toggle="regna"]'] },
  {
    name: 'gut strip expanded (Pro Tour 630)',
    clicks: ['#btn-racquet-headpt630', '[data-gut-toggle="headpt630"]'],
    element: '.gut-section[data-racquet="headpt630"]',
  },
  { name: 'filters open, Hex active', clicks: ['#btn-filters', HEX] },
  { name: 'grip filters open, Dry active', clicks: ['#btn-cat-grips', '#btn-filters', GRIP_DRY] },
  {
    name: 'compare open (2 strings + 1 hybrid)',
    clicks: [
      compareBox('toroline-o-toro-tour'),
      compareBox('toroline-caviar'),
      compareBox('toroline-k-pop'),
      '#compare-open',
    ],
  },
  {
    name: 'compare modal panel, Percept tab',
    clicks: [
      compareBox('toroline-o-toro-tour'),
      compareBox('toroline-caviar'),
      compareBox('toroline-k-pop'),
      '#compare-open',
      '.cmp-racquet-tab[data-cmp-racquet="percept"]',
    ],
    element: '.compare-modal-panel',
  },
  {
    name: 'log open, 2 entries, older one pinned',
    clicks: ['[data-log-toggle="regna"]'],
    seedLog: true,
  },
  {
    name: 'search palette open on "caviar"',
    clicks: ['#btn-palette'],
    type: ['#search-input', 'caviar'],
  },
  {
    name: 'search results, "gut"',
    clicks: ['#btn-palette'],
    type: ['#search-input', 'gut'],
    element: '#search-results',
  },
];

// Declared differences, masked on both pages:
//   .version-tag  the UI shows the app version (v0.991) where legacy says v0.990
//   .log-backup   v0.991's Export / Import buttons in the log panel footer
const masks = { mask: (page: Page) => [page.locator('.version-tag'), page.locator('.log-backup')] };

test('harness: legacy renders identically twice, with the vendored fonts', async ({
  context,
}, testInfo) => {
  const first = await open(context, LEGACY_URL);
  const second = await open(context, LEGACY_URL);
  expect(await loadedFontFamilies(first)).toEqual(['DM Sans', 'Space Mono']);
  await expectSameRendering(testInfo, await screenshot(first), await screenshot(second));
});

for (const view of VIEWS) {
  test(`parity: ${view.name}`, async ({ context }, testInfo) => {
    test.fail(!!view.pending, view.pending);
    if (view.seedLog) {
      await context.addInitScript(
        (items: Record<string, string>) => {
          for (const [k, v] of Object.entries(items)) localStorage.setItem(k, v);
        },
        Object.fromEntries(Object.entries(LOG_SEED).map(([k, v]) => [k, JSON.stringify(v)])),
      );
    }
    const shots: Buffer[] = [];
    for (const url of [LEGACY_URL, APP_URL]) {
      const page = await open(context, url);
      for (const selector of view.clicks) await page.locator(selector).first().click();
      if (view.type) {
        await page.locator(view.type[0]).pressSequentially(view.type[1]);
        await page.locator('.search-results-visible').waitFor();
      }
      shots.push(await screenshot(page, { ...masks, element: view.element }));
    }
    await expectSameRendering(testInfo, shots[0]!, shots[1]!);
  });
}
