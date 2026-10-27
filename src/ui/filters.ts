// String and grip filters, ported from v0.990's main script (the v0.97 filter system).
// Matching lives in core/filters; this module applies it to rows and sections.
//
// v0.992 fixed two v0.990 bugs here: a grip filter now force-shows every grip brand (v0.990
// skipped Tourna), and a string filter pass covers every racquet (v0.990 touched only the
// active one, leaving stale hidden rows on a racquet switched away from).
import {
  emptyGripFilter,
  emptyStringFilter,
  isGripFilterActive,
  isStringFilterActive,
  matchesGripRow,
  matchesStringRow,
  toggleValue,
  type GripFilter,
  type StringFilter,
} from '../core/filters';
import type { RacquetId } from '../core/types';
import { showBrand, showGripBrand } from './nav';
import { racquetContentId } from './shell';
import { emit, on, state } from './state';

export const filterState: StringFilter = emptyStringFilter();
export const gripFilterState: GripFilter = emptyGripFilter();

const SEARCH_DEBOUNCE_MS = 150;

const byId = (id: string): HTMLElement => document.getElementById(id)!;
const all = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] => [
  ...root.querySelectorAll<T>(sel),
];

// ---------------------------------------------------------------- strings

export const isFilterActive = (): boolean => isStringFilterActive(filterState);

function updateSwitcherState(rid: RacquetId, active: boolean): void {
  document.getElementById(`${rid}-switcher`)?.classList.toggle('filter-all-brands', active);
  document.getElementById(`${rid}-filter-badge`)?.classList.toggle('badge-show', active);
}

function updateFilterStatus(visible: number, total: number): void {
  byId('filter-status').innerHTML = isFilterActive()
    ? `<span class="count-highlight">${visible}</span> of ${total} strings`
    : '';
}

/**
 * One filter state applies to every racquet, so each pass covers them all and the active one
 * last (its counts go in the status). v0.990 filtered only the active racquet, which left a
 * racquet switched away from with stale hidden rows once the filters were cleared elsewhere.
 */
export function applyFilters(): void {
  const active = isFilterActive();
  byId('filter-clear').classList.toggle('has-filters', active);
  const others = all('[data-nav-switcher]')
    .map((s) => s.dataset.navSwitcher!)
    .filter((rid) => rid !== state.racquet);
  for (const rid of others) applyToRacquet(rid, active);
  const { visible, total } = applyToRacquet(state.racquet, active);
  updateFilterStatus(visible, total);
  emit('filtered', 'strings');
}

function applyToRacquet(rid: RacquetId, active: boolean): { visible: number; total: number } {
  const container = byId(racquetContentId(rid));
  const rows = all('tr[data-shape]', container);
  const sections = all('.brand-section', container);

  if (!active) {
    rows.forEach((r) => r.classList.remove('filter-hidden'));
    sections.forEach((s) => s.classList.remove('filter-force-show', 'filter-all-hidden'));
    all('.filter-brand-header', container).forEach((h) => h.classList.remove('filter-show'));
    all('.table-wrap.filter-no-results', container).forEach((tw) =>
      tw.classList.remove('filter-no-results'),
    );
    showBrand(rid, state.brandByRacquet[rid]!);
    updateSwitcherState(rid, false);
    return { visible: rows.length, total: rows.length };
  }

  // Filters span every brand: force all sections visible, with their headers.
  sections.forEach((s) => s.classList.add('filter-force-show'));
  updateSwitcherState(rid, true);
  all('.filter-brand-header', container).forEach((h) => h.classList.add('filter-show'));

  let visible = 0;
  for (const row of rows) {
    const show = matchesStringRow(
      {
        text: row.textContent ?? '',
        shapeAttr: row.dataset.shape ?? '',
        feelAttr: row.dataset.feel ?? '',
      },
      filterState,
    );
    row.classList.toggle('filter-hidden', !show);
    if (show) visible++;
  }

  // Hide string tables with no visible rows. Hybrid tables sit outside a .table-wrap, so a
  // brand whose strings all miss is hidden even if a hybrid matches (v0.990 behaviour).
  for (const tw of all('.table-wrap', container)) {
    const tbody = tw.querySelector('tbody');
    if (!tbody) continue;
    const hasVisible = all('tr[data-shape]', tbody).some(
      (r) => !r.classList.contains('filter-hidden'),
    );
    tw.classList.toggle('filter-no-results', !hasVisible);
  }
  for (const s of sections) {
    const anyVisible = all('.table-wrap', s).some(
      (w) => !w.classList.contains('filter-no-results'),
    );
    if (anyVisible) {
      s.classList.remove('filter-all-hidden');
      continue;
    }
    s.classList.remove('filter-force-show');
    s.classList.add('filter-all-hidden');
    const header = s.previousElementSibling;
    if (header?.classList.contains('filter-brand-header')) header.classList.remove('filter-show');
  }
  return { visible, total: rows.length };
}

export function toggleChip(btn: HTMLElement): void {
  const group = btn.dataset.filterGroup as 'shape' | 'feel';
  btn.classList.toggle('chip-active', toggleValue(filterState[group], btn.dataset.filterValue!));
  applyFilters();
}

export function clearAllFilters(): void {
  Object.assign(filterState, emptyStringFilter());
  (byId('filter-search') as HTMLInputElement).value = '';
  // v0.990 used a page-wide selector here, so this also unmarks active grip chips.
  all('.filter-chip.chip-active').forEach((c) => c.classList.remove('chip-active'));
  applyFilters();
}

// ---------------------------------------------------------------- grips

export const isGripFilterOn = (): boolean => isGripFilterActive(gripFilterState);

/** Every grip brand's section: a grip filter spans all brands. */
const gripSections = (): HTMLElement[] => all('#grips-content > .brand-section');

function updateGripSwitcherState(active: boolean): void {
  byId('grip-switcher').classList.toggle('gfilter-all-brands', active);
  byId('grip-filter-badge').classList.toggle('badge-show', active);
}

function updateGripFilterStatus(visible: number, total: number): void {
  byId('grip-filter-status').innerHTML = isGripFilterOn()
    ? `<span class="count-highlight">${visible}</span> of ${total} grips`
    : '';
}

export function applyGripFilters(): void {
  const grips = byId('grips-content');
  const rows = all('tr[data-grip-type]', grips);
  const sections = gripSections();
  const active = isGripFilterOn();
  byId('grip-filter-clear').classList.toggle('has-filters', active);

  if (!active) {
    rows.forEach((r) => r.classList.remove('gfilter-hidden'));
    sections.forEach((s) => s.classList.remove('gfilter-force-show', 'gfilter-all-hidden'));
    all('.gfilter-brand-header').forEach((h) => h.classList.remove('gfilter-show'));
    all('.table-wrap', grips).forEach((tw) => tw.classList.remove('gfilter-no-results'));
    all('.rec-box', grips).forEach((rb) => rb.classList.remove('gfilter-hide-rec'));
    all('.grip-subheading', grips).forEach((sh) => sh.classList.remove('gfilter-hide'));
    showGripBrand(state.gripBrand);
    updateGripSwitcherState(false);
    updateGripFilterStatus(0, 0);
    emit('filtered', 'grips');
    return;
  }

  sections.forEach((s) => {
    s.classList.add('gfilter-force-show');
    s.style.display = 'block';
  });
  all('.gfilter-brand-header').forEach((h) => h.classList.add('gfilter-show'));
  all('.rec-box', grips).forEach((rb) => rb.classList.add('gfilter-hide-rec'));
  updateGripSwitcherState(true);

  let visible = 0;
  for (const row of rows) {
    const show = matchesGripRow(
      {
        text: row.textContent ?? '',
        gripType: row.dataset.gripType ?? '',
        gripFeelAttr: row.dataset.gripFeel ?? '',
      },
      gripFilterState,
    );
    row.classList.toggle('gfilter-hidden', !show);
    if (show) visible++;
  }

  // Hide grip tables with no visible rows, and the subheading above each.
  for (const tw of all('.table-wrap', grips)) {
    const tbody = tw.querySelector('tbody');
    if (!tbody) continue;
    const hasVisible = all('tr[data-grip-type]', tbody).some(
      (r) => !r.classList.contains('gfilter-hidden'),
    );
    tw.classList.toggle('gfilter-no-results', !hasVisible);
    const prev = tw.previousElementSibling;
    if (prev?.classList.contains('grip-subheading'))
      prev.classList.toggle('gfilter-hide', !hasVisible);
  }
  for (const s of sections) {
    const anyVisible = all('.table-wrap', s).some(
      (w) => !w.classList.contains('gfilter-no-results'),
    );
    if (anyVisible) {
      s.classList.remove('gfilter-all-hidden');
      continue;
    }
    s.classList.remove('gfilter-force-show');
    s.classList.add('gfilter-all-hidden');
    const header = s.previousElementSibling;
    if (header?.classList.contains('gfilter-brand-header')) header.classList.remove('gfilter-show');
  }

  updateGripFilterStatus(visible, rows.length);
  emit('filtered', 'grips');
}

export function toggleGripChip(btn: HTMLElement): void {
  const group = btn.dataset.gfilterGroup as 'type' | 'feel';
  btn.classList.toggle(
    'chip-active',
    toggleValue(gripFilterState[group], btn.dataset.gfilterValue!),
  );
  applyGripFilters();
}

export function clearGripFilters(): void {
  Object.assign(gripFilterState, emptyGripFilter());
  (byId('grip-filter-search') as HTMLInputElement).value = '';
  all('#grip-filter-bar .filter-chip.chip-active').forEach((c) =>
    c.classList.remove('chip-active'),
  );
  applyGripFilters();
}

// ---------------------------------------------------------------- wiring

function debouncedSearch(inputId: string, apply: (value: string) => void): void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  byId(inputId).addEventListener('input', (e) => {
    clearTimeout(timer);
    const value = (e.target as HTMLInputElement).value.trim();
    timer = setTimeout(() => apply(value), SEARCH_DEBOUNCE_MS);
  });
}

export function initFilters(): void {
  document.addEventListener('click', (e) => {
    const t = e.target as Element;
    const chip = t.closest<HTMLElement>('[data-filter-group]');
    if (chip) return toggleChip(chip);
    const gripChip = t.closest<HTMLElement>('[data-gfilter-group]');
    if (gripChip) return toggleGripChip(gripChip);
    if (t.closest('#filter-clear')) return clearAllFilters();
    if (t.closest('#grip-filter-clear')) return clearGripFilters();
  });
  debouncedSearch('filter-search', (v) => {
    filterState.search = v;
    applyFilters();
  });
  debouncedSearch('grip-filter-search', (v) => {
    gripFilterState.search = v;
    applyGripFilters();
  });

  // Leaving a category clears its filters.
  on('category', (cat) => {
    if (cat !== 'strings') clearAllFilters();
    if (cat !== 'grips') clearGripFilters();
  });
  // Every racquet is already filtered; re-applying puts the new racquet's counts in the status.
  on('racquet', () => {
    if (isFilterActive()) applyFilters();
  });
}
