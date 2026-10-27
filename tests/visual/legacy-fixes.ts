// v0.992's declared differences from legacy v0.990, applied to the legacy page before every
// comparison so the rest of each view is still checked pixel for pixel and node for node.
// Each patch reproduces one fix (listed in CHANGELOG.md), through legacy's own functions
// where it can:
//   A. grip filters cover every brand: getGripBrandSections returns all three sections, and
//      Tourna gets the filter header Kimony and Yonex have, in its brand colour;
//   B. one string filter state for every racquet: each applyFilters pass runs legacy's own
//      pass once per racquet, the active one last;
//   C. the palette's clear button shows while the field has text, and the browser's own is
//      hidden. Legacy's handlers set an inline display the app no longer uses, so it is removed.
// The CSS repeats the rules in src/styles/additions.css; a change there must change it here.
import type { Page } from '@playwright/test';

const LEGACY_FIXES_JS = String.raw`(() => {
  const css = document.createElement('style');
  css.textContent = [
    '.gfilter-brand-header.gfilter-header-tourna { color: #1e40af; border-left-color: #1e40af; }',
    '#search-input::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }',
    '#search-clear.search-clear-visible { display: block; }',
    '#palette #search-clear { position: relative; top: auto; right: auto; transform: none;' +
      ' width: 26px; padding: 4px 0; text-align: center; margin: 0 4px 0 -38px; }',
  ].join('\n');
  document.head.appendChild(css);

  // A
  const tourna = document.getElementById('grip-tourna-section');
  const header = document.createElement('div');
  header.className = 'gfilter-brand-header gfilter-header-tourna';
  header.id = 'gfh-tourna';
  header.textContent = 'Tourna';
  tourna.before(header, document.createTextNode('\n'));
  window.getGripBrandSections = () =>
    ['kimony', 'yonex', 'tourna'].map((b) => document.getElementById('grip-' + b + '-section'));

  // B
  const activeRacquet = window.getActiveRacquet;
  const applyOne = window.applyFilters;
  window.applyFilters = function () {
    const current = activeRacquet();
    for (const id of ['regna', 'percept', 'headpt630']) {
      if (id === current) continue;
      window.getActiveRacquet = () => id;
      applyOne();
    }
    window.getActiveRacquet = activeRacquet;
    return applyOne();
  };

  // C
  const input = document.getElementById('search-input');
  const clear = document.getElementById('search-clear');
  const sync = () => {
    clear.removeAttribute('style');
    clear.classList.toggle('search-clear-visible', input.value.length > 0);
  };
  input.addEventListener('input', sync);
  input.addEventListener('keydown', (e) => { if (e.key === 'Escape') sync(); });
  clear.addEventListener('click', sync);
})()`;

export async function applyLegacyFixes(page: Page): Promise<void> {
  await page.evaluate(LEGACY_FIXES_JS);
}
