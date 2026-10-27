// Declared differences from legacy v0.990 since v0.992, applied to the legacy page before every
// comparison so the rest of each view is still checked pixel for pixel and node for node.
// Each patch reproduces one change (listed in CHANGELOG.md), through legacy's own functions
// where it can:
//   A. grip filters cover every brand: getGripBrandSections returns all three sections, and
//      Tourna gets the filter header Kimony and Yonex have, in its brand colour;
//   B. one string filter state for every racquet: each applyFilters pass runs legacy's own
//      pass once per racquet, the active one last;
//   C. the palette's clear button shows while the field has text, and the browser's own is
//      hidden. Legacy's handlers set an inline display the app no longer uses, so it is removed;
//   D. v0.993's rename: the topbar wordmark reads "strung" in heavy DM Sans with a blue line
//      under it, instead of EQUIP + a dimmed DB in Space Mono. Weight 800 comes from the same
//      Google Fonts file the tests already route to the bundled copy.
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
    "@font-face { font-family: 'DM Sans'; font-style: normal; font-weight: 800;" +
      " src: url('https://fonts.gstatic.com/s/dmsans/v17/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2')" +
      " format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6," +
      " U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193," +
      " U+2212, U+2215, U+FEFF, U+FFFD; }",
    ".topbar-mark { font-family: 'DM Sans', sans-serif; font-weight: 800; font-size: 1.15rem;" +
      " letter-spacing: -0.04em; line-height: 1; }",
    ".topbar-mark::after { content: ''; display: block; height: 2px; margin: 2px 1px 0;" +
      " border-radius: 2px; background: #1f4fff; }",
  ].join('\n');
  document.head.appendChild(css);

  // D
  document.querySelector('.topbar-mark').textContent = 'strung';

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

  // D's weight is only requested once the page lays the wordmark out again; load it now so the
  // caller can wait for it (the harness waited for fonts before the patch).
  return document.fonts.load("800 16px 'DM Sans'", 'strung');
})()`;

export async function applyLegacyFixes(page: Page): Promise<void> {
  await page.evaluate(LEGACY_FIXES_JS);
}
