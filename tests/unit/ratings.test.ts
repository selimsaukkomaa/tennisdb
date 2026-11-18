// Rating words derived from the score on two scales (docs/phase-2-data-model.md, D5; v1.6).
import { describe, expect, test } from 'vitest';
import { ratingBar, ratingLabel } from '../../src/core/ratings';

describe('the amount scale (power, spin, tackiness, absorption, gut protection)', () => {
  test.each([
    [0, 'Low'],
    [34, 'Low'],
    [35, 'Low-Med'],
    [44, 'Low-Med'],
    [45, 'Medium'],
    [59, 'Medium'],
    [60, 'Med-High'],
    [74, 'Med-High'],
    [75, 'High'],
    [84, 'High'],
    [85, 'Very High'],
    [94, 'Very High'],
    [95, 'Elite'],
    [100, 'Elite'],
  ])('%s is %s', (score, word) => {
    expect(ratingLabel('power', score)).toBe(word);
    expect(ratingLabel('gutProtection', score)).toBe(word);
  });
});

describe('the quality scale (control, comfort, durability)', () => {
  test.each([
    [0, 'Low'],
    [44, 'Low'],
    [45, 'Moderate'],
    [59, 'Moderate'],
    [60, 'Good'],
    [77, 'Good'],
    [78, 'Very Good'],
    [87, 'Very Good'],
    [88, 'Excellent'],
    [94, 'Excellent'],
    [95, 'Outstanding'],
  ])('%s is %s', (score, word) => {
    expect(ratingLabel('control', score)).toBe(word);
    expect(ratingLabel('durability', score)).toBe(word);
  });
});

test('the bar is the score with its word; a missing rating draws none', () => {
  expect(ratingBar('comfort', 82)).toEqual({ label: 'Very Good', width: 82 });
  expect(ratingBar('gutProtection', null)).toBeUndefined();
  expect(ratingBar('tackiness', undefined)).toBeUndefined();
});
