// Zod schemas for TENNIS_DB and the UI copy, describing the data as stored. Phase 2 step 2
// replaces display strings with values one move at a time (docs/phase-2-data-model.md):
// tensions are numbers and pairings are their own records since v0.995.
//
// The schemas own the data's shape: required and optional fields, no unknown keys, formats
// (ids, colours, bar widths) and the token lists the filter chips match. They are written so
// every constraint survives the JSON Schema export (`npm run schemas`), which a native app can
// build on. Content and cross-record rules (neutral text, a note per racquet, references, CSS
// coverage) stay in validate.ts, which runs these schemas first.
//
// types.ts infers the TypeScript types from here with type-only imports, so the app bundle
// never loads this module.
import { z } from 'zod';
import { FEEL_CHIPS, SHAPE_CHIPS } from './chips';
import { MAX_KG, MIN_KG } from './log/tension';
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

export const BarSchema = z
  .strictObject({ label: Text, width: z.int().min(0).max(100) })
  .meta({ id: 'Bar', description: 'A labelled bar; width is the fill percentage.' });

export const FeelTagSchema = z
  .strictObject({ label: Text, variant: z.enum(TAG_VARIANT_NAMES) })
  .meta({ id: 'FeelTag' });

export const RacquetSchema = z
  .strictObject({
    id: Id,
    brand: Text,
    model: Text,
    headSize: z.string().regex(/^\d+ sq in$/),
    pattern: z.string().regex(/^\d+×\d+$/),
    ra: z.int().min(40).max(80),
    label: Text,
  })
  .meta({ id: 'Racquet' });

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
const FEEL_TOKENS = tokenList(
  FEEL_CHIPS.map((c) => c.value),
  'Comma-separated feel tokens matched by the Feel chips.',
);

export const StringSchema = z
  .strictObject({
    name: Text,
    shape: Text,
    shapeAttr: SHAPE_TOKENS,
    feelAttr: FEEL_TOKENS,
    gauges: z.array(Text).min(1),
    colors: ColorsSchema,
    stiffness: BarSchema,
    power: BarSchema,
    spin: BarSchema,
    control: BarSchema,
    comfort: BarSchema,
    feelTags: z.array(FeelTagSchema),
    feelSummary: Text,
    feelExpand: Text,
    id: Id,
    brand: Id,
  })
  .meta({ id: 'String' });

const HybridSideSchema = z.strictObject({
  string: Text,
  /** Empty when the gauge is part of `string` (Toroline Cole). */
  gauge: z.string(),
  shapeFeelLabel: Text,
});

export const HybridSchema = z
  .strictObject({
    name: Text,
    shapeAttr: SHAPE_TOKENS,
    feelAttr: FEEL_TOKENS,
    mains: HybridSideSchema,
    crosses: HybridSideSchema,
    stiffness: BarSchema,
    power: BarSchema,
    spin: BarSchema,
    feelTags: z.array(FeelTagSchema),
    feelSummary: Text,
    feelExpand: Text,
    id: Id,
    brand: Id,
  })
  .meta({ id: 'Hybrid' });

export const GripSchema = z
  .strictObject({
    name: Text,
    model: Text,
    modelVariants: z.array(Text).optional(),
    specs: z.array(Text).meta({ description: 'May contain inline HTML (one <em> today).' }),
    tackiness: BarSchema.optional(),
    absorption: BarSchema.optional(),
    durability: BarSchema.optional(),
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
    power: BarSchema,
    spin: BarSchema,
    comfort: BarSchema,
    /** null for the gut-crosses pairings. */
    gutProtection: BarSchema.nullable(),
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
