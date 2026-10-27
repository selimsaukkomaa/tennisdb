import type { Page } from '@playwright/test';
import {
  APP_URL,
  LEGACY_URL,
  expect,
  expectSameRendering,
  loadedFontFamilies,
  open,
  screenshot,
  seedLog,
  test,
} from './support';
import { typeInto } from './dom';

const HEX = '[data-filter-group="shape"][data-filter-value="hexagonal"]';
const GRIP_DRY = '[data-gfilter-group="feel"][data-gfilter-value="dry"]';
const compareBox = (id: string): string => `#regna-content input[data-compare-id="${id}"]`;

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
  /** Element the mouse rests on for the screenshot. */
  hover?: string;
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
    // Close up and hovered, so the clear button is more than a rounding error (fix C).
    name: 'search field with text, clear button hovered',
    clicks: ['#btn-palette'],
    type: ['#search-input', 'caviar'],
    element: '#palette .search-bar-inner',
    hover: '#search-clear',
  },
  {
    name: 'search results, "gut"',
    clicks: ['#btn-palette'],
    type: ['#search-input', 'gut'],
    element: '#search-results',
  },
];

// Declared differences, masked on both pages (v0.992's fixes are patched into legacy instead,
// see legacy-fixes.ts):
//   .version-tag  the UI shows the app version where legacy says v0.990
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
    if (view.seedLog) await seedLog(context);
    const shots: Buffer[] = [];
    for (const url of [LEGACY_URL, APP_URL]) {
      const page = await open(context, url);
      for (const selector of view.clicks) await page.locator(selector).first().click();
      if (view.type) {
        await typeInto(page, view.type[0], view.type[1]);
        await page.locator('.search-results-visible').waitFor();
      }
      if (view.hover) await page.locator(view.hover).hover();
      shots.push(await screenshot(page, { ...masks, element: view.element }));
    }
    await expectSameRendering(testInfo, shots[0]!, shots[1]!);
  });
}
