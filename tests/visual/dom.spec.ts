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

/** Clicks that pick the racquet `to` in a racquet menu: open it, then the option (v1.10). */
const pick = (menu: 'card' | 'compare', to: string): string[] => [
  `[data-rpick="${menu}"] [data-rpick-toggle]`,
  `[data-rpick="${menu}"] [data-rpick-value="${to}"]`,
];
const racquet = (to: string): string[] => pick('card', to);

const SCENARIOS: Scenario[] = [
  { name: 'load', steps: [] },
  // navigation and sorting
  {
    name: 'Percept, Yonex tab',
    steps: [...racquet('percept'), '#strings-switcher button:nth-child(3)'],
  },
  {
    name: 'Pro Tour 630, sort by stiffness twice',
    steps: [
      ...racquet('headpt630'),
      '#headpt630-content .brand-section.active th[data-col="stiffness"]',
      '#headpt630-content .brand-section.active th[data-col="stiffness"]',
    ],
  },
  {
    name: 'Grips, Tourna, sort by tackiness',
    steps: ['#btn-cat-grips', '#btn-grip-tourna', '#grip-tourna-section th[data-col="tackiness"]'],
  },
  // the racket menu (v1.10)
  {
    // Opens on the racket on screen; Up moves to the Percept, Enter picks it.
    name: 'racket menu by keyboard',
    steps: ['[data-rpick="card"] [data-rpick-toggle]', { key: 'ArrowUp' }, { key: 'Enter' }],
  },
  {
    name: 'racket menu open',
    steps: ['[data-rpick="card"] [data-rpick-toggle]'],
  },
  {
    name: 'strings carry over on a racket switch',
    steps: ['#btn-yonex', ...racquet('headpt630')],
  },
  {
    name: 'remembered racket and strings after a reload',
    steps: [...racquet('percept'), '#btn-solinco', { reload: true }],
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
      ...racquet('percept'),
      '#filter-clear',
      ...racquet('regna'),
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
    name: 'compare 2 strings + hybrid, Percept',
    steps: [
      box('regna', 'toroline-o-toro-tour'),
      box('regna', 'toroline-caviar'),
      box('regna', 'toroline-k-pop'),
      '#compare-open',
      ...pick('compare', 'percept'),
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
    // Since v1.10 the strings choice carries over, so one click shows gut on every racquet.
    name: 'Natural gut on all racquets',
    steps: ['#btn-gut', ...racquet('percept'), ...racquet('headpt630')],
  },
  {
    // Filters span every brand, so the gut view steps aside; clearing them brings it back.
    name: 'Natural gut, filter, clear',
    steps: ['#btn-gut', '#btn-filters', chip('shape', 'hexagonal'), '#filter-clear'],
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
    // The Rackets group comes first (v1.10); Enter switches to the racket.
    name: 'search Enter switches to a racket',
    steps: ['#btn-palette', { type: ['#search-input', 'pro tour'] }, { key: 'Enter' }],
  },
  {
    name: 'search jumps to a grip',
    steps: ['#btn-palette', { type: ['#search-input', 'mega tac'] }, '.search-result'],
  },
  {
    // Since v1.10 search lists the gut pairings of the racquet on screen.
    name: 'search jumps to a gut pairing',
    steps: [
      ...racquet('percept'),
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
