// Zod schemas for TENNIS_DB and the UI copy, describing the data as stored. Phase 2 step 2
// replaces display strings with values one move at a time (docs/phase-2-data-model.md):
// tensions are numbers and pairings are their own records since v0.995, hybrid sides link
// to their strings since v0.996, racquet fields are values since v0.997, stiffness is a band
// plus a figure with its provenance since v0.998, and ratings are a score plus a word from
// their axis's list since v0.999. Since v1.0 every string here is plain text: the one grip spec
// that held markup is `{ text, emphasis }`, and validate.ts keeps tags and entities out
// (plain-text).
//
// The schemas own the data's shape: required and optional fields, no unknown keys, formats
// (ids, colours, rating scores) and the token lists the filter chips match. They are written so
// every constraint survives the JSON Schema export (`npm run schemas`), which a native app can
// build on. Content and cross-record rules (neutral text, a note per racquet, references, CSS
// coverage) stay in validate.ts, which runs these schemas first.
//
// types.ts infers the TypeScript types from here with type-only imports, so the app bundle
// never loads this module.
import { z } from 'zod';
import { FEEL_CHIPS, SHAPE_CHIPS } from './chips';
import { MAX_KG, MIN_KG } from './log/tension';
import { RATING_WORDS, type RatingAxis } from './ratings';
import { STIFFNESS_BANDS } from './stiffness';
import { GRIP_TYPES } from './types';

const Id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const Hex = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/); // no flags: JSON Schema patterns have none
const Text = z.string().min(1);

/** Comma-separated tokens, each one of `values`. */
function tokenList(values: readonly string[], description: string): z.ZodString {
  const one = `(${values.join('|')})`;
  return z
    .string()
    .regex(new RegExp(`^${one}(,${one})*$`))
    .meta({ description });
}

/** Tag colours; each has a `.tag-<variant>` rule in the stylesheet (checked by validate.ts). */
export const TAG_VARIANT_NAMES = ['crisp', 'firm', 'soft', 'round', 'lively', 'plush'] as const;

const BarWidth = z.int().min(0).max(100);

/**
 * A rating: a score from 0 to 100, drawn as the bar's fill, and a label from the axis's list of
 * words (ratings.ts). validate.ts checks that the words keep their order (rating-order).
 */
const rating = <A extends RatingAxis>(axis: A, id: string) =>
  z
    .strictObject({ score: BarWidth, label: z.enum(RATING_WORDS[axis]) })
    .meta({ id, description: 'A score from 0 to 100 and a word from the list for its axis.' });
const PowerRating = rating('power', 'PowerRating');
const SpinRating = rating('spin', 'SpinRating');
const ControlRating = rating('control', 'ControlRating');
const ComfortRating = rating('comfort', 'ComfortRating');
const TackinessRating = rating('tackiness', 'TackinessRating');
const AbsorptionRating = rating('absorption', 'AbsorptionRating');
const DurabilityRating = rating('durability', 'DurabilityRating');
const GutPowerRating = rating('gutPower', 'GutPowerRating');
const GutSpinRating = rating('gutSpin', 'GutSpinRating');
const GutComfortRating = rating('gutComfort', 'GutComfortRating');
const GutProtectionRating = rating('gutProtection', 'GutProtectionRating');

/** Stiffness bands, softest first (stiffness.ts; "Med" folded into "Medium" in v1.1). */
const Band = z.enum(STIFFNESS_BANDS);
const KgPerMm = z.number().min(0.2).max(2);

/**
 * A lab stiffness figure. "legacy" marks the figures carried over from v0.990 without a
 * recorded source or date; a re-check upgrades one to a named source and a retrieval month
 * (validate.ts: stiffness-provenance).
 */
export const StiffnessFigureSchema = z
  .strictObject({
    kgPerMm: z.union([KgPerMm, z.strictObject({ min: KgPerMm, max: KgPerMm })]),
    /** Shown with a "~". */
    approx: z.boolean(),
    source: z.enum(['legacy', 'Racketpedia', 'manufacturer', 'review']),
    retrieved: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
      .nullable(),
  })
  .meta({ id: 'StiffnessFigure' });

/**
 * A string's stiffness. With a lab figure the band is derived from it (stiffness.ts: bandFor)
 * and not stored; without one the band is stored, an estimate. The bar is derived from either
 * (stiffness.ts: stiffnessWidth), on one scale for every brand since v1.3.
 */
export const StiffnessSchema = z
  .union([
    z.strictObject({ figure: StiffnessFigureSchema }),
    z.strictObject({ band: Band, figure: z.null() }),
  ])
  .meta({
    id: 'Stiffness',
    description: 'A figure (the band is derived from it), or no figure and an estimated band.',
  });

/** A hybrid's stiffness is a judgement of the bed: a band, never a figure; its bar sits at the band's midpoint. */
const HybridStiffnessSchema = z.strictObject({ band: Band });

export const FeelTagSchema = z
  .strictObject({ label: Text, variant: z.enum(TAG_VARIANT_NAMES) })
  .meta({ id: 'FeelTag' });

export const RacquetSchema = z
  .strictObject({
    id: Id,
    brand: Text,
    model: Text,
    /** Square inches, the unit printed on frames (the owner's pick; cm² is not stored). */
    headSizeSqIn: z.int().min(80).max(140),
    /** String pattern: mains × crosses. */
    pattern: z.strictObject({ mains: z.int().min(12).max(22), crosses: z.int().min(14).max(24) }),
    ra: z.int().min(40).max(80),
  })
  .meta({
    id: 'Racquet',
    description:
      'Shown as "<brand> <model>" with the spec "<ra> RA · <mains>×<crosses> · <n> sq in".',
  });

export const BrandSchema = z.strictObject({ name: Text, accent: Hex }).meta({ id: 'Brand' });

const ColorsSchema = z.strictObject({
  dots: z.array(z.strictObject({ hex: Hex, name: Text })),
  label: Text,
});

const Kg = z.number().min(MIN_KG).max(MAX_KG);
const RangeTension = z.strictObject({ kind: z.literal('range'), minKg: Kg, maxKg: Kg });
const MaxTension = z.strictObject({ kind: z.literal('max'), maxKg: Kg });
const PrestretchTension = z.strictObject({
  kind: z.literal('prestretch'),
  kg: Kg,
  prestretchPct: z.number().min(0).max(30),
});
const SplitTension = z
  .strictObject({ kind: z.literal('split'), mainsKg: Kg, crossesKg: Kg })
  .meta({ id: 'SplitTension', description: 'Mains / crosses, as in a hybrid or a gut pairing.' });

/** A recommended tension in kg. Printed as "22–24", "max 16", "25 (5% PS)" or "23/24". */
export const TensionSchema = z
  .discriminatedUnion('kind', [RangeTension, MaxTension, PrestretchTension, SplitTension])
  .meta({ id: 'Tension' });

const StringTension = z.discriminatedUnion('kind', [RangeTension, MaxTension, PrestretchTension]);

/**
 * How a string or hybrid is strung in one racquet. Every item has one per racquet, with a
 * note of at least 40 characters (content rules in validate.ts: pairings-complete,
 * notes-present). Strings take a range, a maximum or a prestretch; hybrids a split.
 */
export const PairingSchema = z
  .discriminatedUnion('itemKind', [
    z.strictObject({
      itemId: Id,
      itemKind: z.literal('string'),
      racquetId: Id,
      tension: StringTension,
      note: z.string(),
    }),
    z.strictObject({
      itemId: Id,
      itemKind: z.literal('hybrid'),
      racquetId: Id,
      tension: SplitTension,
      note: z.string(),
    }),
  ])
  .meta({ id: 'Pairing', description: 'How a string or hybrid is strung in one racquet.' });

const SHAPE_TOKENS = tokenList(
  SHAPE_CHIPS.map((c) => c.value),
  'Comma-separated shape tokens matched by the Shape chips.',
);
// Firm and Soft are derived from the stiffness band since v1.1 (stiffness.ts: feelTokens), so
// only Crisp, Plush and Lively are stored, and a row may store none.
const STORED_FEEL = FEEL_CHIPS.map((c) => c.value).filter((v) => v !== 'firm' && v !== 'soft');
const FEEL_TOKENS = z
  .string()
  .regex(new RegExp(`^(${STORED_FEEL.join('|')})?(,(${STORED_FEEL.join('|')}))*$`))
  .meta({
    description:
      'Comma-separated stored feel tokens (crisp, plush, lively), possibly none. Firm and Soft come from the stiffness band.',
  });

export const StringSchema = z
  .strictObject({
    name: Text,
    shape: Text,
    shapeAttr: SHAPE_TOKENS,
    feelAttr: FEEL_TOKENS,
    gauges: z.array(Text).min(1),
    colors: ColorsSchema,
    stiffness: StiffnessSchema,
    power: PowerRating,
    spin: SpinRating,
    control: ControlRating,
    comfort: ComfortRating,
    feelTags: z.array(FeelTagSchema),
    feelSummary: Text,
    feelExpand: Text,
    id: Id,
    brand: Id,
  })
  .meta({ id: 'String' });

const HybridSideSchema = z.strictObject({
  /** The string as the hybrid names it, shown as is. */
  string: Text,
  /** Empty when the gauge is part of `string` (Toroline Cole). */
  gauge: z.string(),
  shapeFeelLabel: Text,
  stringId: Id.nullable().meta({
    description: 'The string this side uses; null when it is not in the data (Wasabi X).',
  }),
});

export const HybridSchema = z
  .strictObject({
    name: Text,
    shapeAttr: SHAPE_TOKENS,
    feelAttr: FEEL_TOKENS,
    mains: HybridSideSchema,
    crosses: HybridSideSchema,
    stiffness: HybridStiffnessSchema,
    power: PowerRating,
    spin: SpinRating,
    feelTags: z.array(FeelTagSchema),
    feelSummary: Text,
    feelExpand: Text,
    id: Id,
    brand: Id,
  })
  .meta({ id: 'Hybrid' });

/** One line of a grip's specs; `emphasis` draws it in amber (v0.990's inline <em>). */
export const GripSpecSchema = z.strictObject({ text: Text, emphasis: z.boolean() }).meta({
  id: 'GripSpec',
  description: 'One line of the specs of a grip; emphasis draws it in amber.',
});

export const GripSchema = z
  .strictObject({
    name: Text,
    model: Text,
    modelVariants: z.array(Text).optional(),
    specs: z.array(GripSpecSchema),
    tackiness: TackinessRating.optional(),
    absorption: AbsorptionRating.optional(),
    durability: DurabilityRating.optional(),
    feelTags: z.array(FeelTagSchema),
    feelSummary: Text,
    feelExpand: Text,
    colors: Text,
    packSizes: Text.optional(),
    notes: Text,
    gripType: z.enum(GRIP_TYPES),
    // Empty is allowed here so validate.ts can report an untagged grip by name (grip-tags).
    gripFeelAttr: z
      .string()
      .regex(/^([a-z]+(,[a-z]+)*)?$/)
      .meta({ description: 'Comma-separated feel tokens; the grip Feel chips match some.' }),
    id: Id,
    material: Text.optional(),
    materialVariant: Text.optional(),
  })
  .meta({ id: 'Grip' });

export const GutStringSchema = z
  .strictObject({
    id: Id,
    brand: Id,
    name: Text,
    gauges: z.array(Text).min(1),
    description: Text,
    priceNote: Text,
  })
  .meta({ id: 'GutString' });

const GutSideSchema = z.strictObject({ string: Text, gauge: Text, stringId: Id });

export const GutPairingSchema = z
  .strictObject({
    id: Id,
    racquetId: Id,
    config: z.enum(['gut-mains', 'gut-crosses']),
    mains: GutSideSchema,
    crosses: GutSideSchema,
    feelLabel: Text,
    power: GutPowerRating,
    spin: GutSpinRating,
    comfort: GutComfortRating,
    /** null for the gut-crosses pairings. */
    gutProtection: GutProtectionRating.nullable(),
    tension: SplitTension,
    notes: z.string(),
  })
  .meta({ id: 'GutPairing' });

export const TennisDbSchema = z
  .strictObject({
    version: z.string().regex(/^\d+\.\d{3}$/),
    racquets: z.array(RacquetSchema).min(1),
    brandsStrings: z.record(Id, BrandSchema),
    strings: z.array(StringSchema),
    hybrids: z.array(HybridSchema),
    pairings: z.array(PairingSchema),
    grips: z.record(Id, z.partialRecord(z.enum(GRIP_TYPES), z.array(GripSchema))),
    gutStrings: z.array(GutStringSchema),
    gutHybrids: z.array(GutPairingSchema),
  })
  .meta({ id: 'TennisDb', description: 'The equipment database (data/*.json, assembled).' });

const LegendItemSchema = z.strictObject({ swatch: Text, label: Text });

export const CopySchema = z
  .strictObject({
    /** Per brand: shown under the brand's tables; `byRacquet` overrides it for one frame. */
    brandFooters: z.record(
      Id,
      z.strictObject({ default: Text, byRacquet: z.record(Id, Text).optional() }),
    ),
    hybridCards: z.record(Id, z.strictObject({ heading: Text, intro: Text })),
    gripAbout: z.record(Id, Text),
    gutIntro: Text,
    legends: z.strictObject({
      strings: z.array(LegendItemSchema),
      grips: z.array(LegendItemSchema),
    }),
  })
  .meta({
    id: 'Copy',
    description: 'Prose that lived in v0.990 markup or JS (HTML strings, verbatim).',
  });
