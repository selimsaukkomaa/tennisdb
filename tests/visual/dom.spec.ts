// DOM baselines: after the same steps, the page's live DOM (normalised, see dom.ts) must equal
// the approved snapshot in tests/visual/baselines/dom. Plain text, so they run everywhere,
// CI included, and catch what a screenshot can miss: hooks, attributes, hidden elements, text.
//
// A change is approved first, then the baselines are updated on purpose:
//   npx playwright test --update-snapshots
import { runSteps, snapshotDom, type Step } from './dom';
import { expect, open, test } from './support';

interface Scenario {
  name: string;
  steps: Step[];
}

const chip = (group: string, value: string): string =>
  `[data-filter-group="${group}"][data-filter-value="${value}"]`;
const gripChip = (group: string, value: string): string =>
  `[data-gfilter-group="${group}"][data-gfilter-value="${value}"]`;
const box = (racquet: string, id: string): string =>
  `#${racquet}-content input[data-compare-id="${id}"]`;

/** The racquet row's button for `to`, in the card of the racquet `from` that is showing. */
const racquet = (from: string, to: string): string => `#${from}-content [data-nav-racquet="${to}"]`;

const SCENARIOS: Scenario[] = [
  { name: 'load', steps: [] },
  // navigation and sorting
  {
    name: 'Percept, Yonex tab',
    steps: [racquet('regna', 'percept'), '#percept-switcher button:nth-child(3)'],
  },
  {
    name: 'Pro Tour 630, sort by stiffness twice',
    steps: [
      racquet('regna', 'headpt630'),
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
    name: 'Firm chip',
    steps: ['#btn-filters', chip('feel', 'firm')],
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
    name: 'filter, switch racquet, clear, switch back ',
    steps: [
      '#btn-filters',
      chip('shape', 'hexagonal'),
      racquet('regna', 'percept'),
      '#filter-clear',
      racquet('percept', 'regna'),
    ],
  },
  {
    name: 'grip Dry chip ',
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
    name: 'Natural gut on all racquets',
    steps: [
      '#regna-btn-gut',
      racquet('regna', 'percept'),
      '#percept-btn-gut',
      racquet('percept', 'headpt630'),
      '#headpt630-btn-gut',
    ],
  },
  {
    // Filters span every brand, so the gut view steps aside; clearing them brings it back.
    name: 'Natural gut, filter, clear',
    steps: ['#regna-btn-gut', '#btn-filters', chip('shape', 'hexagonal'), '#filter-clear'],
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
];

const slug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

test.describe('DOM baselines', () => {
  test.beforeEach(() => {
    test.skip(test.info().project.name !== 'desktop', 'the DOM does not depend on the viewport');
  });

  for (const scenario of SCENARIOS) {
    test(scenario.name, async ({ context }) => {
      const page = await open(context);
      page.on('dialog', (d) => void d.accept());
      await runSteps(page, scenario.steps);
      const lines = await snapshotDom(page);
      expect(lines.join('\n') + '\n').toMatchSnapshot(['dom', `${slug(scenario.name)}.txt`]);
    });
  }
});
