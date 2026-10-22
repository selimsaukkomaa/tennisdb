// Compare mode, ported from v0.990's tennis-compare: pick 2-4 strings or hybrids with the row
// checkboxes, see them side by side in a modal with a tab per racquet. The selection is
// global (by id); the modal shows per-racquet tension and notes.
import {
  CompareSelection,
  MAX_COMPARE,
  MIN_COMPARE,
  findCompareItem,
  type CompareItem,
} from '../core/compare';
import type { Bar, RacquetId, TennisDb } from '../core/types';
import { html, join, raw, type SafeHtml } from './html';
import { state } from './state';
import { feelTagsHtml } from './tables';

let db: TennisDb;
const selection = new CompareSelection();
/** Racquet tab chosen in the modal; null follows the racquet shown on the page. */
let modalRacquet: RacquetId | null = null;

const byId = (id: string): HTMLElement => document.getElementById(id)!;
const DASH = raw('<span class="cmp-dash">—</span>');

// ---------------------------------------------------------------- bar + checkboxes

function syncCheckboxes(): void {
  for (const box of document.querySelectorAll<HTMLInputElement>('.compare-check')) {
    const on = selection.has(box.dataset.compareId!);
    box.checked = on;
    box.disabled = !on && selection.isFull;
    box.closest('tr')?.classList.toggle('selected-for-compare', on);
  }
}

function renderBar(): void {
  const bar = byId('compare-bar');
  if (selection.selected.length === 0) {
    bar.classList.add('hidden');
    return;
  }
  bar.classList.remove('hidden');
  const chips = selection.selected
    .map((id) => findCompareItem(db, id))
    .filter((found): found is CompareItem => found !== null)
    .map(
      ({ item }) =>
        html`<span class="compare-chip" data-brand="${item.brand || ''}"><span class="compare-chip-name">${item.name}</span><button class="compare-chip-remove" data-remove-id="${item.id}" aria-label="Remove">✕</button></span>`,
    );
  byId('compare-chips').innerHTML = join(chips, raw('')).value;
  const n = selection.selected.length;
  byId('compare-count').textContent = `${n} / ${MAX_COMPARE}`;
  const open = byId('compare-open') as HTMLButtonElement;
  open.disabled = n < MIN_COMPARE;
  open.textContent = n < MIN_COMPARE ? `Select ${MIN_COMPARE - n} more` : `Compare (${n})`;
}

function modalIsOpen(): boolean {
  return !byId('compare-modal').classList.contains('hidden');
}

function syncUI(): void {
  syncCheckboxes();
  renderBar();
  if (modalIsOpen()) renderModal();
}

// ---------------------------------------------------------------- modal

function barHtml(cls: string, bar: Bar | undefined): SafeHtml {
  if (!bar || bar.label == null) return DASH;
  return html`<div class="cmp-bar-wrap"><span class="cmp-bar-label">${bar.label}</span><div class="bar"><div class="bar-fill ${cls}" style="width:${bar.width ?? 0}%"></div></div></div>`;
}

interface AttrRow {
  label: string;
  key: string;
  /** true: hybrids only; false: single strings only; undefined: both. */
  hybrid?: boolean;
  bar?: string;
}

const ATTR_ROWS: readonly AttrRow[] = [
  { label: 'Shape', key: 'shape', hybrid: false },
  { label: 'Mains', key: 'mains', hybrid: true },
  { label: 'Crosses', key: 'crosses', hybrid: true },
  { label: 'Gauges', key: 'gauges', hybrid: false },
  { label: 'Colors', key: 'colors', hybrid: false },
  { label: 'Stiffness', key: 'stiffness', bar: 'stiff' },
  { label: 'Power', key: 'power', bar: 'power' },
  { label: 'Spin', key: 'spin', bar: 'spin' },
  { label: 'Control', key: 'control', bar: 'control', hybrid: false },
  { label: 'Comfort', key: 'comfort', bar: 'comfort', hybrid: false },
  { label: 'Feel', key: 'feel' },
  { label: 'Tension', key: 'tension' },
  { label: 'Note', key: 'note' },
];

function cellHtml(row: AttrRow, entry: CompareItem, racquet: RacquetId): SafeHtml {
  if (row.hybrid === false && entry.kind === 'hybrid') return DASH;
  if (row.hybrid === true && entry.kind === 'string') return DASH;
  const per = entry.item.perRacquet?.[racquet];

  if (entry.kind === 'hybrid' && (row.key === 'mains' || row.key === 'crosses')) {
    const side = entry.item[row.key];
    return html`${side.string} ${side.gauge}${side.shapeFeelLabel ? html`<br><span class="cmp-sub">${side.shapeFeelLabel}</span>` : ''}`;
  }
  if (row.bar) {
    const item = entry.item as unknown as Record<string, Bar | undefined>;
    return barHtml(row.bar, item[row.key]);
  }
  switch (row.key) {
    case 'shape':
      return entry.kind === 'string' ? html`${entry.item.shape || ''}` : DASH;
    case 'gauges':
      return entry.kind === 'string' ? join(entry.item.gauges ?? [], raw('<br>')) : DASH;
    case 'colors': {
      const colors = entry.kind === 'string' ? entry.item.colors : undefined;
      if (!colors?.dots?.length) return DASH;
      const dots = colors.dots.map(
        (c) => html`<span class="color-dot" style="background:${c.hex};" title="${c.name}"></span>`,
      );
      return html`<div class="colors">${dots}</div><div class="cmp-sub">${colors.label || ''}</div>`;
    }
    case 'feel': {
      const { feelTags, feelSummary, feelExpand } = entry.item;
      return html`<div class="cmp-feel">${feelTagsHtml(feelTags, ' ')}${feelSummary ? html`<div class="cmp-feel-summary">${feelSummary}</div>` : ''}${feelExpand ? html`<div class="cmp-feel-expand">${feelExpand}</div>` : ''}</div>`;
    }
    case 'tension':
      return per?.tension ? html`<span class="cmp-tension">${per.tension}</span>` : DASH;
    case 'note':
      return per?.note ? html`<div class="cmp-note">${raw(per.note)}</div>` : DASH;
  }
  return raw('');
}

/** String-only rows show when a string is selected; hybrid-only rows when a hybrid is. */
function rowShown(row: AttrRow, entries: CompareItem[]): boolean {
  if (row.hybrid === false) return entries.some((e) => e.kind === 'string');
  if (row.hybrid === true) return entries.some((e) => e.kind === 'hybrid');
  return true;
}

function renderModal(): void {
  const racquet = modalRacquet ?? state.racquet;
  byId('compare-racquet-tabs').innerHTML = join(
    db.racquets.map(
      (r) =>
        html`<button class="cmp-racquet-tab${r.id === racquet ? ' active' : ''}" data-cmp-racquet="${r.id}">${r.model}</button>`,
    ),
    raw(''),
  ).value;

  const body = byId('compare-modal-body');
  if (selection.selected.length === 0) {
    body.innerHTML = '<div class="cmp-empty">Nothing selected.</div>';
    return;
  }
  const entries = selection.selected
    .map((id) => findCompareItem(db, id))
    .filter((found): found is CompareItem => found !== null);
  const heads = entries.map(
    ({ item }) =>
      html`<th class="cmp-col-head" data-brand="${item.brand || ''}"><div class="cmp-col-head-name">${item.name}</div><div class="cmp-col-head-brand">${db.brandsStrings[item.brand]?.name || item.brand || ''}</div><button class="cmp-col-remove" data-remove-id="${item.id}" aria-label="Remove">✕</button></th>`,
  );
  const rows = ATTR_ROWS.filter((row) => rowShown(row, entries)).map(
    (row) =>
      html`<tr class="cmp-row-${row.key}"><th class="cmp-attr-head">${row.label}</th>${entries.map(
        (e) => html`<td class="cmp-cell cmp-cell-${row.key}">${cellHtml(row, e, racquet)}</td>`,
      )}</tr>`,
  );
  body.innerHTML =
    html`<div class="cmp-table-scroll"><table class="cmp-table"><thead><tr><th class="cmp-attr-head"></th>${heads}</tr></thead><tbody>${rows}</tbody></table></div>`.value;
}

function openModal(): void {
  if (!selection.canOpen) return;
  modalRacquet = null;
  renderModal();
  byId('compare-modal').classList.remove('hidden');
  document.body.classList.add('cmp-no-scroll');
}

function closeModal(): void {
  byId('compare-modal').classList.add('hidden');
  document.body.classList.remove('cmp-no-scroll');
}

// ---------------------------------------------------------------- wiring

export function initCompare(data: TennisDb): void {
  db = data;
  document.addEventListener('change', (e) => {
    const box = e.target as HTMLInputElement;
    if (!box.classList?.contains('compare-check') || !box.dataset.compareId) return;
    if (selection.toggle(box.dataset.compareId)) syncUI();
    else box.checked = false;
  });
  document.addEventListener('click', (e) => {
    const t = e.target as Element;
    const remove = t.closest<HTMLElement>('.compare-chip-remove, .cmp-col-remove');
    if (remove) {
      selection.remove(remove.dataset.removeId!);
      return syncUI();
    }
    if (t.closest('#compare-open')) return openModal();
    if (t.closest('#compare-clear')) {
      selection.clear();
      return syncUI();
    }
    if (t.closest('#compare-modal-close') || t.classList.contains('compare-modal-backdrop')) {
      return closeModal();
    }
    const tab = t.closest<HTMLElement>('.cmp-racquet-tab');
    if (tab) {
      modalRacquet = tab.dataset.cmpRacquet!;
      renderModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalIsOpen()) closeModal();
  });
  syncUI();
}
