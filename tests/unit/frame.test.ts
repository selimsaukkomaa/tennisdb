// @vitest-environment jsdom
// The frame profile (since v1.12): the helpers in core/frame.ts and the card's Frame section
// (ui/frame.ts), with the data's three rackets and one test frame that has no profile.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { assembleDb, copy } from '../../src/core/db';
import { beamLabel, specsLine } from '../../src/core/frame';
import type { Racquet, TennisDb } from '../../src/core/types';
import { initFrame } from '../../src/ui/frame';
import { initNav, showRacquet } from '../../src/ui/nav';
import { initPickers } from '../../src/ui/picker';
import { renderShell } from '../../src/ui/shell';

describe('helpers', () => {
  test('the specs line leaves out figures without a source', () => {
    const specs = {
      strungWeightG: 312,
      balancePtsHL: 3,
      swingweight: 318,
      beamMm: [21.5, 23, 21],
      sources: ['a'],
    };
    expect(specsLine(specs)).toBe('312 g strung · 3 pts HL · swingweight 318 · beam 21.5/23/21 mm');
    expect(specsLine({ ...specs, strungWeightG: null, swingweight: null })).toBe(
      '3 pts HL · beam 21.5/23/21 mm',
    );
    expect(
      specsLine({
        strungWeightG: null,
        balancePtsHL: null,
        swingweight: null,
        beamMm: null,
        sources: [],
      }),
    ).toBe('');
    expect(beamLabel([20])).toBe('20 mm');
  });
});

const NO_PROFILE: Racquet = {
  id: 'test-no-profile',
  brand: 'Wilson',
  model: 'Blade 98',
  headSizeSqIn: 98,
  pattern: { mains: 16, crosses: 19 },
  ra: 62,
};

const $ = <T extends Element = HTMLElement>(sel: string): T => document.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string): T[] => [
  ...document.querySelectorAll<T>(sel),
];
const section = (): HTMLElement => $('#selector [data-frame]');
const words = (): string[] => $$('.frame-trait').map((li) => li.textContent!);
const toggle = (): HTMLButtonElement => $('[data-frame-toggle]');
const isOpen = (): boolean => section().classList.contains('frame-open');

let db: TennisDb;
beforeAll(() => {
  const indexHtml = readFileSync(resolve('index.html'), 'utf8');
  document.body.innerHTML = indexHtml
    .match(/<body>([\s\S]*)<\/body>/)![1]!
    .replace(/<script[\s\S]*?<\/script>/g, '');
  localStorage.clear();
  const base = assembleDb();
  db = assembleDb({
    racquets: [...base.racquets, NO_PROFILE],
    pairings: [
      ...base.pairings,
      ...base.pairings
        .filter((p) => p.racquetId === 'regna')
        .map((p) => ({ ...p, racquetId: NO_PROFILE.id })),
    ],
  });
  renderShell(db, copy);
  initPickers();
  initFrame();
  initNav(db, copy);
});

describe("the card's Frame section", () => {
  test("gives each trait's word for the racket on screen", () => {
    expect($('#selector .frame-row .sel-label').textContent).toBe('Frame');
    expect(words()).toEqual([
      'Feel neutral',
      'Power medium-high',
      'Launch medium',
      'Spin medium',
      'Stability medium',
      'Comfort high',
      'Control high',
    ]);
  });

  test('starts closed; the button opens and closes the details', () => {
    expect(isOpen()).toBe(false);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById(toggle().getAttribute('aria-controls')!)).not.toBeNull();
    toggle().click();
    expect(isOpen()).toBe(true);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    toggle().click();
    expect(isOpen()).toBe(false);
    toggle().click();
  });

  test('the details give the summary, specs, the basis per trait and construction', () => {
    const p = db.racquets.find((r) => r.id === 'regna')!.profile!;
    expect($('.frame-edition').textContent).toBe(p.edition);
    expect($('.frame-summary').textContent).toBe(p.summary);
    expect($('.frame-specs').textContent).toBe(
      '312 g strung · 3 pts HL · swingweight 318 · beam 21.5/23/21 mm',
    );
    expect($$('.frame-basis')).toHaveLength(7);
    expect($$('.frame-construction li')).toHaveLength(p.construction.length);
    const basis = (b: HTMLElement): string =>
      `${b.querySelector('dt')!.textContent}: ${b.querySelector('dd')!.textContent}`;
    expect($$('.frame-basis').map(basis)).toEqual(
      Object.entries(p.traits).map(
        ([t, x]) => `${t[0]!.toUpperCase()}${t.slice(1)} ${x.word}: ${x.basis}`,
      ),
    );
  });

  // The sources stay in the data (the owner's call, 2026-11-23): the card names none.
  test('the details show no sources: no list, no links, no citations', () => {
    const p = db.racquets.find((r) => r.id === 'regna')!.profile!;
    const text = section().textContent!;
    expect(section().querySelectorAll('a')).toHaveLength(0);
    expect(text).not.toMatch(/\[\d/);
    expect(text).not.toContain('Sources');
    for (const s of p.sources) expect(text).not.toContain(s.title);
  });

  test("a switch shows the next racket's profile and keeps the details open", () => {
    showRacquet('percept');
    expect(words()[0]).toBe('Feel crisp');
    expect(isOpen()).toBe(true);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect($('.frame-edition').textContent).toBe('The 2023 original.');
    showRacquet('headpt630');
    expect(words()[0]).toBe('Feel damped');
    expect($('.frame-specs').textContent).toBe('beam 20 mm');
  });

  test('a racket without a profile shows no Frame section, and the next one does', () => {
    showRacquet(NO_PROFILE.id);
    expect(section().classList.contains('frame-none')).toBe(true);
    expect(section().children).toHaveLength(0);
    showRacquet('regna');
    expect(section().classList.contains('frame-none')).toBe(false);
    expect(words()).toHaveLength(7);
  });
});
