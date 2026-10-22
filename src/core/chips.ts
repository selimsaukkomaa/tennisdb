// Filter chip vocabulary: the values rows are matched against (comma-separated tokens in
// shapeAttr / feelAttr / gripFeelAttr / gripType) and the labels the chips show.

export interface Chip {
  value: string;
  label: string;
}

export const SHAPE_CHIPS: readonly Chip[] = [
  { value: 'hexagonal', label: 'Hex' },
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'pentagonal', label: 'Penta' },
  { value: 'octagonal', label: 'Octa' },
  { value: 'twisted', label: 'Twisted' },
  { value: 'heptagonal', label: 'Hepta' },
];

export const FEEL_CHIPS: readonly Chip[] = [
  { value: 'crisp', label: 'Crisp' },
  { value: 'firm', label: 'Firm' },
  { value: 'soft', label: 'Soft' },
  { value: 'plush', label: 'Plush' },
  { value: 'lively', label: 'Lively' },
];

export const GRIP_TYPE_CHIPS: readonly Chip[] = [
  { value: 'wet', label: 'Wet' },
  { value: 'dry', label: 'Dry' },
  { value: 'replacement', label: 'Replacement' },
];

export const GRIP_FEEL_CHIPS: readonly Chip[] = [
  { value: 'tacky', label: 'Tacky' },
  { value: 'dry', label: 'Dry' },
  { value: 'cushioned', label: 'Cushioned' },
  { value: 'thin', label: 'Thin' },
  { value: 'firm', label: 'Firm' },
  { value: 'leather', label: 'Leather' },
];

/** Splits a comma-separated attribute into tokens. Matching is by token, never substring. */
export function tokens(attr: string | null | undefined): string[] {
  return (attr ?? '').split(',');
}

/** True when any selected value is one of the row's tokens (OR within a chip group). */
export function matchesAny(attr: string | null | undefined, selected: readonly string[]): boolean {
  const have = tokens(attr);
  return selected.some((v) => have.includes(v));
}
