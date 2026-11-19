// UI state shared by the modules, replacing v0.990's probing of style.display, plus a small
// event bus that replaces its wrapper chains (v0.97 and ux988 wrapped showRacquet,
// showCategory and the filter apply functions to hang their own work off them).
import type { BrandId, RacquetId } from '../core/types';

export type Category = 'strings' | 'grips';

export const state = {
  category: 'strings' as Category,
  racquet: '' as RacquetId,
  /**
   * The strings shown: a string brand, or the natural gut hybrids. Since v1.10 one choice for
   * every racquet, so it carries over when the racquet switches (v1.9 kept one per racquet).
   */
  brand: '' as BrandId,
  gripBrand: '' as BrandId,
};

interface Events {
  /** After showCategory switched the visible category. */
  category: Category;
  /** After showRacquet switched the visible racquet. */
  racquet: RacquetId;
  /** After a racquet's page was built: once per racquet, the first time it is shown. */
  page: RacquetId;
  /** A racquet picked in a racquet menu (picker.ts); `menu` names which. */
  pick: { menu: string; racquet: RacquetId };
  /** After a string or grip filter pass changed what is visible. */
  filtered: Category;
}

type Handler<T> = (payload: T) => void;
const handlers = new Map<keyof Events, Handler<never>[]>();

export function on<K extends keyof Events>(event: K, fn: Handler<Events[K]>): void {
  handlers.set(event, [...(handlers.get(event) ?? []), fn as Handler<never>]);
}

export function emit<K extends keyof Events>(event: K, payload: Events[K]): void {
  for (const fn of handlers.get(event) ?? []) (fn as Handler<Events[K]>)(payload);
}
