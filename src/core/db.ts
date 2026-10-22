// Assembles TENNIS_DB from data/*.json in the v0.990 key order, so the result serialises
// byte for byte like the blob the single-file app embedded.
import meta from '../../data/meta.json';
import racquets from '../../data/racquets.json';
import brandsStrings from '../../data/brandsStrings.json';
import strings from '../../data/strings.json';
import hybrids from '../../data/hybrids.json';
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
  'grips',
  'gutStrings',
  'gutHybrids',
] as const;

export type Collections = Pick<TennisDb, (typeof COLLECTIONS)[number]>;

// JSON imports are typed structurally from the files; the cast pins them to the declared
// shapes. Phase 2 swaps this for Zod parsing.
const FILES = {
  racquets,
  brandsStrings,
  strings,
  hybrids,
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
