// UI state shared by the modules, replacing v0.990's probing of style.display, plus a small
// event bus that replaces its wrapper chains (v0.97 and ux988 wrapped showRacquet,
// showCategory and the filter apply functions to hang their own work off them).
import type { BrandId, RacquetId } from '../core/types';

export type Category = 'strings' | 'grips';

export const state = {
  category: 'strings' as Category,
  racquet: '' as RacquetId,
  /** The brand tab selected in each racquet view. */
  brandByRacquet: {} as Record<RacquetId, BrandId>,
  gripBrand: '' as BrandId,
};

interface Events {
  /** After showCategory switched the visible category. */
  category: Category;
  /** After showRacquet switched the visible racquet. */
  racquet: RacquetId;
  /** After a string or grip filter pass changed what is visible. */
  filtered: Category;
  /** After the stringing log changed. */
  log: void;
}

type Handler<T> = (payload: T) => void;
const handlers = new Map<keyof Events, Handler<never>[]>();

export function on<K extends keyof Events>(event: K, fn: Handler<Events[K]>): void {
  handlers.set(event, [...(handlers.get(event) ?? []), fn as Handler<never>]);
}

export function emit<K extends keyof Events>(event: K, payload: Events[K]): void {
  for (const fn of handlers.get(event) ?? []) (fn as Handler<Events[K]>)(payload);
}
