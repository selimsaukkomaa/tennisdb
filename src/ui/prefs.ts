// The reader's last racquet and strings, so the app reopens where they left it (since v1.10).
// Stored on the device only: localStorage on the web and in the iOS app's web view. Storage can
// be missing or refuse (private browsing, blocked site data); the app then starts as on a first
// visit. nav.ts checks the ids against the data, so a racquet that left the data falls back.
import type { BrandId, RacquetId } from '../core/types';

export const CHOICE_KEY = 'strung.choice';

export interface Choice {
  racquet: RacquetId;
  brand: BrandId;
}

/** The stored choice, or what of it is readable; empty when nothing usable is stored. */
export function loadChoice(): Partial<Choice> {
  try {
    const raw = localStorage.getItem(CHOICE_KEY);
    if (!raw) return {};
    const value = JSON.parse(raw) as Record<string, unknown> | null;
    const text = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined);
    return { racquet: text(value?.racquet), brand: text(value?.brand) };
  } catch {
    return {};
  }
}

export function saveChoice(choice: Choice): void {
  try {
    localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));
  } catch {
    // Storage refused: the choice lasts until the page closes.
  }
}
