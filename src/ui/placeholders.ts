// Shorter placeholders on phones and touch screens (since v1.9). The search fields are 16px
// there, so iOS doesn't zoom into them (additions.css), and the desktop placeholders no longer
// fit. Each field names its short text in data-short-placeholder; the desktop text comes back
// when the screen widens.

/** The same condition as the 16px rule in additions.css. */
export const SMALL_SCREEN = '(max-width: 900px), (pointer: coarse)';

export function initPlaceholders(): void {
  // jsdom (the unit and smoke tests) has no matchMedia: the desktop placeholders stay.
  const query = typeof window.matchMedia === 'function' ? window.matchMedia(SMALL_SCREEN) : null;
  if (!query) return;
  const fields = [...document.querySelectorAll<HTMLInputElement>('input[data-short-placeholder]')];
  const long = new Map(fields.map((f) => [f, f.placeholder]));
  const apply = (): void => {
    for (const f of fields)
      f.placeholder = query.matches ? f.dataset.shortPlaceholder! : long.get(f)!;
  };
  query.addEventListener('change', apply);
  apply();
}
