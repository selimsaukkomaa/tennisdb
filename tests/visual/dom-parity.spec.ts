// DOM parity: after the same steps, the new build's live DOM must equal legacy v0.990's,
// node for node (normalised, with the declared differences erased; see dom.ts). Catches what
// screenshots can miss: hooks, attributes, hidden elements, whitespace between inline nodes.
import { APP_URL, LEGACY_URL, expect, open, seedLog, test } from './support';
import {
  describeDifference,
  eraseDeclaredDifferences,
  runSteps,
  snapshotDom,
  type Step,
} from './dom';

interface Scenario {
  name: string;
  steps: Step[];
  /** Seed both pages with the fixture stringing log. */
  log?: boolean;
}

const chip = (group: string, value: string): string =>
  `[data-filter-group="${group}"][data-filter-value="${value}"]`;
const gripChip = (group: string, value: string): string =>
  `[data-gfilter-group="${group}"][data-gfilter-value="${value}"]`;
const box = (racquet: string, id: string): string =>
  `#${racquet}-content input[data-compare-id="${id}"]`;
const CAVIAR = '0f6c1e2a-4b3d-4c5e-8f70-1a2b3c4d5e6f';
const HYPER_G = '7d9e8f10-2c3b-4a5d-9e6f-7a8b9c0d1e2f';
const OPEN_LOG = '[data-log-toggle="regna"]';

const SCENARIOS: Scenario[] = [
  { name: 'load', steps: [] },
  // navigation and sorting
  {
    name: 'Percept, Yonex tab',
    steps: ['#btn-racquet-percept', '#percept-switcher button:nth-child(3)'],
  },
  {
    name: 'Pro Tour 630, sort by stiffness twice',
    steps: [
      '#btn-racquet-headpt630',
      '#headpt630-content .brand-section.active th[data-col="stiffness"]',
      '#headpt630-content .brand-section.active th[data-col="stiffness"]',
    ],
  },
  {
    name: 'Grips, Tourna, sort by tackiness',
    steps: ['#btn-cat-grips', '#btn-grip-tourna', '#grip-tourna-section th[data-col="tackiness"]'],
  },
  // filters
  {
    name: 'Hex + Soft, panel closed (summary)',
    steps: ['#btn-filters', chip('shape', 'hexagonal'), chip('feel', 'soft'), '#btn-filters'],
  },
  {
    name: 'remove a chip from the summary',
    steps: [
      '#btn-filters',
      chip('shape', 'hexagonal'),
      '#btn-filters',
      '.fsum-chip[data-fsum="chip"]',
    ],
  },
  {
    name: 'search text filter',
    steps: ['#btn-filters', { type: ['#filter-search', 'caviar'] }, '#btn-filters'],
  },
  {
    name: 'stale filter after racquet switch (bug B)',
    steps: [
      '#btn-filters',
      chip('shape', 'hexagonal'),
      '#btn-racquet-percept',
      '#filter-clear',
      '#btn-racquet-regna',
    ],
  },
  {
    name: 'grip Dry chip (bug A)',
    steps: ['#btn-cat-grips', '#btn-filters', gripChip('feel', 'dry')],
  },
  {
    name: 'grip search',
    steps: ['#btn-cat-grips', '#btn-filters', { type: ['#grip-filter-search', 'leather'] }],
  },
  // compare
  {
    name: 'compare 2 strings + hybrid, Percept tab',
    steps: [
      box('regna', 'toroline-o-toro-tour'),
      box('regna', 'toroline-caviar'),
      box('regna', 'toroline-k-pop'),
      '#compare-open',
      '.cmp-racquet-tab[data-cmp-racquet="percept"]',
    ],
  },
  {
    name: 'compare full (4), rest disabled',
    steps: ['toroline-o-toro-tour', 'toroline-caviar', 'toroline-vamos', 'toroline-cash'].map(
      (id) => box('regna', id),
    ),
  },
  {
    name: 'compare: remove a column, Escape',
    steps: [
      box('regna', 'toroline-caviar'),
      box('regna', 'toroline-k-pop'),
      '#compare-open',
      '.cmp-col-remove',
      { key: 'Escape' },
    ],
  },
  // gut
  {
    name: 'gut strips expanded on all racquets',
    steps: [
      '[data-gut-toggle="regna"]',
      '#btn-racquet-percept',
      '[data-gut-toggle="percept"]',
      '#btn-racquet-headpt630',
      '[data-gut-toggle="headpt630"]',
    ],
  },
  // search and palette
  {
    name: 'search "caviar", arrow keys',
    steps: [
      '#btn-palette',
      { type: ['#search-input', 'caviar'] },
      { key: 'ArrowDown' },
      { key: 'ArrowDown' },
    ],
  },
  {
    name: 'search Enter jumps to a hybrid',
    steps: ['#btn-palette', { type: ['#search-input', 'k-pop spin'] }, { key: 'Enter' }],
  },
  {
    name: 'search jumps to a grip',
    steps: ['#btn-palette', { type: ['#search-input', 'mega tac'] }, '.search-result'],
  },
  {
    name: 'search jumps to a gut pairing',
    steps: [
      '#btn-palette',
      { type: ['#search-input', 'vs touch'] },
      '.search-result[data-result-key^="guthybrid:gh-percept"]',
    ],
  },
  // stringing log
  { name: 'log: open, seeded', steps: [OPEN_LOG], log: true },
  {
    name: 'log: edit an entry',
    steps: [OPEN_LOG, `[data-action="edit"][data-entry-id="${HYPER_G}"]`],
    log: true,
  },
  {
    name: 'log: pin another entry',
    steps: [OPEN_LOG, `[data-action="pin"][data-entry-id="${HYPER_G}"]`],
    log: true,
  },
  {
    name: 'log: delete the pinned entry',
    steps: [OPEN_LOG, `[data-action="delete"][data-entry-id="${CAVIAR}"]`],
    log: true,
  },
  {
    name: 'log: add an entry to an empty log',
    steps: [
      OPEN_LOG,
      '[data-log-add="regna"]',
      { select: ['[name="stringId"]', 'toroline-o-toro-tour'] },
      { type: ['[name="tension"]', '23/24'] },
      '.log-form-stars [data-star-value="4"]',
      '.log-form-save',
    ],
  },
  {
    name: 'log: search jumps to an entry',
    steps: [
      '#btn-palette',
      { type: ['#search-input', 'custom test'] },
      '.search-result[data-result-key^="log:"]',
    ],
    log: true,
  },
];

test.describe('DOM parity with legacy v0.990', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'desktop', 'the DOM does not depend on the viewport');
  });

  for (const scenario of SCENARIOS) {
    test(scenario.name, async ({ context }) => {
      if (scenario.log) await seedLog(context);
      const snapshots: string[][] = [];
      for (const url of [LEGACY_URL, APP_URL]) {
        const page = await open(context, url);
        page.on('dialog', (d) => void d.accept());
        await runSteps(page, scenario.steps);
        snapshots.push(eraseDeclaredDifferences(await snapshotDom(page)));
      }
      expect(describeDifference(snapshots[0]!, snapshots[1]!)).toBe('');
    });
  }
});
