// @vitest-environment jsdom
// Phones and touch screens get the short placeholders; the desktop ones come back when the
// screen widens (src/ui/placeholders.ts, since v1.9).
import { afterEach, describe, expect, test, vi } from 'vitest';
import { initPlaceholders, SMALL_SCREEN } from '../../src/ui/placeholders';

function fakeMedia(matches: boolean) {
  const listeners: (() => void)[] = [];
  const query = {
    matches,
    media: SMALL_SCREEN,
    addEventListener: (_: string, l: () => void) => listeners.push(l),
    change(to: boolean) {
      query.matches = to;
      listeners.forEach((l) => l());
    },
  };
  vi.stubGlobal('matchMedia', (q: string) => {
    expect(q).toBe(SMALL_SCREEN);
    return query;
  });
  return query;
}

const field = (): HTMLInputElement => document.querySelector('input')!;

describe('placeholders', () => {
  afterEach(() => vi.unstubAllGlobals());

  test('short on a small screen, long again when it widens', () => {
    document.body.innerHTML =
      '<input data-short-placeholder="Search by name…" placeholder="Search strings by name, shape, notes...">';
    const media = fakeMedia(true);
    initPlaceholders();
    expect(field().placeholder).toBe('Search by name…');
    media.change(false);
    expect(field().placeholder).toBe('Search strings by name, shape, notes...');
  });

  test('unchanged on a large screen, and fields without a short text are left alone', () => {
    document.body.innerHTML =
      '<input data-short-placeholder="Short" placeholder="Long"><input placeholder="Only">';
    fakeMedia(false);
    initPlaceholders();
    const [a, b] = [...document.querySelectorAll('input')];
    expect([a!.placeholder, b!.placeholder]).toEqual(['Long', 'Only']);
  });
});
