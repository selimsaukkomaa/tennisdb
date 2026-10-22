// @vitest-environment jsdom
// A fourth frame must need only data: add a racquet (and its per-racquet notes) and every
// racquet-dependent part of the UI picks it up. Extended as each module is ported.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { assembleDb, copy } from '../../src/core/db';
import { KeyValueLogStore, type KeyValueBackend } from '../../src/core/log/store';
import type { Racquet, TennisDb } from '../../src/core/types';
import { initCompare } from '../../src/ui/compare';
import { initContextLine } from '../../src/ui/context-line';
import { initFilterPanel } from '../../src/ui/filter-panel';
import { initFilters } from '../../src/ui/filters';
import { initGut } from '../../src/ui/gut';
import { initLog, logSearchEntries } from '../../src/ui/log';
import { currentIndex, initSearch, rebuildIndex, setLogSearchSource } from '../../src/ui/search';
import { initNav, showRacquet } from '../../src/ui/nav';
import { renderShell } from '../../src/ui/shell';

const FOURTH: Racquet = {
  id: 'test4',
  brand: 'Babolat',
  model: 'Pure Strike 98',
  headSize: '98 sq in',
  pattern: '16×19',
  ra: 62,
  label: 'Babolat Pure Strike 98',
};

function withFourthRacquet(): TennisDb {
  const base = assembleDb();
  const copyPer = <T extends { perRacquet: Record<string, unknown> }>(rows: T[]): T[] =>
    rows.map((r) => ({ ...r, perRacquet: { ...r.perRacquet, test4: r.perRacquet.regna } }));
  return assembleDb({
    racquets: [...base.racquets, FOURTH],
    strings: copyPer(base.strings),
    hybrids: copyPer(base.hybrids),
  });
}

let db: TennisDb;
const stored = new Map<string, string>();
const memoryBackend: KeyValueBackend = {
  async get(k) {
    return stored.get(k) ?? null;
  },
  async set(k, v) {
    stored.set(k, v);
  },
};

beforeAll(async () => {
  // Vitest runs from the project root; jsdom's URL global can't make file: paths.
  const indexHtml = readFileSync(resolve('index.html'), 'utf8');
  document.body.innerHTML = indexHtml
    .match(/<body>([\s\S]*)<\/body>/)![1]!
    .replace(/<script[\s\S]*?<\/script>/g, '');
  db = withFourthRacquet();
  renderShell(db, copy);
  initFilters();
  initNav(db);
  initFilterPanel();
  initCompare(db);
  initGut(db, copy);
  initSearch(db);
  setLogSearchSource(logSearchEntries);
  initContextLine(db);
  await initLog(db, new KeyValueLogStore(memoryBackend));
});

describe('fourth racquet from data alone', () => {
  test('topbar gets a button', () => {
    expect(document.getElementById('btn-racquet-test4')?.textContent).toBe('Pure Strike 98');
    expect(document.querySelectorAll('#topbar-racquets button')).toHaveLength(4);
  });

  test('a hidden container with the derived context line', () => {
    const content = document.getElementById('test4-content')!;
    expect(content.style.display).toBe('none');
    expect(content.querySelector('.ctx-name')?.textContent).toBe('Babolat Pure Strike 98');
    expect(content.querySelector('.ctx-spec')?.textContent).toBe('62 RA · 16×19 · 98 sq in');
  });

  test('every brand section with all rows and its notes', () => {
    const content = document.getElementById('test4-content')!;
    expect(content.querySelectorAll('.brand-section')).toHaveLength(7);
    expect(content.querySelectorAll('tr[data-type="string"]')).toHaveLength(72);
    expect(content.querySelectorAll('tr[data-type="hybrid"]')).toHaveLength(10);
    const row = content.querySelector('tr[data-id="toroline-o-toro-tour"]')!;
    expect(row.querySelector('.notes')?.textContent).toBe(db.strings[0]!.perRacquet.test4!.note);
  });

  test('log and gut strips exist for it', () => {
    expect(document.querySelector('.log-section[data-racquet="test4"]')).not.toBeNull();
    expect(document.querySelector('.gut-section[data-racquet="test4"]')).not.toBeNull();
  });

  test('showRacquet switches to it and back', () => {
    showRacquet('test4');
    expect(document.getElementById('test4-content')!.style.display).toBe('block');
    expect(document.getElementById('regna-content')!.style.display).toBe('none');
    expect(document.getElementById('btn-racquet-test4')!.className).toBe('racquet-active');
    showRacquet('regna');
    expect(document.getElementById('test4-content')!.style.display).toBe('none');
  });

  test('its brand switcher works', () => {
    const yonex = document.querySelector<HTMLButtonElement>(
      '#test4-switcher [data-nav-brand="yonex"]',
    )!;
    yonex.click();
    expect(yonex.className).toBe('active-yonex');
    expect(document.getElementById('test4-yonex-section')!.classList.contains('active')).toBe(true);
    expect(document.getElementById('test4-toroline-section')!.classList.contains('active')).toBe(
      false,
    );
  });
});

describe('filters on the fourth racquet', () => {
  const rows = (): HTMLElement[] => [
    ...document.querySelectorAll<HTMLElement>('#test4-content tr[data-shape]'),
  ];
  const hidden = (): number => rows().filter((r) => r.classList.contains('filter-hidden')).length;
  const hex = (): HTMLElement =>
    document.querySelector('[data-filter-group="shape"][data-filter-value="hexagonal"]')!;

  test('a shape chip narrows its rows, with a status line and all-brands state', () => {
    showRacquet('test4');
    hex().click();
    const visible = rows().filter((r) => !r.classList.contains('filter-hidden'));
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.length).toBeLessThan(rows().length);
    expect(visible.every((r) => r.dataset.shape!.split(',').includes('hexagonal'))).toBe(true);
    expect(document.getElementById('filter-status')!.textContent).toBe(
      `${visible.length} of ${rows().length} strings`,
    );
    expect(document.getElementById('test4-switcher')!.classList.contains('filter-all-brands')).toBe(
      true,
    );
    expect(document.getElementById('filters-count')!.textContent).toBe('1');
  });

  test('clearing restores every row', () => {
    hex().click();
    expect(hidden()).toBe(0);
    expect(document.getElementById('filters-count')!.textContent).toBe('0');
    showRacquet('regna');
  });
});

describe('compare on the fourth racquet', () => {
  test('the modal has a tab for it, showing its tensions', () => {
    for (const id of ['toroline-o-toro-tour', 'toroline-caviar']) {
      const box = document.querySelector<HTMLInputElement>(
        `#test4-content input[data-compare-id="${id}"]`,
      )!;
      box.checked = true;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    }
    document.getElementById('compare-open')!.click();
    const tabs = [...document.querySelectorAll<HTMLElement>('.cmp-racquet-tab')];
    expect(tabs.map((t) => t.textContent)).toContain('Pure Strike 98');
    tabs.find((t) => t.dataset.cmpRacquet === 'test4')!.click();
    const tensions = [...document.querySelectorAll('.cmp-cell-tension')].map((c) => c.textContent);
    expect(tensions).toEqual([
      db.strings[0]!.perRacquet.test4!.tension,
      db.strings[1]!.perRacquet.test4!.tension,
    ]);
    document.getElementById('compare-modal-close')!.click();
    document.getElementById('compare-clear')!.click();
  });
});

describe('gut strip on the fourth racquet', () => {
  test('shows no pairings and the empty message when expanded', () => {
    const section = document.querySelector('.gut-section[data-racquet="test4"]')!;
    expect(section.querySelector('.gut-status-count')?.textContent).toBe('0 pairings');
    section.querySelector<HTMLElement>('[data-gut-toggle="test4"]')!.click();
    expect(section.querySelector('.gut-empty')?.textContent).toBe(
      'No gut hybrid pairings configured for this racquet.',
    );
    section.querySelector<HTMLElement>('[data-gut-toggle="test4"]')!.click();
    expect(section.querySelector('.gut-panel')!.innerHTML).toBe('');
  });
});

describe('search on the fourth racquet', () => {
  test('every string and hybrid gets an entry for it', () => {
    const entries = currentIndex().filter((i) => i.racquet === 'test4');
    expect(entries.filter((i) => i.type === 'string')).toHaveLength(72);
    expect(entries.filter((i) => i.type === 'hybrid')).toHaveLength(10);
    expect(entries[0]!.sublabel).toMatch(/· Pure Strike 98$/);
  });
});

describe('stringing log on the fourth racquet', () => {
  const q = <T extends Element>(sel: string): T => document.querySelector<T>(sel)!;
  const form = (): HTMLFormElement => q('.log-section[data-racquet="test4"] .log-form');
  const fill = (stringId: string, tension: string): void => {
    const select = form().querySelector<HTMLSelectElement>('[name="stringId"]')!;
    select.value = stringId;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    form().querySelector<HTMLInputElement>('[name="tension"]')!.value = tension;
  };
  const submit = (): void => {
    form().dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };
  const settle = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

  test('adding an entry stores numeric tension and updates strip, context line and search', async () => {
    q<HTMLElement>('[data-log-toggle="test4"]').click();
    q<HTMLElement>('[data-log-add="test4"]').click();
    fill('toroline-caviar', ' 23 / 24 kg ');
    q<HTMLElement>('.log-section[data-racquet="test4"] [data-star-value="4"]').click();
    submit();
    await settle();

    const entry = q('.log-section[data-racquet="test4"] .log-entry');
    expect(entry.querySelector('.log-entry-tension')?.textContent).toBe('@ 23/24');
    expect(q('[data-log-toggle="test4"] .log-toggle-label').textContent).toBe('Log (1)');
    expect(q('.context-line[data-racquet="test4"] .ctx-strung-meta').textContent).toBe(
      '@ 23/24 kg',
    );

    const saved = JSON.parse(stored.get('tennis_log_v2')!);
    expect(saved.entries[0]).toMatchObject({
      racquetId: 'test4',
      string: { id: 'toroline-caviar', name: 'Caviar' },
      tension: { mainsKg: 23, crossesKg: 24 },
      rating: 4,
    });
    rebuildIndex();
    expect(currentIndex().find((i) => i.type === 'log')?.sublabel).toMatch(
      /· Pure Strike 98 @ 23\/24$/,
    );
  });

  test('unparseable tension blocks saving and marks the field', async () => {
    q<HTMLElement>('[data-log-add="test4"]').click();
    fill('toroline-caviar', '23-24');
    submit();
    await settle();
    expect(form().querySelector('[name="tension"]')!.classList.contains('log-form-error')).toBe(
      true,
    );
    expect(q('[data-log-toggle="test4"] .log-toggle-label').textContent).toBe('Log (1)');
    q<HTMLElement>('.log-section[data-racquet="test4"] [data-form-cancel]').click();
  });

  test('the backup buttons show in the panel footer', () => {
    const footer = q('.log-section[data-racquet="test4"] .log-panel-footer');
    expect(footer.querySelector('[data-log-export]')?.textContent).toBe('Export log');
    expect(footer.querySelector('[data-log-import]')?.textContent).toBe('Import log');
  });
});
