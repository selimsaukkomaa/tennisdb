// @vitest-environment jsdom
// Port of legacy/smoke_v990.js (jsdom), run against the app booted from index.html + src/main.
//
// Changes from the legacy suite:
//   - dropped: the three regression checks against v0.989 (that file is not in this repo); the
//     data round trip against v0.990 lives in tests/data/legacy-roundtrip.test.ts instead
//   - the checks that read the page's source text run against the built bundle, in
//     tests/smoke/shipped.test.ts
//   - window globals (TENNIS_DB, showRacquet, ...) are module imports
//   - version tags show the app version; the data keeps its own (0.990)
//   - the GLOBAL_SEARCH_API check, skipped in v0.990 because the global never existed, runs
// Checks run in order and share page state, as they did in the legacy script.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import type { TennisDb } from '../../src/core/types';
import { APP_VERSION } from '../../src/version';

let DB: TennisDb;
let showRacquet: (r: string) => void;
let showCategory: (c: 'strings' | 'grips') => void;
let searchIndex: () => { sublabel: string }[];
let search: (q: string) => { sublabel: string }[];

const R = ['regna', 'percept', 'headpt630'];
const $ = <T extends Element = HTMLElement>(sel: string): T | null =>
  document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string): T[] => [
  ...document.querySelectorAll<T>(sel),
];
const visible = (tr: Element): boolean => !tr.classList.contains('filter-hidden');

beforeAll(async () => {
  const html = readFileSync(resolve('index.html'), 'utf8');
  document.body.innerHTML = html
    .match(/<body>([\s\S]*)<\/body>/)![1]!
    .replace(/<script[\s\S]*?<\/script>/g, '');
  localStorage.clear();
  ({ db: DB } = await import('../../src/main'));
  ({ showRacquet, showCategory } = await import('../../src/ui/nav'));
  const s = await import('../../src/ui/search');
  searchIndex = s.currentIndex;
  search = s.searchNow;
});

// ---------------------------------------------------------------- data
describe('data', () => {
  test('TENNIS_DB present', () => expect(DB).toBeTruthy());
  test('data version 0.990', () => expect(DB.version).toBe('0.990'));
  test('72 strings', () => expect(DB.strings).toHaveLength(72));
  test('10 hybrids', () => expect(DB.hybrids).toHaveLength(10));
  test('35 grips', () => {
    const n = Object.values(DB.grips).reduce(
      (a, g) => a + Object.values(g).reduce((m, x) => m + x.length, 0),
      0,
    );
    expect(n).toBe(35);
  });
  test('21 gut pairings', () => {
    expect(Object.values(DB.gutHybrids).reduce((n, a) => n + a.length, 0)).toBe(21);
  });
  test('7 string brands', () => expect(Object.keys(DB.brandsStrings)).toHaveLength(7));
  test('PT630 98 sq in', () =>
    expect(DB.racquets.find((r) => r.id === 'headpt630')!.headSize).toBe('98 sq in'));
  test('no topPick keys in data', () => expect(JSON.stringify(DB)).not.toContain('topPick'));
  test('all string+hybrid notes present (≥40 chars)', () => {
    const empty = [...DB.strings, ...DB.hybrids].flatMap((s) =>
      R.filter((r) => (s.perRacquet[r]?.note ?? '').trim().length < 40).map((r) => `${s.id}/${r}`),
    );
    expect(empty).toEqual([]);
  });
  test('all gut notes present', () => {
    expect(
      Object.values(DB.gutHybrids)
        .flat()
        .every((p) => p.notes && p.notes.length >= 40),
    ).toBe(true);
  });
  test('neutrality audit: no preference/verdict language in notes', () => {
    const pref =
      /\byour\b|\byou\b|\byou're\b|OHBH|one-handed|Selim|\bAvoid\b|\bSkip\b|\bPerfect for\b|\bIdeal for\b|\bdead\b|\bdeadened\b|\bpreference\b/i;
    const hits: string[] = [];
    for (const s of [...DB.strings, ...DB.hybrids]) {
      R.forEach((r) => pref.test(s.perRacquet[r]!.note) && hits.push(`${s.id}/${r}`));
      if (pref.test(s.feelSummary)) hits.push(`${s.id}/summary`);
      if (pref.test(s.feelExpand)) hits.push(`${s.id}/expand`);
    }
    Object.values(DB.gutHybrids)
      .flat()
      .forEach((p) => pref.test(p.notes) && hits.push(p.id));
    expect(hits).toEqual([]);
  });
});

// ---------------------------------------------------------------- chrome removals
describe('chrome', () => {
  test('no rec-box in string sections', () => {
    expect(
      $$(
        '#strings-content .rec-box, #regna-content .rec-box, #percept-content .rec-box, #headpt630-content .rec-box',
      ),
    ).toHaveLength(0);
  });
  test('grip About boxes kept (3)', () => expect($$('#grips-content .rec-box')).toHaveLength(3));
  test('no summary-section', () => expect($$('.summary-section')).toHaveLength(0));
  test('no summary-card', () => expect($$('.summary-card')).toHaveLength(0));
  test('no ★ Top Pick legend item', () => {
    expect($$('.legend-item').some((el) => /Top Pick/.test(el.textContent!))).toBe(false);
  });
  test('legends still present (4)', () => expect($$('.legend')).toHaveLength(4));
  test('no toppick filter chip', () => {
    expect($$('[data-filter-group="toppick"], [data-gfilter-group="toppick"]')).toHaveLength(0);
  });
  test('no filter-chip-top elements', () => expect($$('.filter-chip-top')).toHaveLength(0));
  test('shape/feel chips intact (7 + 5)', () => {
    expect($$('[data-filter-group="shape"]')).toHaveLength(7);
    expect($$('[data-filter-group="feel"]')).toHaveLength(5);
  });
  test('topbar wordmark present', () => expect($('.topbar-mark')).toBeTruthy());
  test('topbar has no title tooltip', () =>
    expect($('.topbar-mark')!.hasAttribute('title')).toBe(false));
  test('no "Prefers crisp" anywhere', () =>
    expect(document.documentElement.outerHTML).not.toContain('Prefers crisp'));
  test('no "For your crisp" anywhere', () =>
    expect(document.documentElement.outerHTML).not.toContain('For your crisp'));
  test('no "your profile" anywhere', () =>
    expect(document.documentElement.outerHTML).not.toContain('your profile'));
  test('placeholder updated', () => {
    expect($<HTMLInputElement>('#search-input')!.placeholder).toMatch(/try 'caviar', 'gut', 'hex'/);
  });
  test(`version tags say v${APP_VERSION}`, () => {
    const tags = $$('.version-tag');
    expect(tags).toHaveLength(3);
    expect(tags.every((v) => v.textContent!.trim() === `v${APP_VERSION}`)).toBe(true);
  });
  test('no v0.989 residue', () =>
    expect(document.documentElement.outerHTML).not.toContain('v0.989'));
});

// ---------------------------------------------------------------- rendering
describe('rendering', () => {
  test('281 rendered rows', () => expect($$('tr[data-id]')).toHaveLength(281));
  test('no ★ Top Pick tags rendered', () => expect($$('.tag-top')).toHaveLength(0));
  test('no highlight rows', () => expect($$('tr.highlight')).toHaveLength(0));
  test('no data-toppick="1"', () =>
    expect($$('[data-toppick="1"], [data-grip-toppick="1"]')).toHaveLength(0));
  test('Hyper-G Regna note rendered', () => {
    expect(JSON.stringify(DB)).toContain('markedly more vibration damping');
    expect(document.body.textContent).toContain('markedly more vibration damping');
  });
  test('context line present', () => expect($$('.context-line').length).toBeGreaterThanOrEqual(1));
  test('gut status count has no "top picks"', () => {
    const count = $('.gut-status-count');
    expect(count).toBeTruthy();
    expect(count!.textContent).not.toMatch(/top pick/i);
  });
  test('no gut-toppick badges', () => expect($$('.gut-toppick-badge')).toHaveLength(0));
});

// ---------------------------------------------------------------- behaviour
describe('behaviour', () => {
  const hexChip = (): HTMLElement =>
    $('[data-filter-group="shape"][data-filter-value="hexagonal"]')!;
  const regnaRows = (): HTMLElement[] => $$('#regna-content tr[data-type="string"]');

  test('hex filter narrows rows', () => {
    hexChip().click();
    const vis = regnaRows().filter(visible);
    expect(vis.length).toBeGreaterThan(0);
    expect(vis.length).toBeLessThan(regnaRows().length);
  });
  test('hex filter shows only hex', () => {
    expect(
      regnaRows()
        .filter(visible)
        .every((tr) => (tr.dataset.shape ?? '').includes('hexagonal')),
    ).toBe(true);
  });
  test('hex filter clears', () => {
    hexChip().click();
    expect(regnaRows().filter(visible)).toHaveLength(regnaRows().length);
  });
  test('PT630 view active', () => {
    showRacquet('headpt630');
    const el = $('#headpt630-content')!;
    expect(window.getComputedStyle(el).display).not.toBe('none');
    showRacquet('regna');
  });
  test('palette exists', () => expect($('#palette')).toBeTruthy());
  test('palette opens', () => {
    const palette = $('#palette')!;
    $<HTMLElement>(
      '#topbar [data-palette-open], #topbar .topbar-search, #topbar button[aria-label*="earch"]',
    )!.click();
    expect(
      palette.classList.contains('palette-open') ||
        palette.getAttribute('aria-hidden') === 'false' ||
        window.getComputedStyle(palette).display !== 'none',
    ).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
  test('search index has no ★ Top Pick sublabels', () => {
    expect(searchIndex().some((i) => /Top Pick/.test(i.sublabel || ''))).toBe(false);
  });
  test('grips view renders rows', () => {
    showCategory('grips');
    expect($$('#grips-content tr[data-id]')).toHaveLength(35);
    showCategory('strings');
  });
  test('compare checkboxes present', () => {
    expect($$('input.compare-check, input[class*="compare"]').length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------- v0.990 polish checks
describe('v0.990: shape and feel', () => {
  const strRows = (): HTMLElement[] => $$('#regna-content tr[data-type="string"]');
  const feelOf = (id: string): string[] => DB.strings.find((s) => s.id === id)!.feelAttr.split(',');

  test('no square-textured shapeAttr', () => {
    expect(DB.strings.some((s) => s.shapeAttr === 'square-textured')).toBe(false);
  });
  let squareNames: (string | undefined)[] = [];
  test('Square chip shows TB Diamond Rough', () => {
    showRacquet('regna');
    const sq = $<HTMLElement>('[data-filter-group="shape"][data-filter-value="square"]')!;
    sq.click();
    squareNames = $$('#regna-content tr[data-shape]')
      .filter(visible)
      .map((tr) => tr.dataset.id);
    sq.click();
    expect(squareNames).toContain('solinco-tb-diamond-rough');
  });
  test('Square chip shows Aspera Triplum', () => {
    expect(squareNames).toContain('grapplesnake-aspera-triplum');
  });
  test('every string row has a feel value', () => {
    expect(strRows().every((tr) => (tr.dataset.feel ?? '').length > 0)).toBe(true);
  });
  test('every string is exactly one of firm/soft', () => {
    expect(
      DB.strings.every(
        (s) => s.feelAttr.split(',').includes('firm') !== s.feelAttr.split(',').includes('soft'),
      ),
    ).toBe(true);
  });
  describe.each([
    ['crisp', 20],
    ['firm', 20],
    ['soft', 20],
    ['plush', 7],
    ['lively', 7],
  ])('feel chip "%s"', (value, min) => {
    let vis: HTMLElement[] = [];
    test(`shows >= ${min} strings`, () => {
      const chip = $<HTMLElement>(`[data-filter-group="feel"][data-filter-value="${value}"]`)!;
      chip.click();
      vis = strRows().filter(visible);
      chip.click();
      expect(vis.length).toBeGreaterThanOrEqual(min);
    });
    test('rows all carry it', () => {
      expect(vis.every((tr) => tr.dataset.feel!.split(',').includes(value))).toBe(true);
    });
  });
  test('Hyper-G no longer Soft', () => {
    expect(feelOf('solinco-hyper-g')).not.toContain('soft');
    expect(feelOf('solinco-hyper-g')).toContain('firm');
  });
  test('Zero no longer Soft', () => expect(feelOf('restring-zero')).not.toContain('soft'));
  test('Confidential Soft is Soft', () =>
    expect(feelOf('solinco-confidential-soft')).toContain('soft'));
  test('Truffle X is Plush', () => expect(feelOf('toroline-truffle-x')).toContain('plush'));
  test('Tour Sniper not Crisp', () =>
    expect(feelOf('grapplesnake-tour-sniper')).not.toContain('crisp'));
  test('Tour Bite Lively', () => expect(feelOf('solinco-tour-bite')).toContain('lively'));
  test('crisp chip matches Crisp tag everywhere', () => {
    const rows = [...DB.strings, ...DB.hybrids];
    expect(
      rows.every(
        (r) =>
          r.feelAttr.split(',').includes('crisp') ===
          (r.feelTags.some((x) => x.label === 'Crisp') || /crisp/i.test(r.feelSummary)),
      ),
    ).toBe(true);
  });
  test('each tag label has one colour', () => {
    const lv: Record<string, string> = {};
    let one = true;
    for (const r of [...DB.strings, ...DB.hybrids]) {
      for (const x of r.feelTags) {
        if (lv[x.label] && lv[x.label] !== x.variant) one = false;
        lv[x.label] = x.variant;
      }
    }
    expect(one).toBe(true);
  });
});

describe('v0.990: order and search', () => {
  test('hybrid rows in declared order', () => {
    const order = $$('#regna-content tr[data-type="hybrid"]').map((tr) => tr.dataset.id);
    expect(order).toEqual(DB.hybrids.map((h) => h.id));
  });
  test('gut rows: mains before crosses', () => {
    $<HTMLElement>('[data-gut-toggle="regna"]')!.click();
    const cfg = $$('.gut-section[data-racquet="regna"] tr[data-config]').map(
      (tr) => tr.dataset.config!,
    );
    expect(cfg).toHaveLength(7);
    expect(cfg).toEqual(
      [...cfg].sort((a, b) => (a === 'gut-mains' ? 0 : 1) - (b === 'gut-mains' ? 0 : 1)),
    );
  });
  test('name sort ascending', () => {
    const th = $<HTMLElement>('#regna-content th.sortable[data-col="string"]')!;
    const tbody = th.closest('table')!.querySelector('tbody')!;
    th.click();
    const names = [...tbody.querySelectorAll('tr')].map((tr) =>
      tr.querySelector('.string-name')!.textContent!.trim().toLowerCase(),
    );
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
  test('search still returns results', () => expect(search('caviar').length).toBeGreaterThan(0));
  test('search sublabels have no ★', () => {
    expect(search('caviar').every((r) => !/★/.test(r.sublabel || ''))).toBe(true);
  });
});

describe('v0.990: grips', () => {
  const gripRows = (): HTMLElement[] => $$('#grips-content tr[data-grip-type]');
  const gripChip = (group: string, value: string): HTMLElement =>
    $(`[data-gfilter-group="${group}"][data-gfilter-value="${value}"]`)!;
  const visibleNames = (): string[] =>
    gripRows()
      .filter((tr) => !tr.classList.contains('gfilter-hidden'))
      .map((tr) => tr.querySelector('.string-name')!.textContent!.trim());

  beforeAll(() => showCategory('grips'));

  test('every grip row has a feel value', () => {
    expect(gripRows().every((tr) => (tr.dataset.gripFeel ?? '').length > 0)).toBe(true);
  });
  test('Dry chip shows Tourna Grip Original', () => {
    gripChip('feel', 'dry').click();
    expect(visibleNames()).toContain('Tourna Grip Original');
  });
  test('Dry chip shows Tourna Grip XL + Pro Thin', () => {
    expect(visibleNames()).toEqual(
      expect.arrayContaining(['Tourna Grip XL', 'Tourna Grip Pro Thin']),
    );
  });
  test('every dry-type grip matches Dry chip', () => {
    expect(
      gripRows()
        .filter((tr) => tr.dataset.gripType === 'dry')
        .every((tr) => !tr.classList.contains('gfilter-hidden')),
    ).toBe(true);
    gripChip('feel', 'dry').click();
  });
  test('Leather chip shows Pro Tour Leather', () => {
    gripChip('feel', 'leather').click();
    expect(visibleNames()).toContain('Pro Tour Leather');
    gripChip('feel', 'leather').click();
  });
  test('every wet-type grip matches Tacky chip', () => {
    gripChip('feel', 'tacky').click();
    expect(
      gripRows()
        .filter((tr) => tr.dataset.gripType === 'wet')
        .every((tr) => !tr.classList.contains('gfilter-hidden')),
    ).toBe(true);
    gripChip('feel', 'tacky').click();
  });
  test('grip feel filter is token-based', async () => {
    // v0.990 checked the source text; here the shared predicate and a grip row's tokens.
    const { matchesAny } = await import('../../src/core/chips');
    expect(matchesAny('cushioned,tacky', ['tack'])).toBe(false);
    expect(matchesAny('cushioned,tacky', ['tacky'])).toBe(true);
    gripChip('feel', 'firm').click();
    const shown = gripRows().filter((tr) => !tr.classList.contains('gfilter-hidden'));
    gripChip('feel', 'firm').click();
    expect(shown.every((tr) => tr.dataset.gripFeel!.split(',').includes('firm'))).toBe(true);
  });
  test('grip text neutral', () => {
    const gripNeutral =
      /\byour?\b|\byou\b|you'll|you've|\bprefer|\bBest for\b|\bBest choice\b|\bideal\b|Niche pick|gold standard|legendary|\bperfectly\b|\bultimate\b|\bamazing\b|connection/i;
    const bad = Object.values(DB.grips)
      .flatMap((b) => Object.values(b).flat())
      .filter((g) => gripNeutral.test([g!.notes, g!.feelSummary, g!.feelExpand].join(' ')))
      .map((g) => g!.name);
    expect(bad).toEqual([]);
  });
  test('Tac no longer calls Hi-Soft EX a Yonex grip', () => {
    expect(JSON.stringify(DB.grips)).not.toMatch(/Yonex Hi-Soft/);
  });
  test('grip About boxes neutral', () => {
    const about = $$('#grips-content .rec-box')
      .map((b) => b.textContent)
      .join(' ');
    expect(about).not.toMatch(/\byour?\b|\bstrong\b|prefer/i);
    showCategory('strings');
  });
});
