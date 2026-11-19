// @vitest-environment jsdom
// More frames must need only data: add racquets (and their pairings) and every
// racquet-dependent part of the UI picks them up. v1.8 to v1.9 tested a fourth racquet; since
// v1.10, when the UI was made ready for about ten, it tests ten: the data's three plus seven
// placeholders, each strung as in the Regna. Their names are the common frames proposed for the
// data; their specs are made up for the test.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { assembleDb, copy } from '../../src/core/db';
import { tensionLabel } from '../../src/core/pairings';
import type { Racquet, TennisDb } from '../../src/core/types';
import { initCompare } from '../../src/ui/compare';
import { initFilterPanel } from '../../src/ui/filter-panel';
import { initFilters } from '../../src/ui/filters';
import { initGut } from '../../src/ui/gut';
import { initPickers } from '../../src/ui/picker';
import { initNav, showRacquet } from '../../src/ui/nav';
import { CHOICE_KEY } from '../../src/ui/prefs';
import { initSearch, rebuildIndex } from '../../src/ui/search';
import { renderShell } from '../../src/ui/shell';

const frame = (
  id: string,
  brand: string,
  model: string,
  headSizeSqIn: number,
  ra: number,
): Racquet => ({ id, brand, model, headSizeSqIn, pattern: { mains: 16, crosses: 19 }, ra });

const PLACEHOLDERS: Racquet[] = [
  frame('test-pure-drive', 'Babolat', 'Pure Drive', 100, 71),
  frame('test-pure-aero', 'Babolat', 'Pure Aero', 100, 67),
  frame('test-speed-mp', 'Head', 'Speed MP', 100, 64),
  frame('test-blade-98', 'Wilson', 'Blade 98', 98, 62),
  frame('test-clash-100', 'Wilson', 'Clash 100', 100, 55),
  frame('test-pro-staff-97', 'Wilson', 'Pro Staff 97', 97, 66),
  frame('test-ezone-100', 'Yonex', 'EZONE 100', 100, 65),
];

/** The data plus seven racquets, every item strung in each as in the Regna; no gut pairings. */
function withTenRackets(): TennisDb {
  const base = assembleDb();
  const regna = base.pairings.filter((p) => p.racquetId === 'regna');
  return assembleDb({
    racquets: [...base.racquets, ...PLACEHOLDERS],
    pairings: [
      ...base.pairings,
      ...PLACEHOLDERS.flatMap((r) => regna.map((p) => ({ ...p, racquetId: r.id }))),
    ],
  });
}
const pairingIn = (db: TennisDb, itemId: string, rid: string) =>
  db.pairings.find((p) => p.itemId === itemId && p.racquetId === rid)!;

const $ = <T extends Element = HTMLElement>(sel: string): T => document.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string): T[] => [
  ...document.querySelectorAll<T>(sel),
];
const pages = (): string[] => $$('[data-racquet-page]').map((p) => p.dataset.racquetPage!);
const click = (sel: string): void => $(sel).click();

let db: TennisDb;
beforeAll(() => {
  // Vitest runs from the project root; jsdom's URL global can't make file: paths.
  const indexHtml = readFileSync(resolve('index.html'), 'utf8');
  document.body.innerHTML = indexHtml
    .match(/<body>([\s\S]*)<\/body>/)![1]!
    .replace(/<script[\s\S]*?<\/script>/g, '');
  localStorage.clear();
  db = withTenRackets();
  renderShell(db, copy);
  initFilters();
  initPickers();
  initGut(db, copy);
  initCompare(db);
  initNav(db, copy);
  initFilterPanel();
  initSearch(db);
});

/** The card menu as text: each brand heading, then its racquets, the picked one ticked. */
const menuText = (menu: string): string[] =>
  $$(`[data-rpick="${menu}"] .rpick-brand, [data-rpick="${menu}"] [role="option"]`).map((el) =>
    el.classList.contains('rpick-brand')
      ? el.textContent!
      : `${el.getAttribute('aria-selected') === 'true' ? '✓ ' : '  '}${el.querySelector('.rpick-model')!.textContent} · ${el.querySelector('.rpick-spec')!.textContent}`,
  );

describe('ten racquets from data alone', () => {
  test('the card menu lists all ten by brand, A–Z, the racquet on screen ticked', () => {
    expect(menuText('card')).toEqual([
      'Babolat',
      '  Pure Aero · 67 RA · 16×19 · 100 sq in',
      '  Pure Drive · 71 RA · 16×19 · 100 sq in',
      'Head',
      '  Pro Tour 630 · 58 RA · 18×20 · 98 sq in',
      '  Speed MP · 64 RA · 16×19 · 100 sq in',
      'Wilson',
      '  Blade 98 · 62 RA · 16×19 · 98 sq in',
      '  Clash 100 · 55 RA · 16×19 · 100 sq in',
      '  Pro Staff 97 · 66 RA · 16×19 · 97 sq in',
      'Yonex',
      '  EZONE 100 · 65 RA · 16×19 · 100 sq in',
      '  Percept 100D · 66 RA · 18×19 · 100 sq in',
      '✓ Regna 100 · 64 RA · 16×19 · 100 sq in',
    ]);
    expect($('#selector [data-rpick-current]').textContent).toBe('Regna 100');
  });

  test("at load only the start racquet's page exists, with its rows and gut pairings", () => {
    expect(pages()).toEqual(['regna']);
    expect($$('#regna-content tr[data-type="string"]')).toHaveLength(72);
    expect($$('#regna-content tr[data-type="hybrid"]')).toHaveLength(10);
    expect($$('#regna-gut-section tr[data-id]')).toHaveLength(7);
  });

  test('showing a racquet builds its page once, and the card follows', () => {
    showRacquet('test-blade-98');
    expect(pages()).toEqual(['regna', 'test-blade-98']);
    expect($('#test-blade-98-content').style.display).toBe('block');
    expect($('#regna-content').style.display).toBe('none');
    expect($('#selector .sel-racquet').textContent).toBe('Blade 98');
    expect($('#selector .sel-spec-text').textContent).toBe('Wilson · 62 RA · 16×19 · 98 sq in');
    expect($('#selector [data-rpick-current]').textContent).toBe('Blade 98');
    expect($('#rpick-card-test-blade-98').getAttribute('aria-selected')).toBe('true');
    expect($('#rpick-card-regna').getAttribute('aria-selected')).toBe('false');
    const row = $('#test-blade-98-content tr[data-id="toroline-o-toro-tour"]');
    expect(row.querySelector('.notes')?.textContent).toBe(
      pairingIn(db, 'toroline-o-toro-tour', 'test-blade-98').note,
    );
    showRacquet('regna');
    showRacquet('test-blade-98');
    expect($$('#test-blade-98-content')).toHaveLength(1);
    expect(pages()).toHaveLength(2);
    showRacquet('regna');
  });

  test('the menu opens, and a click on a racquet switches to it and closes it', () => {
    const root = $('[data-rpick="card"]');
    const toggle = $('#selector [data-rpick-toggle]');
    toggle.click();
    expect(root.classList.contains('rpick-open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    click('#rpick-card-test-ezone-100');
    expect(root.classList.contains('rpick-open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect($('#selector .sel-racquet').textContent).toBe('EZONE 100');
    expect($('#test-ezone-100-content').style.display).toBe('block');
    expect(document.activeElement).toBe(toggle);
    showRacquet('regna');
  });

  test('by keyboard: the picked racquet is active on open, arrows move, Enter picks', () => {
    const list = $('#rpick-card-list');
    const key = (k: string): void => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true }),
      );
    };
    $('#selector [data-rpick-toggle]').focus();
    key('ArrowDown');
    expect(document.activeElement).toBe(list);
    expect(list.getAttribute('aria-activedescendant')).toBe('rpick-card-regna');
    key('ArrowUp');
    expect(list.getAttribute('aria-activedescendant')).toBe('rpick-card-percept');
    key('Home');
    expect(list.getAttribute('aria-activedescendant')).toBe('rpick-card-test-pure-aero');
    key('ArrowDown');
    key('Enter');
    expect($('#selector .sel-racquet').textContent).toBe('Pure Drive');
    expect(document.activeElement).toBe($('#selector [data-rpick-toggle]'));
    showRacquet('regna');
  });

  test('Escape closes without picking, a click elsewhere closes', () => {
    const root = $('[data-rpick="card"]');
    click('#selector [data-rpick-toggle]');
    $('#rpick-card-list').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(root.classList.contains('rpick-open')).toBe(false);
    expect($('#selector .sel-racquet').textContent).toBe('Regna 100');
    click('#selector [data-rpick-toggle]');
    click('#selector .sel-title');
    expect(root.classList.contains('rpick-open')).toBe(false);
  });
});

describe('the strings choice carries over', () => {
  test('a brand stays chosen when the racquet switches', () => {
    click('#strings-switcher [data-nav-brand="yonex"]');
    showRacquet('test-clash-100');
    expect($('#test-clash-100-yonex-section').classList.contains('active')).toBe(true);
    expect($('#test-clash-100-toroline-section').classList.contains('active')).toBe(false);
    expect($('#btn-yonex').className).toBe('active-yonex');
    expect($('#selector [data-sel-strings]').textContent).toBe('Yonex');
  });

  test('so does natural gut, with the empty message where a racquet has no gut pairings', () => {
    click('#btn-gut');
    showRacquet('test-pure-aero');
    const view = $('#test-pure-aero-gut-section');
    expect(view.classList.contains('active')).toBe(true);
    expect(view.querySelector('.gut-empty')?.textContent).toBe(
      'No gut hybrid pairings configured for this racket.',
    );
    showRacquet('regna');
    expect($('#regna-gut-section').classList.contains('active')).toBe(true);
    expect($$('#regna-gut-section tr[data-id]')).toHaveLength(7);
    expect($('#selector [data-sel-strings]').textContent).toBe('Natural gut');
    click('#strings-switcher [data-nav-brand="toroline"]');
    expect($('#regna-gut-section').classList.contains('active')).toBe(false);
    // A hidden page takes the choice when it is shown again.
    showRacquet('test-pure-aero');
    expect(view.classList.contains('active')).toBe(false);
    expect($('#test-pure-aero-toroline-section').classList.contains('active')).toBe(true);
    showRacquet('regna');
  });

  test('the choice is remembered on the device', () => {
    showRacquet('test-clash-100');
    expect(JSON.parse(localStorage.getItem(CHOICE_KEY)!)).toEqual({
      racquet: 'test-clash-100',
      brand: 'toroline',
    });
    showRacquet('regna');
  });
});

describe('filters', () => {
  const rows = (rid: string): HTMLElement[] => $$(`#${rid}-content tr[data-shape]`);
  const shown = (rid: string): HTMLElement[] =>
    rows(rid).filter((r) => !r.classList.contains('filter-hidden'));
  const hex = (): HTMLElement => $('[data-filter-group="shape"][data-filter-value="hexagonal"]');

  test('a page built while a filter is on is filtered when it is shown', () => {
    hex().click();
    expect(pages()).not.toContain('test-speed-mp');
    showRacquet('test-speed-mp');
    const visible = shown('test-speed-mp');
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.length).toBeLessThan(rows('test-speed-mp').length);
    expect(visible.every((r) => r.dataset.shape!.split(',').includes('hexagonal'))).toBe(true);
    expect($('#filter-status').textContent).toBe(
      `${visible.length} of ${rows('test-speed-mp').length} strings`,
    );
    expect($('#strings-switcher').classList.contains('filter-all-brands')).toBe(true);
    expect($('#filter-badge').classList.contains('badge-show')).toBe(true);
    expect($('#filters-count').textContent).toBe('1');
  });

  test('clearing restores every built page', () => {
    hex().click();
    for (const rid of pages()) expect(shown(rid)).toHaveLength(rows(rid).length);
    expect($('#strings-switcher').classList.contains('filter-all-brands')).toBe(false);
    expect($('#filters-count').textContent).toBe('0');
    showRacquet('regna');
  });
});

describe('compare', () => {
  const box = (rid: string, id: string): HTMLInputElement =>
    $<HTMLInputElement>(`#${rid}-content input[data-compare-id="${id}"]`);

  test('a page built after the selection shows it', () => {
    for (const id of ['toroline-o-toro-tour', 'toroline-caviar']) {
      box('regna', id).checked = true;
      box('regna', id).dispatchEvent(new Event('change', { bubbles: true }));
    }
    expect(pages()).not.toContain('test-pro-staff-97');
    showRacquet('test-pro-staff-97');
    expect(box('test-pro-staff-97', 'toroline-caviar').checked).toBe(true);
    expect(box('test-pro-staff-97', 'toroline-vamos').checked).toBe(false);
  });

  test('the modal menu offers every racquet, opens on the one on screen, shows its tensions', () => {
    click('#compare-open');
    expect($$('[data-rpick="compare"] [role="option"]')).toHaveLength(10);
    expect($('[data-rpick="compare"] [data-rpick-current]').textContent).toBe('Pro Staff 97');
    click('[data-rpick="compare"] [data-rpick-toggle]');
    click('#rpick-compare-test-ezone-100');
    expect($('[data-rpick="compare"] [data-rpick-current]').textContent).toBe('EZONE 100');
    // The modal draws the menu again; focus goes back to its new button.
    expect(document.activeElement).toBe($('[data-rpick="compare"] [data-rpick-toggle]'));
    // The page behind keeps its racquet.
    expect($('#selector .sel-racquet').textContent).toBe('Pro Staff 97');
    const tensions = $$('.cmp-cell-tension').map((c) => c.textContent);
    expect(tensions).toEqual([
      tensionLabel(pairingIn(db, 'toroline-o-toro-tour', 'test-ezone-100').tension),
      tensionLabel(pairingIn(db, 'toroline-caviar', 'test-ezone-100').tension),
    ]);
    click('#compare-modal-close');
    click('#compare-clear');
    showRacquet('regna');
  });
});

describe('search', () => {
  test('lists every racquet, and each string once, opening in the racquet on screen', () => {
    showRacquet('test-pure-drive');
    const index = rebuildIndex();
    expect(index.filter((i) => i.type === 'racquet')).toHaveLength(10);
    const strings = index.filter((i) => i.type === 'string');
    expect(strings).toHaveLength(72);
    expect(strings.every((i) => i.racquet === 'test-pure-drive')).toBe(true);
    expect(strings[0]!.sublabel).toMatch(/· Pure Drive$/);
    expect(index.filter((i) => i.type === 'guthybrid')).toHaveLength(0);
    showRacquet('regna');
  });
});
