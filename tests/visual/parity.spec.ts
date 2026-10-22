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

/** Strip content the port has not reached yet; views showing it are expected to fail. */
const STRIPS_PENDING = 'log and gut strips not ported yet';

interface View {
  name: string;
  /** Selectors clicked in order on both pages before the screenshot. */
  clicks: string[];
  /** Set while the view depends on unported modules: the test is then expected to fail. */
  pending?: string;
  /** Compare only this element instead of the full page. */
  element?: string;
}

// Key views from the parity plan; the rest are added as their modules are ported.
const VIEWS: View[] = [
  { name: 'default (Strings / Regna / Toroline)', clicks: [], pending: STRIPS_PENDING },
  { name: 'Percept 100D', clicks: ['#btn-racquet-percept'], pending: STRIPS_PENDING },
  { name: 'Pro Tour 630', clicks: ['#btn-racquet-headpt630'], pending: STRIPS_PENDING },
  { name: 'Grips', clicks: ['#btn-cat-grips'] },
  { name: 'filters open, Hex active', clicks: ['#btn-filters', HEX], pending: STRIPS_PENDING },
  { name: 'grip filters open, Dry active', clicks: ['#btn-cat-grips', '#btn-filters', GRIP_DRY] },
  {
    name: 'compare open (2 strings + 1 hybrid)',
    clicks: [
      compareBox('toroline-o-toro-tour'),
      compareBox('toroline-caviar'),
      compareBox('toroline-k-pop'),
      '#compare-open',
    ],
    pending: STRIPS_PENDING,
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
];

// The UI tag shows the app version (v0.991) while legacy says v0.990: a declared difference.
const maskVersion = { mask: (page: Page) => [page.locator('.version-tag')] };

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
    const shots: Buffer[] = [];
    for (const url of [LEGACY_URL, APP_URL]) {
      const page = await open(context, url);
      for (const selector of view.clicks) await page.locator(selector).first().click();
      shots.push(await screenshot(page, { ...maskVersion, element: view.element }));
    }
    await expectSameRendering(testInfo, shots[0]!, shots[1]!);
  });
}
