// Compare selection: 2 to 4 strings or hybrids, kept in the order they were picked so the
// compare columns stay stable.
import type { Hybrid, StringRec, TennisDb } from './types';

export const MAX_COMPARE = 4;
export const MIN_COMPARE = 2;

export type CompareItem = { kind: 'string'; item: StringRec } | { kind: 'hybrid'; item: Hybrid };

export function findCompareItem(db: TennisDb, id: string): CompareItem | null {
  const s = db.strings.find((x) => x.id === id);
  if (s) return { kind: 'string', item: s };
  const h = db.hybrids.find((x) => x.id === id);
  return h ? { kind: 'hybrid', item: h } : null;
}

export class CompareSelection {
  private ids: string[] = [];

  get selected(): readonly string[] {
    return this.ids;
  }

  get isFull(): boolean {
    return this.ids.length >= MAX_COMPARE;
  }

  get canOpen(): boolean {
    return this.ids.length >= MIN_COMPARE;
  }

  has(id: string): boolean {
    return this.ids.includes(id);
  }

  /** Adds or removes `id`; returns false when adding was refused because the selection is full. */
  toggle(id: string): boolean {
    if (this.has(id)) {
      this.remove(id);
      return true;
    }
    if (this.isFull) return false;
    this.ids.push(id);
    return true;
  }

  remove(id: string): void {
    this.ids = this.ids.filter((x) => x !== id);
  }

  clear(): void {
    this.ids = [];
  }
}
