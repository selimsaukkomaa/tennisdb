// Pixel baselines: key views of the app, compared with approved screenshots in
// tests/visual/baselines/pixels (threshold 0.1, at most 0.1% of pixels differing). They are made
// on macOS and run only there: CI runs Linux, which renders text differently, so CI checks the
// DOM baselines (dom.spec.ts) and `npm run check` on the Mac checks both before a release.
//
// A visible change is approved first, then the baselines are updated on purpose:
//   npx playwright test --update-snapshots
import type { Page } from '@playwright/test';
import { typeInto } from './dom';
import { expect, loadedFontFamilies, open, test } from './support';

const HEX = '[data-filter-group="shape"][data-filter-value="hexagonal"]';
const GRIP_DRY = '[data-gfilter-group="feel"][data-gfilter-value="dry"]';
const compareBox = (id: string): string => `#regna-content input[data-compare-id="${id}"]`;

interface View {
  name: string;
  /** Selectors clicked in order before the screenshot. */
  clicks: string[];
  /** Capture only this element instead of the page. */
  element?: string;
  /** Text typed into a field after the clicks: [selector, text]. */
  type?: [string, string];
  /** Element the mouse rests on for the screenshot. */
  hover?: string;
}

const VIEWS: View[] = [
  { name: 'default (Strings / Regna / Toroline)', clicks: [] },
  // Close up, so a change to the wordmark is more than a rounding error.
  { name: 'topbar', clicks: [], element: '#topbar' },
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
    // Close up, so a tag colour is more than a rounding error (pale amber and red are within
    // the colour threshold of each other; only the DOM baselines tell those two apart).
    name: 'Yonex Dry Grap row, Dry tag',
    clicks: ['#btn-cat-grips', '#btn-grip-yonex'],
    element: 'tr[data-id="yonex-dry-grap"]',
  },
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

/** File name for a view: "compare open (2 strings + 1 hybrid)" -> "compare-open-2-strings-1-hybrid". */
const slug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// The version tag changes every release; it is masked.
const mask = (page: Page) => [page.locator('.version-tag')];

test.beforeEach(() => {
  test.skip(
    process.platform !== 'darwin',
    'pixel baselines are made on macOS; CI checks the DOM baselines',
  );
});

test('fonts: the vendored DM Sans and Space Mono load', async ({ context }) => {
  expect(await loadedFontFamilies(await open(context))).toEqual(['DM Sans', 'Space Mono']);
});

for (const view of VIEWS) {
  test(`view: ${view.name}`, async ({ context }) => {
    const page = await open(context);
    // Each click, then a pause: panels focus their fields 10 ms after opening, and a later click
    // must not race that timer (the filter field would keep focus only sometimes).
    for (const selector of view.clicks) {
      await page.locator(selector).first().click();
      await page.waitForTimeout(150);
    }
    if (view.type) {
      await typeInto(page, view.type[0], view.type[1]);
      await page.locator('.search-results-visible').waitFor();
    }
    if (view.hover) await page.locator(view.hover).hover();
    const options = { animations: 'disabled' as const, caret: 'hide' as const, mask: mask(page) };
    if (view.element) {
      await expect(page.locator(view.element).first()).toHaveScreenshot(
        `${slug(view.name)}.png`,
        options,
      );
    } else {
      // The first screen, from the top: fixed elements land wherever the page is scrolled.
      await page.evaluate('window.scrollTo(0, 0)');
      await expect(page).toHaveScreenshot(`${slug(view.name)}.png`, options);
    }
  });
}
