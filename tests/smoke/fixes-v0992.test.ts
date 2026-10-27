// @vitest-environment jsdom
// The three v0.990 bugs fixed in v0.992, checked as behaviour on the booted app. The parity
// suite compares against legacy with the same fixes patched in (tests/visual/legacy-fixes.ts);
// these tests state what the fixes must do without reference to legacy.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import type { TennisDb } from '../../src/core/types';

let DB: TennisDb;
let showRacquet: (r: string) => void;
let showCategory: (c: 'strings' | 'grips') => void;

const $ = <T extends Element = HTMLElement>(sel: string): T => document.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] => [
  ...root.querySelectorAll<T>(sel),
];

beforeAll(async () => {
  const html = readFileSync(resolve('index.html'), 'utf8');
  document.body.innerHTML = html
    .match(/<body>([\s\S]*)<\/body>/)![1]!
    .replace(/<script[\s\S]*?<\/script>/g, '');
  localStorage.clear();
  ({ db: DB } = await import('../../src/main'));
  ({ showRacquet, showCategory } = await import('../../src/ui/nav'));
});

describe('A: grip filters cover every brand', () => {
  const gripChip = (value: string): HTMLElement =>
    $(`[data-gfilter-group="feel"][data-gfilter-value="${value}"]`);
  /** A section the page actually shows: displayed and not hidden by the filter. */
  const shown = (section: HTMLElement): boolean =>
    section.style.display === 'block' && !section.classList.contains('gfilter-all-hidden');

  beforeAll(() => showCategory('grips'));

  test('every grip brand has a filter header', () => {
    for (const brand of Object.keys(DB.grips)) expect($(`#gfh-${brand}`)).toBeTruthy();
  });

  test('Dry shows the Tourna section, its header and its three dry grips', () => {
    expect($('#btn-grip-kimony').className).toBe('active-kimony');
    gripChip('dry').click();
    expect(shown($('#grip-tourna-section'))).toBe(true);
    expect($('#gfh-tourna').classList.contains('gfilter-show')).toBe(true);
    const tourna = $$('#grip-tourna-section tr[data-grip-type]')
      .filter((tr) => !tr.classList.contains('gfilter-hidden'))
      .map((tr) => tr.querySelector('.string-name')!.textContent!.trim());
    expect(tourna).toEqual(
      expect.arrayContaining(['Tourna Grip Original', 'Tourna Grip XL', 'Tourna Grip Pro Thin']),
    );
  });

  test('every grip the status counts as shown is in a shown section', () => {
    const counted = $$('#grips-content tr[data-grip-type]').filter(
      (tr) => !tr.classList.contains('gfilter-hidden'),
    );
    expect($('#grip-filter-status').textContent).toContain(`${counted.length} of 35`);
    expect(counted.every((tr) => shown(tr.closest<HTMLElement>('.brand-section')!))).toBe(true);
  });

  test('a brand with no match is hidden with its header', async () => {
    gripChip('dry').click();
    const { applyGripFilters, gripFilterState } = await import('../../src/ui/filters');
    gripFilterState.search = 'ultimum'; // Yonex Ultimum Leather only
    applyGripFilters();
    expect(shown($('#grip-yonex-section'))).toBe(true);
    for (const brand of ['kimony', 'tourna']) {
      expect(shown($(`#grip-${brand}-section`))).toBe(false);
      expect($(`#gfh-${brand}`).classList.contains('gfilter-show')).toBe(false);
    }
    gripFilterState.search = '';
    applyGripFilters();
  });

  test('clearing returns to the selected brand tab', () => {
    const sections = $$('#grips-content > .brand-section');
    expect(sections.filter(shown).map((s) => s.id)).toEqual(['grip-kimony-section']);
    expect($$('.gfilter-brand-header.gfilter-show')).toHaveLength(0);
    showCategory('strings');
  });
});

describe('B: one string filter state for every racquet', () => {
  const hex = (): HTMLElement => $('[data-filter-group="shape"][data-filter-value="hexagonal"]');
  const hiddenRows = (rid: string): number =>
    $$(`#${rid}-content tr[data-shape].filter-hidden`).length;

  test('a filter applies to every racquet, not only the one on screen', () => {
    showRacquet('regna');
    hex().click();
    for (const r of DB.racquets) {
      const rows = $$(`#${r.id}-content tr[data-shape]`);
      const visible = rows.filter((tr) => !tr.classList.contains('filter-hidden'));
      expect(visible.length).toBeGreaterThan(0);
      expect(visible.every((tr) => tr.dataset.shape!.split(',').includes('hexagonal'))).toBe(true);
      expect($(`#${r.id}-switcher`).classList.contains('filter-all-brands')).toBe(true);
    }
  });

  test('the status counts the racquet on screen', () => {
    showRacquet('percept');
    const rows = $$('#percept-content tr[data-shape]');
    const visible = rows.filter((tr) => !tr.classList.contains('filter-hidden'));
    expect($('#filter-status').textContent).toBe(`${visible.length} of ${rows.length} strings`);
  });

  test('clearing on another racquet leaves no stale state behind', () => {
    $('#filter-clear').click();
    showRacquet('regna');
    for (const r of DB.racquets) {
      const content = $(`#${r.id}-content`);
      expect(hiddenRows(r.id)).toBe(0);
      expect($$('.filter-force-show, .filter-all-hidden', content)).toHaveLength(0);
      expect($$('.filter-brand-header.filter-show', content)).toHaveLength(0);
      expect($(`#${r.id}-switcher`).classList.contains('filter-all-brands')).toBe(false);
      expect($(`#${r.id}-filter-badge`).classList.contains('badge-show')).toBe(false);
    }
  });
});

describe('the search clear button', () => {
  const input = (): HTMLInputElement => $<HTMLInputElement>('#search-input');
  const clear = (): HTMLElement => $('#search-clear');
  const isShown = (): boolean => clear().classList.contains('search-clear-visible');
  const type = (text: string): void => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
  };

  test('hidden while the field is empty', () => expect(isShown()).toBe(false));

  test('shown while the field has text', () => {
    type('caviar');
    expect(isShown()).toBe(true);
    type('');
    expect(isShown()).toBe(false);
  });

  test('clicking it empties the field and hides itself and the results', () => {
    type('caviar');
    $('#search-results').classList.add('search-results-visible');
    clear().click();
    expect(input().value).toBe('');
    expect(isShown()).toBe(false);
    expect($('#search-results').classList.contains('search-results-visible')).toBe(false);
  });

  test('Escape hides it too', () => {
    type('caviar');
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(isShown()).toBe(false);
  });
});
