// Assembles TENNIS_DB from data/*.json. Until v0.994 the result serialised byte for byte like
// the blob the v0.990 single file embedded; since the pairings move (v0.995) the data has
// pairings.json and numeric tensions, and tests/data/legacy-roundtrip.test.ts converts it back
// to the v0.990 shape to prove nothing was lost.
import meta from '../../data/meta.json';
import racquets from '../../data/racquets.json';
import brandsStrings from '../../data/brandsStrings.json';
import strings from '../../data/strings.json';
import hybrids from '../../data/hybrids.json';
import pairings from '../../data/pairings.json';
import grips from '../../data/grips.json';
import gutStrings from '../../data/gutStrings.json';
import gutHybrids from '../../data/gutHybrids.json';
import copyJson from '../../content/copy.json';
import type { Copy, TennisDb } from './types';

/** Collection files under data/, in TENNIS_DB key order (after `version`). */
export const COLLECTIONS = [
  'racquets',
  'brandsStrings',
  'strings',
  'hybrids',
  'pairings',
  'grips',
  'gutStrings',
  'gutHybrids',
] as const;

export type Collections = Pick<TennisDb, (typeof COLLECTIONS)[number]>;

// JSON imports are typed structurally from the files; the cast pins them to the declared
// shapes; the schemas check them at build time (validate.ts), not at runtime.
const FILES = {
  racquets,
  brandsStrings,
  strings,
  hybrids,
  pairings,
  grips,
  gutStrings,
  gutHybrids,
} as unknown as Collections;

/**
 * Returns a fresh TENNIS_DB. `overrides` replaces whole collections (tests use it to add a
 * fourth racquet without touching data/).
 */
export function assembleDb(overrides: Partial<Collections> = {}): TennisDb {
  const parts = { ...FILES, ...overrides };
  const db = { version: meta.version } as TennisDb;
  for (const key of COLLECTIONS) {
    (db as unknown as Record<string, unknown>)[key] = structuredClone(parts[key]);
  }
  return db;
}

export const copy = copyJson as Copy;
