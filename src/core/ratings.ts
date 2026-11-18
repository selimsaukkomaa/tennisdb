// Ratings: a score from 0 to 100, drawn as the bar's fill. The word beside the bar is derived
// from the score on one of two scales (docs/phase-2-data-model.md, D5; since v1.6), so a word
// always agrees with its bar: an amount scale for what a string or grip has more or less of,
// and a quality scale for how good it is at something.
import type { Bar } from './types';

/** Each word from its lowest score; a scale's first word starts at 0. */
type Scale = readonly (readonly [word: string, from: number])[];

/** Power, spin, tackiness, absorption, gut protection. */
export const AMOUNT_WORDS: Scale = [
  ['Low', 0],
  ['Low-Med', 35],
  ['Medium', 45],
  ['Med-High', 60],
  ['High', 75],
  ['Very High', 85],
  ['Elite', 95],
];

/** Control, comfort, durability. */
export const QUALITY_WORDS: Scale = [
  ['Low', 0],
  ['Moderate', 45],
  ['Good', 60],
  ['Very Good', 78],
  ['Excellent', 88],
  ['Outstanding', 95],
];

/** Gut pairings use the same scales: their power and spin are amounts, comfort a quality. */
export const RATING_SCALES = {
  power: AMOUNT_WORDS,
  spin: AMOUNT_WORDS,
  tackiness: AMOUNT_WORDS,
  absorption: AMOUNT_WORDS,
  gutProtection: AMOUNT_WORDS,
  control: QUALITY_WORDS,
  comfort: QUALITY_WORDS,
  durability: QUALITY_WORDS,
} as const;

export type RatingAxis = keyof typeof RATING_SCALES;

/** The word for a score: the last on the axis's scale whose lowest score it reaches. */
export function ratingLabel(axis: RatingAxis, score: number): string {
  let word = RATING_SCALES[axis][0]![0];
  for (const [w, from] of RATING_SCALES[axis]) if (score >= from) word = w;
  return word;
}

/** The rating as the labelled bar the tables, compare and the gut table draw. */
export function ratingBar(axis: RatingAxis, score: number | null | undefined): Bar | undefined {
  return score === null || score === undefined
    ? undefined
    : { label: ratingLabel(axis, score), width: score };
}
