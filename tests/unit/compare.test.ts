import { describe, expect, test } from 'vitest';
import { CompareSelection, MAX_COMPARE, findCompareItem } from '../../src/core/compare';
import { assembleDb } from '../../src/core/db';

describe('CompareSelection', () => {
  test('keeps pick order and toggles off', () => {
    const s = new CompareSelection();
    s.toggle('b');
    s.toggle('a');
    expect(s.selected).toEqual(['b', 'a']);
    s.toggle('b');
    expect(s.selected).toEqual(['a']);
  });

  test('opens from 2 and refuses a fifth', () => {
    const s = new CompareSelection();
    s.toggle('a');
    expect(s.canOpen).toBe(false);
    s.toggle('b');
    expect(s.canOpen).toBe(true);
    s.toggle('c');
    s.toggle('d');
    expect(s.isFull).toBe(true);
    expect(s.toggle('e')).toBe(false);
    expect(s.selected).toHaveLength(MAX_COMPARE);
  });

  test('remove and clear', () => {
    const s = new CompareSelection();
    ['a', 'b', 'c'].forEach((id) => s.toggle(id));
    s.remove('b');
    expect(s.selected).toEqual(['a', 'c']);
    s.clear();
    expect(s.selected).toEqual([]);
  });
});

test('findCompareItem resolves strings and hybrids', () => {
  const db = assembleDb();
  expect(findCompareItem(db, 'toroline-caviar')?.kind).toBe('string');
  expect(findCompareItem(db, 'toroline-k-pop')?.kind).toBe('hybrid');
  expect(findCompareItem(db, 'nope')).toBeNull();
});
