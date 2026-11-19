// @vitest-environment jsdom
// The remembered racquet and strings (src/ui/prefs.ts, since v1.10): stored on the device,
// restored at start, ignored when unreadable or no longer in the data.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { assembleDb, copy } from '../../src/core/db';
import { initNav, showBrand } from '../../src/ui/nav';
import { CHOICE_KEY, loadChoice, saveChoice } from '../../src/ui/prefs';
import { renderShell } from '../../src/ui/shell';

const db = assembleDb();
const body = readFileSync(resolve('index.html'), 'utf8')
  .match(/<body>([\s\S]*)<\/body>/)![1]!
  .replace(/<script[\s\S]*?<\/script>/g, '');

/** Boots the shell and navigation as main.ts does, with whatever is stored. */
function boot(): void {
  document.body.innerHTML = body;
  renderShell(db, copy);
  initNav(db, copy);
}
const card = (): string =>
  [...document.querySelectorAll('#selector .sel-title span')].map((s) => s.textContent).join(' ');
const pages = (): string[] =>
  [...document.querySelectorAll<HTMLElement>('[data-racquet-page]')].map(
    (p) => p.dataset.racquetPage!,
  );

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllGlobals());

describe('loadChoice and saveChoice', () => {
  test('nothing stored, or nothing usable, reads as empty', () => {
    expect(loadChoice()).toEqual({});
    localStorage.setItem(CHOICE_KEY, '{not json');
    expect(loadChoice()).toEqual({});
    localStorage.setItem(CHOICE_KEY, 'null');
    expect(loadChoice()).toEqual({ racquet: undefined, brand: undefined });
    localStorage.setItem(CHOICE_KEY, JSON.stringify({ racquet: 7, brand: 'yonex' }));
    expect(loadChoice()).toEqual({ racquet: undefined, brand: 'yonex' });
  });

  test('a round trip', () => {
    saveChoice({ racquet: 'percept', brand: 'gut' });
    expect(loadChoice()).toEqual({ racquet: 'percept', brand: 'gut' });
  });

  test('storage that refuses is survived', () => {
    const refuse = (): never => {
      throw new Error('SecurityError');
    };
    vi.stubGlobal('localStorage', { getItem: refuse, setItem: refuse });
    expect(loadChoice()).toEqual({});
    expect(() => saveChoice({ racquet: 'regna', brand: 'toroline' })).not.toThrow();
  });
});

describe('the start state', () => {
  test('a first visit opens on the first racquet and brand', () => {
    boot();
    expect(card()).toBe('Regna 100 × Toroline');
    expect(pages()).toEqual(['regna']);
  });

  test('a remembered choice is restored, building only its page', () => {
    saveChoice({ racquet: 'percept', brand: 'yonex' });
    boot();
    expect(card()).toBe('Percept 100D × Yonex');
    expect(pages()).toEqual(['percept']);
    expect(document.getElementById('percept-yonex-section')!.classList.contains('active')).toBe(
      true,
    );
  });

  test('natural gut is restored too', () => {
    saveChoice({ racquet: 'headpt630', brand: 'gut' });
    boot();
    expect(card()).toBe('Pro Tour 630 × Natural gut');
    expect(document.getElementById('headpt630-gut-section')!.classList.contains('active')).toBe(
      true,
    );
  });

  test('ids the data no longer has fall back to the first', () => {
    saveChoice({ racquet: 'retired-frame', brand: 'retired-brand' });
    boot();
    expect(card()).toBe('Regna 100 × Toroline');
  });

  test('storage that refuses starts as a first visit', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('SecurityError');
      },
    });
    boot();
    expect(card()).toBe('Regna 100 × Toroline');
  });

  test('each choice is stored', () => {
    boot();
    showBrand('solinco');
    expect(loadChoice()).toEqual({ racquet: 'regna', brand: 'solinco' });
  });
});
