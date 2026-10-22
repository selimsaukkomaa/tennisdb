// Filter semantics shared by the string and grip filters: OR within a chip group, AND across
// groups and the search text; chips match comma-separated tokens, never substrings.
import { matchesAny } from './chips';

export interface StringFilter {
  search: string;
  shape: string[];
  feel: string[];
}

export interface GripFilter {
  search: string;
  type: string[];
  feel: string[];
}

export const emptyStringFilter = (): StringFilter => ({ search: '', shape: [], feel: [] });
export const emptyGripFilter = (): GripFilter => ({ search: '', type: [], feel: [] });

export const isStringFilterActive = (f: StringFilter): boolean =>
  f.search.length > 0 || f.shape.length > 0 || f.feel.length > 0;

export const isGripFilterActive = (f: GripFilter): boolean =>
  f.search.length > 0 || f.type.length > 0 || f.feel.length > 0;

/** Case-insensitive substring search over a row's whole text, as v0.990 did. */
function textMatches(text: string, search: string): boolean {
  return !search || text.toLowerCase().includes(search.toLowerCase());
}

export function matchesStringRow(
  row: { text: string; shapeAttr: string; feelAttr: string },
  f: StringFilter,
): boolean {
  return (
    textMatches(row.text, f.search) &&
    (f.shape.length === 0 || matchesAny(row.shapeAttr, f.shape)) &&
    (f.feel.length === 0 || matchesAny(row.feelAttr, f.feel))
  );
}

export function matchesGripRow(
  row: { text: string; gripType: string; gripFeelAttr: string },
  f: GripFilter,
): boolean {
  return (
    textMatches(row.text, f.search) &&
    (f.type.length === 0 || matchesAny(row.gripType, f.type)) &&
    (f.feel.length === 0 || matchesAny(row.gripFeelAttr, f.feel))
  );
}

/** Adds the value if absent, removes it if present; returns whether it is now selected. */
export function toggleValue(values: string[], value: string): boolean {
  const i = values.indexOf(value);
  if (i >= 0) {
    values.splice(i, 1);
    return false;
  }
  values.push(value);
  return true;
}
