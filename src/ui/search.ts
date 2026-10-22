// Search results and navigation, ported from v0.990's tennis-search. The index and scoring
// live in core/search; this module renders grouped results, handles keyboard navigation and
// jumps to the chosen row.
import {
  SEARCH_GROUPS,
  buildSearchIndex,
  resultKey,
  searchIndex,
  type LogSearchEntry,
  type SearchItem,
} from '../core/search';
import type { BrandId, RacquetId, TennisDb } from '../core/types';
import { esc, html, raw } from './html';
import { showBrand, showCategory, showGripBrand, showRacquet } from './nav';

const DEBOUNCE_MS = 120;
const MAX_PER_GROUP = 6;
const FLASH_MS = 1500;

let db: TennisDb;
let index: SearchItem[] = [];
let results: SearchItem[] = [];
let keyNavIndex = -1;
/** Stringing-log entries for the index; the log module supplies them (step 3). */
let logEntries: () => readonly LogSearchEntry[] = () => [];

export function setLogSearchSource(source: () => readonly LogSearchEntry[]): void {
  logEntries = source;
}

const byId = (id: string): HTMLElement => document.getElementById(id)!;

export function rebuildIndex(): SearchItem[] {
  index = buildSearchIndex(db, logEntries());
  return index;
}

export const currentIndex = (): SearchItem[] => index;

/** Wraps the first case-insensitive occurrence of the (untrimmed) query in <mark>. */
function highlight(text: string, query: string): string {
  if (!query) return esc(text);
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return esc(text);
  return (
    esc(text.slice(0, i)) +
    '<mark>' +
    esc(text.slice(i, i + query.length)) +
    '</mark>' +
    esc(text.slice(i + query.length))
  );
}

function renderResults(query: string): void {
  const panel = byId('search-results');
  if (results.length === 0) {
    if (query.length >= 2) {
      panel.innerHTML = html`<div class="search-empty">No matches for "${query}".</div>`.value;
      panel.classList.add('search-results-visible');
    } else {
      panel.classList.remove('search-results-visible');
    }
    return;
  }
  const groups = SEARCH_GROUPS.map(({ type, label }) => {
    const items = results.filter((r) => r.type === type);
    if (!items.length) return '';
    const shown = items
      .slice(0, MAX_PER_GROUP)
      .map(
        (item) =>
          html`<div class="search-result" data-result-key="${resultKey(item)}"${item.brand ? html` data-brand="${item.brand}"` : ''} tabindex="0"><span class="search-result-icon">${raw(item.icon)}</span><div class="search-result-text"><div class="search-result-label">${raw(highlight(item.label, query))}</div><div class="search-result-sublabel">${item.sublabel}</div></div></div>`,
      );
    const more =
      items.length > MAX_PER_GROUP
        ? html`<div class="search-group-more">+ ${items.length - MAX_PER_GROUP} more</div>`
        : '';
    return html`<div class="search-group"><div class="search-group-label">${raw(label)} (${items.length})</div>${shown}${more}</div>`;
  });
  panel.innerHTML = html`${groups}`.value;
  panel.classList.add('search-results-visible');
}

function doSearch(query: string): void {
  rebuildIndex(); // cheap, and picks up log changes
  results = searchIndex(query, index);
  keyNavIndex = -1;
  renderResults(query);
}

// ---------------------------------------------------------------- navigation

function flash(el: Element | null): void {
  if (!el) return;
  el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  el.classList.add('search-flash');
  setTimeout(() => el.classList.remove('search-flash'), FLASH_MS);
}

function goToString(id: string, racquet: RacquetId, brand: BrandId): void {
  showCategory('strings');
  showRacquet(racquet);
  showBrand(racquet, brand);
  setTimeout(() => flash(document.querySelector(`#${racquet}-content tr[data-id="${id}"]`)), 50);
}

function goToGrip(id: string, brand: BrandId): void {
  showCategory('grips');
  showGripBrand(brand);
  setTimeout(() => flash(document.querySelector(`#grip-${brand}-section tr[data-id="${id}"]`)), 50);
}

/** Opens a racquet's gut or log strip (if collapsed) and flashes a target inside it. */
function goToStrip(racquet: RacquetId, kind: 'gut' | 'log', target: () => Element | null): void {
  showCategory('strings');
  showRacquet(racquet);
  const section = document.querySelector(`.${kind}-section[data-racquet="${racquet}"]`);
  if (section && !section.classList.contains(`${kind}-expanded`)) {
    section.querySelector<HTMLElement>(`[data-${kind}-toggle]`)?.click();
  }
  setTimeout(() => flash(target()), 80);
}

function navigate(item: SearchItem): void {
  const racquet = item.racquet!;
  switch (item.type) {
    case 'string':
    case 'hybrid':
      return goToString(item.id, racquet, item.brand!);
    case 'grip':
      return goToGrip(item.id, item.brand!);
    case 'guthybrid':
      return goToStrip(racquet, 'gut', () =>
        document.querySelector(`.gut-section[data-racquet="${racquet}"] tr[data-id="${item.id}"]`),
      );
    case 'log':
      return goToStrip(racquet, 'log', () =>
        document.querySelector(`.log-section[data-racquet="${racquet}"]`),
      );
  }
}

function activate(el: Element): void {
  const key = el.getAttribute('data-result-key');
  const match = results.find((r) => resultKey(r) === key);
  if (!match) return;
  byId('search-results').classList.remove('search-results-visible');
  byId('search-input').blur();
  navigate(match);
}

function focusResult(list: HTMLElement[], i: number): void {
  list.forEach((r, j) => r.classList.toggle('search-result-keynav', j === i));
  list[i]?.scrollIntoView?.({ block: 'nearest' });
}

// ---------------------------------------------------------------- wiring

export function initSearch(data: TennisDb): void {
  db = data;
  rebuildIndex();
  const input = byId('search-input') as HTMLInputElement;
  const clear = byId('search-clear');
  const panel = byId('search-results');
  let timer: ReturnType<typeof setTimeout> | undefined;

  input.addEventListener('input', () => {
    const value = input.value;
    clear.style.display = value.length > 0 ? '' : 'none';
    clearTimeout(timer);
    timer = setTimeout(() => doSearch(value), DEBOUNCE_MS);
  });

  input.addEventListener('keydown', (e) => {
    const shown = [...document.querySelectorAll<HTMLElement>('.search-result')];
    if (e.key === 'Escape') {
      input.value = '';
      clear.style.display = 'none';
      panel.classList.remove('search-results-visible');
      input.blur();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!shown.length) return;
      keyNavIndex =
        e.key === 'ArrowDown'
          ? (keyNavIndex + 1) % shown.length
          : keyNavIndex <= 0
            ? shown.length - 1
            : keyNavIndex - 1;
      focusResult(shown, keyNavIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = (keyNavIndex >= 0 && shown[keyNavIndex]) || shown[0];
      if (target) activate(target);
    }
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.style.display = 'none';
    panel.classList.remove('search-results-visible');
    input.focus();
  });

  panel.addEventListener('click', (e) => {
    const hit = (e.target as Element).closest('.search-result');
    if (hit) activate(hit);
  });

  // A click anywhere outside the search bar closes the results.
  document.addEventListener('click', (e) => {
    if (!byId('search-bar').contains(e.target as Node))
      panel.classList.remove('search-results-visible');
  });
}

/** v0.990's test hook: search against the current index. */
export const searchNow = (q: string): SearchItem[] => searchIndex(q, index);
