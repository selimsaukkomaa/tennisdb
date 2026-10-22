import { describe, expect, test } from 'vitest';
import { matchesAny, tokens } from '../../src/core/chips';
import {
  emptyGripFilter,
  emptyStringFilter,
  isStringFilterActive,
  matchesGripRow,
  matchesStringRow,
  toggleValue,
} from '../../src/core/filters';

const row = {
  text: 'O-Toro Tour Hexagonal Crisp Firm',
  shapeAttr: 'hexagonal',
  feelAttr: 'crisp,firm',
};

describe('token matching', () => {
  test('splits on commas', () => {
    expect(tokens('cushioned,tacky')).toEqual(['cushioned', 'tacky']);
    expect(tokens(undefined)).toEqual(['']);
  });

  test('matches whole tokens, never substrings', () => {
    expect(matchesAny('cushioned,tacky', ['tacky'])).toBe(true);
    expect(matchesAny('cushioned,tacky', ['tack'])).toBe(false);
    expect(matchesAny('cushioned,tacky', ['cushion'])).toBe(false);
  });
});

describe('string filter', () => {
  test('empty filter matches everything and is inactive', () => {
    const f = emptyStringFilter();
    expect(isStringFilterActive(f)).toBe(false);
    expect(matchesStringRow(row, f)).toBe(true);
  });

  test('OR within a group', () => {
    const f = { ...emptyStringFilter(), shape: ['round', 'hexagonal'] };
    expect(matchesStringRow(row, f)).toBe(true);
  });

  test('AND across groups', () => {
    expect(
      matchesStringRow(row, { ...emptyStringFilter(), shape: ['hexagonal'], feel: ['firm'] }),
    ).toBe(true);
    expect(
      matchesStringRow(row, { ...emptyStringFilter(), shape: ['hexagonal'], feel: ['soft'] }),
    ).toBe(false);
  });

  test('search is a case-insensitive substring of the row text', () => {
    expect(matchesStringRow(row, { ...emptyStringFilter(), search: 'o-toro' })).toBe(true);
    expect(matchesStringRow(row, { ...emptyStringFilter(), search: 'caviar' })).toBe(false);
  });

  test('a multi-shape hybrid matches either of its shapes', () => {
    const hybrid = { text: 'K-Pop', shapeAttr: 'hexagonal,square', feelAttr: 'crisp,firm' };
    expect(matchesStringRow(hybrid, { ...emptyStringFilter(), shape: ['square'] })).toBe(true);
  });
});

describe('grip filter', () => {
  const grip = { text: 'Tourna Grip Original', gripType: 'dry', gripFeelAttr: 'dry,absorbent' };

  test('type and feel chips', () => {
    expect(matchesGripRow(grip, { ...emptyGripFilter(), type: ['dry'] })).toBe(true);
    expect(matchesGripRow(grip, { ...emptyGripFilter(), type: ['wet'] })).toBe(false);
    expect(matchesGripRow(grip, { ...emptyGripFilter(), feel: ['dry'] })).toBe(true);
    expect(matchesGripRow(grip, { ...emptyGripFilter(), feel: ['absorb'] })).toBe(false);
  });
});

test('toggleValue adds then removes', () => {
  const values: string[] = [];
  expect(toggleValue(values, 'hexagonal')).toBe(true);
  expect(values).toEqual(['hexagonal']);
  expect(toggleValue(values, 'hexagonal')).toBe(false);
  expect(values).toEqual([]);
});
