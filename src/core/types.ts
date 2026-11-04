// Shapes of the data, inferred from the Zod schemas in schema.ts, the single source. The
// imports are type-only, so the app bundle never loads the schemas.
import type { z } from 'zod';
import type * as S from './schema';

export type RacquetId = string;
export type BrandId = string;

export const GRIP_TYPES = ['wet', 'dry', 'replacement'] as const;
export type GripType = (typeof GRIP_TYPES)[number];

export type Racquet = z.infer<typeof S.RacquetSchema>;
export type Brand = z.infer<typeof S.BrandSchema>;
/** A labelled bar: `width` is the fill percentage. */
export type Bar = z.infer<typeof S.BarSchema>;
export type FeelTag = z.infer<typeof S.FeelTagSchema>;
export type PerRacquet = z.infer<typeof S.PerRacquetSchema>;
export type StringRec = z.infer<typeof S.StringSchema>;
export type Colors = StringRec['colors'];
export type Hybrid = z.infer<typeof S.HybridSchema>;
export type HybridSide = Hybrid['mains'];
export type Grip = z.infer<typeof S.GripSchema>;
export type GutString = z.infer<typeof S.GutStringSchema>;
export type GutPairing = z.infer<typeof S.GutPairingSchema>;
export type GutSide = GutPairing['mains'];
export type TennisDb = z.infer<typeof S.TennisDbSchema>;
/** Prose that lived in markup or JS in v0.990 (HTML strings, verbatim). */
export type Copy = z.infer<typeof S.CopySchema>;
