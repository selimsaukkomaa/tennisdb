// Category, racquet and brand switching plus column sorting, ported from v0.990's main script.
// One showBrand replaces showBrand / showPerceptBrand / showHeadBrand.
//
// Since v1.10 a racquet's page is built the first time it is shown, the card is shared, the
// strings choice carries over between racquets, and the last racquet and strings are remembered.
import { racquetSpec } from '../core/labels';
import type { BrandId, Copy, RacquetId, TennisDb } from '../core/types';
import { setPicked } from './picker';
import { loadChoice, saveChoice } from './prefs';
import {
  GUT,
  RACQUET_PAGES_ID,
  brandButtonId,
  brandSectionId,
  gripSectionId,
  racquetContentId,
  racquetPage,
} from './shell';
import { emit, on, state, type Category } from './state';

let db: TennisDb;
let copy: Copy;

const byId = (id: string): HTMLElement => document.getElementById(id)!;
/** Every strings choice: the string brands, then natural gut. */
const choices = (): BrandId[] => [...Object.keys(db.brandsStrings), GUT];

/** Builds a racquet's page the first time it is needed; gut.ts and compare.ts fill in on 'page'. */
function ensurePage(rid: RacquetId): void {
  if (document.getElementById(racquetContentId(rid))) return;
  const r = db.racquets.find((x) => x.id === rid)!;
  byId(RACQUET_PAGES_ID).insertAdjacentHTML('beforeend', racquetPage(db, copy, r).value);
  emit('page', rid);
}

/** The card follows the racquet on screen: title, spec and the racquet menu. */
function updateCard(rid: RacquetId): void {
  const r = db.racquets.find((x) => x.id === rid)!;
  const card = byId('selector');
  card.querySelector('[data-sel-racquet]')!.textContent = r.model;
  card.querySelector('[data-sel-spec]')!.textContent = `${r.brand} · ${racquetSpec(r)}`;
  setPicked('card', rid, r.model);
}

const remember = (): void => saveChoice({ racquet: state.racquet, brand: state.brand });

export function showRacquet(rid: RacquetId): void {
  ensurePage(rid);
  for (const page of document.querySelectorAll<HTMLElement>('[data-racquet-page]')) {
    page.style.display = page.dataset.racquetPage === rid ? 'block' : 'none';
  }
  state.racquet = rid;
  updateCard(rid);
  showBrand(state.brand);
  emit('racquet', rid);
}

/**
 * Shows one string brand's tables, or the natural gut hybrids (GUT), in the racquet on screen.
 * The choice holds for every racquet: showRacquet applies it to the next one.
 */
export function showBrand(brand: BrandId): void {
  const rid = state.racquet;
  for (const b of choices()) {
    byId(brandSectionId(rid, b)).classList.remove('active');
    byId(brandButtonId(b)).className = b === GUT ? 'gut-choice inactive' : 'inactive';
  }
  byId(brandSectionId(rid, brand)).classList.add('active');
  byId(brandButtonId(brand)).className =
    brand === GUT ? 'gut-choice active-gut' : `active-${brand}`;
  byId('selector').querySelector('[data-sel-strings]')!.textContent =
    brand === GUT ? 'Natural gut' : db.brandsStrings[brand]!.name;
  state.brand = brand;
  remember();
}

export function showCategory(cat: Category): void {
  document.getElementById('filter-bar')!.classList.toggle('filter-visible', cat === 'strings');
  document.getElementById('grip-filter-bar')!.classList.toggle('gfilter-visible', cat === 'grips');
  for (const c of ['strings', 'grips'] as const) {
    const content = document.getElementById(`${c}-content`)!;
    content.classList.toggle('cat-visible', c === cat);
    content.style.display = c === cat ? 'block' : 'none';
    document.getElementById(`btn-cat-${c}`)!.className = c === cat ? 'cat-active' : 'cat-inactive';
  }
  state.category = cat;
  emit('category', cat);
}

export function showGripBrand(brand: BrandId): void {
  for (const b of Object.keys(db.grips)) {
    const section = document.getElementById(gripSectionId(b))!;
    section.style.display = b === brand ? 'block' : 'none';
    section.classList.toggle('active', b === brand);
    document.getElementById(`btn-grip-${b}`)!.className = b === brand ? `active-${b}` : 'inactive';
  }
  state.gripBrand = brand;
}

/**
 * Sorts a table by a header click: the name column alphabetically, bar columns by fill width.
 * Clicking the same header again flips the direction.
 */
function sortBy(th: HTMLTableCellElement): void {
  const table = th.closest('table')!;
  const tbody = table.querySelector('tbody')!;
  const rows = [...tbody.querySelectorAll('tr')];
  const col = th.dataset.col;
  const index = [...th.parentElement!.children].indexOf(th);
  const direction = th.classList.contains('sort-asc') ? 'desc' : 'asc';
  table.querySelectorAll('th.sortable').forEach((h) => h.classList.remove('sort-asc', 'sort-desc'));
  th.classList.add(`sort-${direction}`);

  rows.sort((a, b) => {
    const cellA = a.children[index]!;
    const cellB = b.children[index]!;
    if (col === 'string') {
      const va = cellA.textContent!.trim().toLowerCase();
      const vb = cellB.textContent!.trim().toLowerCase();
      return direction === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    const width = (cell: Element): number => {
      const fill = cell.querySelector<HTMLElement>('.bar-fill');
      return fill ? parseFloat(fill.style.width) : 0;
    };
    return direction === 'asc' ? width(cellA) - width(cellB) : width(cellB) - width(cellA);
  });
  rows.forEach((row) => tbody.appendChild(row));
}

function onClick(e: MouseEvent): void {
  const t = e.target as Element;
  const cat = t.closest<HTMLElement>('[data-nav-category]');
  if (cat) return showCategory(cat.dataset.navCategory as Category);
  const brand = t.closest<HTMLElement>('[data-nav-brand]');
  if (brand) return showBrand(brand.dataset.navBrand!);
  const grip = t.closest<HTMLElement>('[data-nav-grip-brand]');
  if (grip) return showGripBrand(grip.dataset.navGripBrand!);
  const th = t.closest<HTMLTableCellElement>('thead th.sortable');
  if (th) return sortBy(th);
}

/**
 * Wires the click handler and applies the start state: the remembered racquet and strings, or on
 * a first visit v0.990's (the first racquet, its first brand), and Strings. A remembered id the
 * data no longer has falls back to the first.
 */
export function initNav(data: TennisDb, content: Copy): void {
  db = data;
  copy = content;
  document.addEventListener('click', onClick);
  on('pick', ({ menu, racquet }) => {
    if (menu === 'card') showRacquet(racquet);
  });
  const saved = loadChoice();
  state.brand = saved.brand && choices().includes(saved.brand) ? saved.brand : choices()[0]!;
  const known = db.racquets.some((r) => r.id === saved.racquet);
  showRacquet(known ? saved.racquet! : db.racquets[0]!.id);
  showGripBrand(Object.keys(db.grips)[0]!);
  showCategory('strings');
}
