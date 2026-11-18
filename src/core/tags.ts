// Feel tags: the data stores each tag's label, and its colour comes from a table, so one label
// always has one colour (docs/phase-2-data-model.md, D8). Strings and hybrids use v0.990's
// table; grips have their own, because a grip's "Firm" or "Smooth" describes a hand feel and
// sits on a page of its own. The colours are the stylesheet's .tag-<colour> rules (validate.ts:
// tag-css).

export const TAG_COLOURS = ['crisp', 'firm', 'soft', 'round', 'lively', 'plush'] as const;
export type TagColour = (typeof TAG_COLOURS)[number];

/** Strings and hybrids: v0.990's label -> colour table. */
export const STRING_TAG_COLOURS = {
  Crisp: 'crisp',
  Firm: 'firm',
  Precise: 'firm',
  Controlled: 'firm',
  Aggressive: 'firm',
  Soft: 'soft',
  Softer: 'soft',
  'Very Soft': 'soft',
  Moderate: 'soft',
  Muted: 'soft',
  Smooth: 'round',
  Bite: 'round',
  Lively: 'lively',
  Elastic: 'lively',
  Explosive: 'lively',
  Responsive: 'lively',
  Plush: 'plush',
  Pocketing: 'plush',
  Comfortable: 'plush',
} as const satisfies Record<string, TagColour>;

/**
 * Grips: each label in the colour most grips already used. Tacky, Dry, Firm and Classic had two
 * colours in v0.990; the owner settled them on 2026-11-18 (scheme A: the majority colour).
 */
export const GRIP_TAG_COLOURS = {
  Crisp: 'crisp',
  Firm: 'crisp',
  Smooth: 'crisp',
  Thin: 'crisp',
  Ventilated: 'crisp',
  Tapered: 'crisp',
  Textured: 'crisp',
  Aggressive: 'crisp',
  Substantial: 'crisp',
  'Very Tacky': 'crisp',
  Long: 'crisp',
  Tacky: 'firm',
  'Ultra-Tacky': 'firm',
  'Dry-Tacky': 'firm',
  Classic: 'firm',
  Precise: 'firm',
  Durable: 'firm',
  'Dual Ridge': 'firm',
  Ribbed: 'firm',
  Tracked: 'firm',
  Decorative: 'firm',
  Cushioned: 'soft',
  Absorbent: 'soft',
  Ridged: 'soft',
  Plush: 'soft',
  'Leather-like': 'soft',
  Dry: 'round',
} as const satisfies Record<string, TagColour>;

export type StringTag = keyof typeof STRING_TAG_COLOURS;
export type GripTag = keyof typeof GRIP_TAG_COLOURS;

/** A table's labels as a non-empty tuple, for z.enum. */
export const tagLabels = <T extends Record<string, TagColour>>(
  table: T,
): [keyof T & string, ...(keyof T & string)[]] =>
  Object.keys(table) as [keyof T & string, ...(keyof T & string)[]];
