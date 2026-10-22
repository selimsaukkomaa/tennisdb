// Shapes of the v0.990 data, kept exactly as extracted. Phase 2 replaces display strings
// (bar labels, tension text, stiffness labels) with raw values.

export type RacquetId = string;
export type BrandId = string;

export interface Racquet {
  id: RacquetId;
  brand: string;
  model: string;
  headSize: string;
  pattern: string;
  ra: number;
  label: string;
}

export interface Brand {
  name: string;
  accent: string;
}

/** A labelled bar: `width` is the fill percentage. */
export interface Bar {
  label: string;
  width: number;
}

export interface FeelTag {
  label: string;
  variant: string;
}

export interface Colors {
  dots: { hex: string; name: string }[];
  label: string;
}

export interface PerRacquet {
  tension: string;
  note: string;
}

interface FeelFields {
  feelTags: FeelTag[];
  feelSummary: string;
  feelExpand: string;
}

export interface StringRec extends FeelFields {
  id: string;
  brand: BrandId;
  name: string;
  shape: string;
  /** Comma-separated shape tokens matched by the Shape chips. */
  shapeAttr: string;
  /** Comma-separated feel tokens matched by the Feel chips. */
  feelAttr: string;
  gauges: string[];
  colors: Colors;
  stiffness: Bar;
  power: Bar;
  spin: Bar;
  control: Bar;
  comfort: Bar;
  perRacquet: Record<RacquetId, PerRacquet>;
}

export interface HybridSide {
  string: string;
  gauge: string;
  shapeFeelLabel: string;
}

export interface Hybrid extends FeelFields {
  id: string;
  brand: BrandId;
  name: string;
  shapeAttr: string;
  feelAttr: string;
  mains: HybridSide;
  crosses: HybridSide;
  stiffness: Bar;
  power: Bar;
  spin: Bar;
  perRacquet: Record<RacquetId, PerRacquet>;
}

export type GripType = 'wet' | 'dry' | 'replacement';
export const GRIP_TYPES: readonly GripType[] = ['wet', 'dry', 'replacement'];

export interface Grip extends FeelFields {
  id: string;
  name: string;
  model: string;
  modelVariants?: string[];
  /** Entries may contain inline HTML (one `<em>` today). */
  specs: string[];
  tackiness?: Bar;
  absorption?: Bar;
  durability?: Bar;
  colors: string;
  packSizes?: string;
  notes: string;
  gripType: GripType;
  /** Comma-separated feel tokens matched by the grip Feel chips. */
  gripFeelAttr: string;
  material?: string;
  materialVariant?: string;
}

export interface GutString {
  id: string;
  brand: string;
  name: string;
  gauges: string[];
  description: string;
  priceNote: string;
}

export interface GutSide {
  string: string;
  gauge: string;
  stringId: string;
}

export interface GutPairing {
  id: string;
  config: 'gut-mains' | 'gut-crosses';
  mains: GutSide;
  crosses: GutSide;
  feelLabel: string;
  power: Bar;
  spin: Bar;
  comfort: Bar;
  gutProtection: Bar;
  tension: string;
  notes: string;
}

export interface TennisDb {
  version: string;
  racquets: Racquet[];
  brandsStrings: Record<BrandId, Brand>;
  strings: StringRec[];
  hybrids: Hybrid[];
  grips: Record<BrandId, Partial<Record<GripType, Grip[]>>>;
  gutStrings: GutString[];
  gutHybrids: Record<RacquetId, GutPairing[]>;
}

/** Prose that lived in markup or JS in v0.990 (HTML strings, verbatim). */
export interface Copy {
  /** Per brand: shown under the brand's tables; `byRacquet` overrides the default for one frame. */
  brandFooters: Record<BrandId, { default: string; byRacquet?: Record<RacquetId, string> }>;
  hybridCards: Record<BrandId, { heading: string; intro: string }>;
  gripAbout: Record<BrandId, string>;
  gutIntro: string;
  legends: Record<'strings' | 'grips', { swatch: string; label: string }[]>;
}
