// Ratings: a score from 0 to 100 and a label from the axis's list of words. The bar the views
// draw is derived here; the score is its fill.
//
// The lists hold the words in use today, lowest first (docs/phase-2-data-model.md, D5). They
// are not unified yet: "Medium" and "Moderate", "Med-High" and "Mod-High" stand side by side,
// placed by the lowest score each is used at, until a content pass of its own settles them.
import type { Bar } from './types';

/** Gut pairings are rated on their own scale, with "Med" where the strings say "Medium". */
const GUT_SCALE = ['Med-Low', 'Med', 'Med-High', 'High', 'Very High'] as const;

export const RATING_WORDS = {
  // strings and hybrids
  power: ['Low', 'Low-Med', 'Med-Low', 'Medium', 'Med-High', 'High', 'Very High'],
  spin: [
    'Low',
    'Low-Med',
    'Med-Low',
    'Medium',
    'Moderate',
    'Mod-High',
    'Med-High',
    'High',
    'High (Slice)',
    'Very High',
    'Elite',
  ],
  // strings
  control: ['Low-Med', 'Moderate', 'Good', 'Very Good', 'Very High', 'Excellent', 'Outstanding'],
  comfort: [
    'Low',
    'Low-Mod',
    'Med-Low',
    'Moderate',
    'Medium',
    'Good',
    'Med-High',
    'Very Good',
    'High',
    'Very High',
    'Excellent',
    'Elite',
  ],
  // grips
  tackiness: ['Low', 'Low-Med', 'Moderate', 'High', 'Very High', 'Elite'],
  absorption: ['Low', 'Med-Low', 'Medium', 'Moderate', 'High', 'Very High', 'Excellent', 'Elite'],
  durability: ['Low', 'Moderate', 'Medium', 'Good', 'Very Good', 'Excellent'],
  // gut pairings
  gutPower: GUT_SCALE,
  gutSpin: GUT_SCALE,
  gutComfort: ['Very Good', 'Excellent', 'Outstanding'],
  gutProtection: GUT_SCALE,
} as const;

export type RatingAxis = keyof typeof RATING_WORDS;

export interface Rating {
  score: number;
  label: string;
}

/** The rating as the labelled bar the tables, compare and the gut table draw. */
export function ratingBar(r: Rating | null | undefined): Bar | undefined {
  return r ? { label: r.label, width: r.score } : undefined;
}
