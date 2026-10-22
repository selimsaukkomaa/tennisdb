// Category, racquet and brand switching plus column sorting, ported from v0.990's main script.
// One showBrand(racquet, brand) replaces showBrand / showPerceptBrand / showHeadBrand.
import type { BrandId, RacquetId, TennisDb } from '../core/types';
import { brandButtonId, brandSectionId, gripSectionId, racquetContentId } from './shell';
import { emit, state, type Category } from './state';

let db: TennisDb;

export function showRacquet(rid: RacquetId): void {
  for (const r of db.racquets) {
    const on = r.id === rid;
    document.getElementById(racquetContentId(r.id))!.style.display = on ? 'block' : 'none';
    document.getElementById(`btn-racquet-${r.id}`)!.className = on
      ? 'racquet-active'
      : 'racquet-inactive';
  }
  state.racquet = rid;
  emit('racquet', rid);
}

export function showBrand(rid: RacquetId, brand: BrandId): void {
  for (const b of Object.keys(db.brandsStrings)) {
    document.getElementById(brandSectionId(rid, b))!.classList.remove('active');
    document.getElementById(brandButtonId(rid, b))!.className = 'inactive';
  }
  document.getElementById(brandSectionId(rid, brand))!.classList.add('active');
  document.getElementById(brandButtonId(rid, brand))!.className = `active-${brand}`;
  state.brandByRacquet[rid] = brand;
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
  document.getElementById('topbar-racquets')!.classList.toggle('cat-hidden', cat !== 'strings');
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
  const racquet = t.closest<HTMLElement>('[data-nav-racquet]');
  if (racquet) return showRacquet(racquet.dataset.navRacquet!);
  const brand = t.closest<HTMLElement>('[data-nav-brand]');
  if (brand) {
    const rid = brand.closest<HTMLElement>('[data-nav-switcher]')!.dataset.navSwitcher!;
    return showBrand(rid, brand.dataset.navBrand!);
  }
  const grip = t.closest<HTMLElement>('[data-nav-grip-brand]');
  if (grip) return showGripBrand(grip.dataset.navGripBrand!);
  const th = t.closest<HTMLTableCellElement>('thead th.sortable');
  if (th) return sortBy(th);
}

/** Wires the click handler and applies v0.990's start state: first brand everywhere, Strings. */
export function initNav(data: TennisDb): void {
  db = data;
  document.addEventListener('click', onClick);
  const firstBrand = Object.keys(db.brandsStrings)[0]!;
  for (const r of db.racquets) showBrand(r.id, firstBrand);
  state.racquet = db.racquets[0]!.id;
  showGripBrand(Object.keys(db.grips)[0]!);
  showCategory('strings');
}
