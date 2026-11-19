// The racquet menu (since v1.10), in the card and in the compare window: a button naming the
// racquet on screen that opens a list grouped by brand, each racquet with its spec. It replaced
// a row of buttons, one per racquet, which ten racquets would have overflowed.
//
// A listbox: the button opens it and focus moves to the list, which marks the active option with
// aria-activedescendant. Up and Down move, Home and End jump, Enter or Space picks, Escape
// closes and returns focus to the button, Tab or a click elsewhere closes. A pick goes out on
// the bus as 'pick' with the menu's name; nav.ts and compare.ts act on their own menu's picks.
import { racquetGroups, racquetSpec } from '../core/labels';
import type { RacquetId, TennisDb } from '../core/types';
import { html, type SafeHtml } from './html';
import { emit } from './state';

const OPEN = 'rpick-open';

const optionId = (name: string, rid: RacquetId): string => `rpick-${name}-${rid}`;

/** A menu's markup, `current` marked. `name` tells its picks apart ('card', 'compare'). */
export function pickerHtml(db: TennisDb, name: string, current: RacquetId): SafeHtml {
  const model = db.racquets.find((r) => r.id === current)?.model ?? current;
  const listId = `rpick-${name}-list`;
  const groups = racquetGroups(db.racquets).map(
    (g, i) =>
      html`<div class="rpick-group" role="group" aria-labelledby="rpick-${name}-g${i}"><div class="rpick-brand" id="rpick-${name}-g${i}">${g.brand}</div>${g.racquets.map(
        (r) =>
          html`<div class="rpick-option" role="option" id="${optionId(name, r.id)}" data-rpick-value="${r.id}" aria-selected="${r.id === current ? 'true' : 'false'}"><span class="rpick-check" aria-hidden="true">✓</span><span class="rpick-model">${r.model}</span><span class="rpick-spec">${racquetSpec(r)}</span></div>`,
      )}</div>`,
  );
  return html`<div class="rpick" data-rpick="${name}"><button type="button" class="rpick-button" data-rpick-toggle aria-haspopup="listbox" aria-expanded="false" aria-controls="${listId}"><span class="rpick-current" data-rpick-current>${model}</span><span class="rpick-caret" aria-hidden="true">▾</span></button><div class="rpick-list" id="${listId}" role="listbox" aria-label="Racket" tabindex="-1">${groups}</div></div>`;
}

const rootOf = (name: string): HTMLElement | null =>
  document.querySelector<HTMLElement>(`[data-rpick="${name}"]`);
const options = (root: HTMLElement): HTMLElement[] => [
  ...root.querySelectorAll<HTMLElement>('[data-rpick-value]'),
];
const listOf = (root: HTMLElement): HTMLElement =>
  root.querySelector<HTMLElement>('[role="listbox"]')!;
const toggleOf = (root: HTMLElement): HTMLElement =>
  root.querySelector<HTMLElement>('[data-rpick-toggle]')!;

/** Marks the racquet on screen in a menu: the button's label, the tick, aria-selected. */
export function setPicked(name: string, rid: RacquetId, model: string): void {
  const root = rootOf(name);
  if (!root) return;
  root.querySelector('[data-rpick-current]')!.textContent = model;
  for (const o of options(root)) {
    o.setAttribute('aria-selected', o.dataset.rpickValue === rid ? 'true' : 'false');
  }
}

function setActive(root: HTMLElement, option: HTMLElement | undefined): void {
  if (!option) return;
  for (const o of options(root)) o.classList.toggle('rpick-active', o === option);
  listOf(root).setAttribute('aria-activedescendant', option.id);
  option.scrollIntoView?.({ block: 'nearest' });
}

function open(root: HTMLElement): void {
  for (const other of document.querySelectorAll<HTMLElement>(`.${OPEN}`)) close(other, false);
  root.classList.add(OPEN);
  toggleOf(root).setAttribute('aria-expanded', 'true');
  const all = options(root);
  setActive(root, all.find((o) => o.getAttribute('aria-selected') === 'true') ?? all[0]);
  listOf(root).focus();
}

function close(root: HTMLElement, refocus: boolean): void {
  root.classList.remove(OPEN);
  toggleOf(root).setAttribute('aria-expanded', 'false');
  listOf(root).removeAttribute('aria-activedescendant');
  if (refocus) toggleOf(root).focus();
}

function pick(root: HTMLElement, option: HTMLElement): void {
  const name = root.dataset.rpick!;
  close(root, false);
  emit('pick', { menu: name, racquet: option.dataset.rpickValue! });
  // The compare window draws its menu again on a pick, so look the button up afresh.
  rootOf(name)?.querySelector<HTMLElement>('[data-rpick-toggle]')?.focus();
}

function onClick(e: MouseEvent): void {
  const t = e.target as Element;
  const root = t.closest<HTMLElement>('[data-rpick]');
  for (const other of document.querySelectorAll<HTMLElement>(`.${OPEN}`)) {
    if (other !== root) close(other, false);
  }
  if (!root) return;
  if (t.closest('[data-rpick-toggle]')) {
    if (root.classList.contains(OPEN)) close(root, true);
    else open(root);
    return;
  }
  const option = t.closest<HTMLElement>('[data-rpick-value]');
  if (option) pick(root, option);
}

/** Keys for an open menu. Runs in the capture phase so Escape closes the menu, not the modal. */
function onKeydown(e: KeyboardEvent): void {
  const root = (e.target as Element).closest?.<HTMLElement>('[data-rpick]');
  if (!root) return;
  const isOpen = root.classList.contains(OPEN);
  if (!isOpen) {
    if (
      (e.key === 'ArrowDown' || e.key === 'ArrowUp') &&
      (e.target as Element).closest('[data-rpick-toggle]')
    ) {
      e.preventDefault();
      open(root);
    }
    return;
  }
  const all = options(root);
  const current = all.findIndex((o) => o.classList.contains('rpick-active'));
  const move = (i: number): void => setActive(root, all[Math.max(0, Math.min(all.length - 1, i))]);
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      return move(current + 1);
    case 'ArrowUp':
      e.preventDefault();
      return move(current - 1);
    case 'Home':
      e.preventDefault();
      return move(0);
    case 'End':
      e.preventDefault();
      return move(all.length - 1);
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (all[current]) pick(root, all[current]);
      return;
    case 'Escape':
      e.preventDefault();
      e.stopPropagation();
      return close(root, true);
    case 'Tab':
      return close(root, false);
  }
}

export function initPickers(): void {
  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown, true);
}
