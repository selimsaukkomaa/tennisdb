// The topbar Filters button, ported from v0.990's ux988 layer: opens and closes the active
// category's filter bar, counts active filters, and while the bar is closed shows a summary
// row of removable chips. ux988 hung this off wrapped globals; here it listens for events.
import { clearAllFilters, clearGripFilters } from './filters';
import { on, state } from './state';

const byId = (id: string): HTMLElement => document.getElementById(id)!;

// Typographic quotes around the search text in the summary chip. Built from code points so
// the source stays free of smart quotes (a Prettier pass turns \u escapes into literals).
const OPEN_QUOTE = String.fromCharCode(0x201c);
const CLOSE_QUOTE = String.fromCharCode(0x201d);

const activeBar = (): HTMLElement =>
  byId(state.category === 'strings' ? 'filter-bar' : 'grip-filter-bar');
const activeSummary = (): HTMLElement =>
  byId(state.category === 'strings' ? 'filter-summary' : 'grip-filter-summary');
const activeSearch = (): HTMLInputElement =>
  byId(state.category === 'strings' ? 'filter-search' : 'grip-filter-search') as HTMLInputElement;

const filtersOpen = (): boolean => activeBar().classList.contains('filters-open');
const activeChips = (): HTMLElement[] => [
  ...activeBar().querySelectorAll<HTMLElement>('.chip-active'),
];

export function refreshFilterUI(): void {
  const btn = byId('btn-filters');
  const chips = activeChips();
  const text = activeSearch().value.trim();
  const count = chips.length + (text ? 1 : 0);

  const counter = byId('filters-count');
  counter.textContent = String(count);
  counter.classList.toggle('count-on', count > 0);
  btn.classList.toggle('is-on', filtersOpen() || count > 0);

  for (const id of ['filter-summary', 'grip-filter-summary']) {
    const el = byId(id);
    el.classList.remove('summary-on');
    el.innerHTML = '';
  }
  if (count === 0 || filtersOpen()) return;

  // Markup as v0.990 built it: the search text has <>& stripped, chip labels are static.
  let markup = '<span class="fsum-label">Filtered</span>';
  if (text) {
    markup +=
      '<button class="fsum-chip" data-fsum="search">' +
      OPEN_QUOTE +
      text.replace(/[<>&]/g, '') +
      CLOSE_QUOTE +
      '<span class="fsum-x">×</span></button>';
  }
  chips.forEach((c, i) => {
    markup +=
      `<button class="fsum-chip" data-fsum="chip" data-fsum-idx="${i}">` +
      c.textContent!.trim() +
      '<span class="fsum-x">×</span></button>';
  });
  markup += '<button class="fsum-clear" data-fsum="all">Clear all</button>';
  const sum = activeSummary();
  sum.innerHTML = markup;
  sum.classList.add('summary-on');
}

export function setFiltersOpen(open: boolean): void {
  byId('filter-bar').classList.remove('filters-open');
  byId('grip-filter-bar').classList.remove('filters-open');
  if (open) activeBar().classList.add('filters-open');
  byId('btn-filters').setAttribute('aria-expanded', open ? 'true' : 'false');
  refreshFilterUI();
  if (open) {
    const input = activeSearch();
    setTimeout(() => input.focus(), 10);
  }
}

/** A click on a summary chip removes that filter; "Clear all" clears the category's filters. */
function onSummaryClick(btn: HTMLElement): void {
  const kind = btn.dataset.fsum;
  if (kind === 'all') {
    if (state.category === 'strings') clearAllFilters();
    else clearGripFilters();
  } else if (kind === 'search') {
    const input = activeSearch();
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    activeChips()[Number(btn.dataset.fsumIdx)]?.click();
  }
  setTimeout(refreshFilterUI, 20);
}

export function initFilterPanel(): void {
  document.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('#btn-filters')) return setFiltersOpen(!filtersOpen());
    const fsum = t.closest<HTMLElement>('[data-fsum]');
    if (fsum) onSummaryClick(fsum);
  });
  on('filtered', refreshFilterUI);
  on('racquet', refreshFilterUI);
  on('category', () => setFiltersOpen(false));
  refreshFilterUI();
}
