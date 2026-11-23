// A racket's frame profile (since v1.12): what it is made of, its measured specs, and how
// published sources describe its character, trait by trait: one word from a fixed list and a
// line (`basis`) on how the frame plays. The notes draw on it; the card's Frame section shows
// all of it but the sources, which stay in the data for the evidence rule below.
//
// Evidence (the owner's calls, 2026-11-23): a trait is filled only from published sources, and
// left out where none supports it. A trait rests on a hands-on review or on players' reports
// (forum posts, user comments); articles (news, maker or retailer copy, spec listings) supply
// construction and specs, never a trait (validate.ts: profile-evidence). It takes a review or
// two players who agree; for the Regna 100 alone, which has no professional review, one
// player's report or a personal blog may count. That part is the editor's judgement, and the
// changelog records it.
//
// The texts never say who said what (the owner's call, 2026-11-23): a line describes the frame,
// and where sources disagree it gives the reading its word rests on while the changelog flags
// the disagreement, as for the notes.
import type { Racquet } from './types';

/** The traits in the order they are shown. */
export const TRAITS = [
  'feel',
  'power',
  'launch',
  'spin',
  'stability',
  'comfort',
  'control',
] as const;
export type Trait = (typeof TRAITS)[number];

export const TRAIT_LABELS: Record<Trait, string> = {
  feel: 'Feel',
  power: 'Power',
  launch: 'Launch',
  spin: 'Spin',
  stability: 'Stability',
  comfort: 'Comfort',
  control: 'Control',
};

const LEVELS = ['low', 'medium', 'high'] as const;

/** Each trait's words, low or soft first. Power uses Tennis Warehouse's power-level scale. */
export const TRAIT_WORDS = {
  feel: ['damped', 'neutral', 'crisp'],
  power: ['low', 'low-medium', 'medium', 'medium-high', 'high'],
  launch: LEVELS,
  spin: LEVELS,
  stability: LEVELS,
  comfort: LEVELS,
  control: LEVELS,
} as const satisfies Record<Trait, readonly string[]>;

/**
 * What a source is: a hands-on review; players' reports (forum posts, user comments); or an
 * article (news, features, history, maker or retailer copy, spec listings).
 */
export const SOURCE_KINDS = ['review', 'players', 'article'] as const;
export type SourceKind = (typeof SOURCE_KINDS)[number];

/** The summary's length in words. */
export const SUMMARY_WORDS = { min: 35, max: 70 } as const;

export type Profile = NonNullable<Racquet['profile']>;
export type ProfileSource = Profile['sources'][number];

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length;

/** "21.5/23/21 mm" */
export const beamLabel = (beam: readonly number[]): string => `${beam.join('/')} mm`;

/**
 * The measured specs as one line, e.g. "312 g strung · 3 pts HL · swingweight 318 · beam
 * 21.5/23/21 mm"; the ones without a published figure are left out.
 */
export function specsLine(specs: Profile['specs']): string {
  return [
    specs.strungWeightG === null ? null : `${specs.strungWeightG} g strung`,
    specs.balancePtsHL === null ? null : `${specs.balancePtsHL} pts HL`,
    specs.swingweight === null ? null : `swingweight ${specs.swingweight}`,
    specs.beamMm === null ? null : `beam ${beamLabel(specs.beamMm)}`,
  ]
    .filter((x) => x !== null)
    .join(' · ');
}

/** Every source id a profile cites: construction lines, specs and traits. */
export function citedSources(p: Profile): string[] {
  return [
    ...p.construction.flatMap((c) => c.sources),
    ...p.specs.sources,
    ...TRAITS.flatMap((t) => p.traits[t]?.sources ?? []),
  ];
}
