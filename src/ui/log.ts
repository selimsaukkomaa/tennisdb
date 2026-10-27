// Stringing log UI, ported from v0.990's tennis-log onto schema v2 (core/log). Per racquet: a
// strip with "currently strung" and a Log toggle; the panel holds the add/edit form, the
// entries (newest first) and a footer with backup Export / Import and "Clear all".
import {
  currentFor,
  sortedEntries,
  isPinned,
  addEntry,
  updateEntry,
  deleteEntry,
  togglePin,
  wipeRacquet,
  type EntryInput,
} from '../core/log/model';
import { mergeLogs } from '../core/log/merge';
import {
  LogFormatError,
  emptyLog,
  parseLogDoc,
  type LogDoc,
  type LogEntry,
} from '../core/log/schema';
import type { LogStore } from '../core/log/store';
import { formatTension, parseTension } from '../core/log/tension';
import type { LogSearchEntry } from '../core/search';
import type { RacquetId, TennisDb } from '../core/types';
import { pickTextFile, saveTextFile } from '../platform/files';
import { html, raw, type SafeHtml } from './html';
import { emit } from './state';

let db: TennisDb;
let store: LogStore;
let doc: LogDoc = emptyLog();
/** The entry being edited, or 'new-<racquet>' while adding. */
let editingId: string | null = null;
/** Saves run one after another; export and import wait for the queue. */
let saving: Promise<void> = Promise.resolve();

const CUSTOM = '__custom__';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getLogDoc = (): LogDoc => doc;

/** Today's local date as YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date();
  const pad = (n: number): string => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2026-04-20" -> "Apr 20, 2026" */
function formatDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${MONTHS[parseInt(parts[1]!, 10) - 1]} ${parseInt(parts[2]!, 10)}, ${parts[0]}`;
}

function brandOf(stringId: string | null): string {
  if (!stringId) return '';
  return (
    db.strings.find((s) => s.id === stringId)?.brand ??
    db.hybrids.find((h) => h.id === stringId)?.brand ??
    ''
  );
}

const section = (racquet: RacquetId): Element | null =>
  document.querySelector(`.log-section[data-racquet="${racquet}"]`);

/** Applies a change: re-render, notify, and queue the save. */
function commit(next: LogDoc, racquet?: RacquetId): void {
  doc = next;
  if (racquet) renderRacquet(racquet);
  else renderAll();
  emit('log', undefined);
  saving = saving
    .then(() => store.save(doc))
    .catch((e: unknown) => console.warn('[log] save failed:', e));
}

// ---------------------------------------------------------------- rendering

function stars(n: number, interactive: boolean): SafeHtml {
  const spans = [1, 2, 3, 4, 5].map(
    (i) =>
      html`<span class="log-star${i <= n ? ' log-star-on' : ''}${interactive ? ' log-star-clickable' : ''}"${interactive ? html` data-star-value="${i}"` : ''}>★</span>`,
  );
  return html`<span class="log-stars">${spans}</span>`;
}

function stringOptions(selectedId: string): SafeHtml {
  const byBrand = new Map<string, typeof db.strings>();
  for (const s of db.strings) byBrand.set(s.brand, [...(byBrand.get(s.brand) ?? []), s]);
  const option = (id: string, label: string): SafeHtml =>
    html`<option value="${id}"${id === selectedId ? ' selected' : ''}>${label}</option>`;
  const groups = [...byBrand].map(
    ([brand, strings]) =>
      html`<optgroup label="${db.brandsStrings[brand]?.name || brand}">${strings.map((s) => option(s.id, s.name))}</optgroup>`,
  );
  const hybrids = db.hybrids.length
    ? html`<optgroup label="Hybrids">${db.hybrids.map((h) => option(h.id, `${h.name} (hybrid)`))}</optgroup>`
    : '';
  return html`<option value="">— Select a string —</option>${groups}${hybrids}${option(CUSTOM, 'Other (type below)')}`;
}

function renderStatus(racquet: RacquetId): void {
  const el = section(racquet);
  if (!el) return;
  const current = currentFor(doc, racquet);
  const count = sortedEntries(doc, racquet).length;
  const expanded = el.classList.contains('log-expanded');
  let left: SafeHtml;
  if (current) {
    const brand = brandOf(current.string.id);
    const tension = formatTension(current.tension);
    left = html`<span class="log-status-label">Currently strung</span><span class="log-status-string"${brand ? html` data-brand="${brand}"` : ''}>${current.string.name}</span>${tension ? html`<span class="log-status-tension">@ ${tension}</span>` : ''}${current.rating > 0 ? html`<span class="log-status-stars">${stars(current.rating, false)}</span>` : ''}<span class="log-status-date">${formatDate(current.date)}</span>${isPinned(doc, current) ? raw('<span class="log-pin-indicator" title="Manually pinned">📌</span>') : ''}`;
  } else {
    left = raw('<span class="log-status-empty">No stringings logged yet</span>');
  }
  el.querySelector('.log-status')!.innerHTML =
    html`<div class="log-status-left">${left}</div><button class="log-toggle" data-log-toggle="${racquet}" aria-expanded="${String(expanded)}"><span class="log-toggle-icon">📋</span><span class="log-toggle-label">Log (${count})</span><span class="log-toggle-caret">${expanded ? '▴' : '▾'}</span></button>`.value;
}

function entryRow(e: LogEntry, racquet: RacquetId): SafeHtml {
  if (editingId === e.id) return editForm(racquet, e);
  const brand = brandOf(e.string.id);
  const pinned = isPinned(doc, e);
  const tension = formatTension(e.tension);
  return html`<div class="log-entry${pinned ? ' log-entry-pinned' : ''}" data-entry-id="${e.id}"><div class="log-entry-main"><div class="log-entry-line1"><span class="log-entry-date">${formatDate(e.date)}</span><span class="log-entry-string"${brand ? html` data-brand="${brand}"` : ''}>${e.string.name}</span>${tension ? html`<span class="log-entry-tension">@ ${tension}</span>` : ''}${e.rating > 0 ? stars(e.rating, false) : ''}${pinned ? raw('<span class="log-entry-pinned-badge" title="Pinned as current">📌 Pinned</span>') : ''}</div>${e.note ? html`<div class="log-entry-note">${e.note}</div>` : ''}</div><div class="log-entry-actions"><button class="log-action log-action-pin" data-action="pin" data-entry-id="${e.id}" title="${pinned ? 'Unpin' : 'Pin as currently strung'}">📌</button><button class="log-action log-action-edit" data-action="edit" data-entry-id="${e.id}" title="Edit">✎</button><button class="log-action log-action-delete" data-action="delete" data-entry-id="${e.id}" title="Delete">🗑</button></div></div>`;
}

function editForm(racquet: RacquetId, entry: LogEntry | null): SafeHtml {
  const e = entry ?? {
    date: todayISO(),
    string: { id: null, name: '' },
    tension: null,
    rating: 0,
    note: '',
  };
  const formId = entry ? entry.id : 'new';
  const custom = !e.string.id && !!e.string.name;
  return html`<form class="log-form" data-form-id="${formId}" data-racquet="${racquet}"><div class="log-form-row"><label class="log-form-field"><span class="log-form-label">Date</span><input type="date" name="date" value="${e.date}" required></label><label class="log-form-field log-form-field-tension"><span class="log-form-label">Tension</span><input type="text" name="tension" value="${formatTension(e.tension)}" placeholder="e.g. 24 or 23/24" maxlength="20"></label></div><div class="log-form-row"><label class="log-form-field log-form-field-string"><span class="log-form-label">String</span><select name="stringId" data-form-string-select>${stringOptions(custom ? CUSTOM : (e.string.id ?? ''))}</select></label></div><div class="log-form-row" data-custom-name-row${custom ? '' : raw(' style="display:none"')}><label class="log-form-field"><span class="log-form-label">Custom string name</span><input type="text" name="customName" value="${custom ? e.string.name : ''}" placeholder="String name" maxlength="60"></label></div><div class="log-form-row"><div class="log-form-field"><span class="log-form-label">Rating</span><div class="log-form-stars" data-form-stars="${e.rating}">${stars(e.rating, true)}<button type="button" class="log-form-stars-clear" data-stars-clear>clear</button></div></div></div><div class="log-form-row"><label class="log-form-field log-form-field-note"><span class="log-form-label">Note (optional)</span><textarea name="note" rows="2" placeholder="How does it play? Anything to remember." maxlength="500">${e.note}</textarea></label></div><div class="log-form-actions"><button type="submit" class="log-form-save">${entry ? 'Save changes' : 'Add entry'}</button><button type="button" class="log-form-cancel" data-form-cancel>Cancel</button></div></form>`;
}

function renderPanel(racquet: RacquetId): void {
  const el = section(racquet);
  if (!el) return;
  const entries = sortedEntries(doc, racquet);
  const adding = editingId === `new-${racquet}`;
  const form = adding
    ? editForm(racquet, null)
    : html`<button class="log-add-btn" data-log-add="${racquet}">+ Add stringing entry</button>`;
  const list =
    entries.length === 0 && !adding
      ? raw(
          '<div class="log-empty">No entries yet. Click <strong>+ Add stringing entry</strong> to log your first restring.</div>',
        )
      : html`${entries.map((e) => entryRow(e, racquet))}`;
  // v0.991: the footer always carries the backup buttons; "Clear all" only with entries.
  const footer = html`<div class="log-panel-footer"><span class="log-backup"><button class="log-backup-btn" data-log-export>Export log</button><button class="log-backup-btn" data-log-import>Import log</button></span>${entries.length > 0 ? html`<button class="log-wipe-btn" data-log-wipe="${racquet}">Clear all entries for this racquet</button>` : ''}</div>`;
  el.querySelector('.log-panel')!.innerHTML =
    html`<div class="log-panel-form-area">${form}</div><div class="log-panel-entries">${list}</div>${footer}`.value;
}

function renderRacquet(racquet: RacquetId): void {
  renderStatus(racquet);
  if (section(racquet)?.classList.contains('log-expanded')) renderPanel(racquet);
}

function renderAll(): void {
  for (const r of db.racquets) renderRacquet(r.id);
}

// ---------------------------------------------------------------- form

function submitForm(form: HTMLFormElement): void {
  const racquet = form.dataset.racquet!;
  const field = <T extends HTMLElement>(name: string): T =>
    form.querySelector<T>(`[name="${name}"]`)!;
  const date = field<HTMLInputElement>('date').value;
  if (!date) return;

  const select = field<HTMLSelectElement>('stringId');
  const stringId = select.value;
  const customName = (
    form.querySelector<HTMLInputElement>('[name="customName"]')?.value ?? ''
  ).trim();
  const string =
    stringId === CUSTOM
      ? { id: null, name: customName }
      : {
          id: stringId || null,
          name:
            db.strings.find((s) => s.id === stringId)?.name ??
            db.hybrids.find((h) => h.id === stringId)?.name ??
            '',
        };
  if (!string.name) {
    select.classList.add('log-form-error');
    return;
  }
  const tensionInput = field<HTMLInputElement>('tension');
  const tension = parseTension(tensionInput.value);
  if (!tension.ok) {
    tensionInput.classList.add('log-form-error');
    return;
  }

  const input: EntryInput = {
    racquetId: racquet,
    date,
    string,
    tension: tension.value,
    rating:
      parseInt(form.querySelector<HTMLElement>('.log-form-stars')!.dataset.formStars!, 10) || 0,
    note: field<HTMLTextAreaElement>('note').value.trim(),
  };
  const now = new Date().toISOString();
  const formId = form.dataset.formId!;
  editingId = null;
  commit(
    formId === 'new'
      ? addEntry(doc, input, crypto.randomUUID(), now)
      : updateEntry(doc, formId, input, now),
    racquet,
  );
}

function setFormStars(starsEl: HTMLElement, value: number): void {
  starsEl.dataset.formStars = String(value);
  starsEl
    .querySelectorAll('.log-star-clickable')
    .forEach((s, i) => s.classList.toggle('log-star-on', i + 1 <= value));
}

// ---------------------------------------------------------------- backups

async function exportLog(): Promise<void> {
  await saving;
  await saveTextFile(`strung-log-${todayISO()}.json`, await store.export());
}

async function importLog(): Promise<void> {
  const text = await pickTextFile();
  if (text === null) return;
  let preview;
  try {
    preview = mergeLogs(doc, parseLogDoc(text));
  } catch (e) {
    window.alert(`Import failed. ${e instanceof LogFormatError ? e.message : String(e)}`);
    return;
  }
  if (preview.added + preview.updated === 0) {
    window.alert('Nothing to import: the log already has every entry in this file.');
    return;
  }
  const question = `Import ${preview.added} new and ${preview.updated} updated entries? Entries already in the log are kept.`;
  if (!window.confirm(question)) return;
  await saving;
  const result = await store.import(text);
  doc = result.doc;
  renderAll();
  emit('log', undefined);
}

// ---------------------------------------------------------------- events

function onClick(e: MouseEvent): void {
  const t = e.target as Element;
  const toggle = t.closest<HTMLElement>('[data-log-toggle]');
  if (toggle) {
    const racquet = toggle.dataset.logToggle!;
    section(racquet)?.classList.toggle('log-expanded');
    return renderRacquet(racquet);
  }
  const add = t.closest<HTMLElement>('[data-log-add]');
  if (add) {
    editingId = `new-${add.dataset.logAdd}`;
    return renderPanel(add.dataset.logAdd!);
  }
  if (t.matches('[data-form-cancel]')) {
    editingId = null;
    return renderPanel(t.closest<HTMLElement>('.log-form')!.dataset.racquet!);
  }
  if (t.matches('.log-star-clickable')) {
    const starsEl = t.closest<HTMLElement>('.log-form-stars')!;
    const value = parseInt((t as HTMLElement).dataset.starValue!, 10);
    // Clicking the current rating again clears it.
    return setFormStars(
      starsEl,
      (parseInt(starsEl.dataset.formStars!, 10) || 0) === value ? 0 : value,
    );
  }
  if (t.matches('[data-stars-clear]'))
    return setFormStars(t.closest<HTMLElement>('.log-form-stars')!, 0);

  const action = t.closest<HTMLElement>('[data-action]');
  if (action) {
    const entry = doc.entries.find((x) => x.id === action.dataset.entryId);
    if (!entry) return;
    const now = new Date().toISOString();
    if (action.dataset.action === 'pin') return commit(togglePin(doc, entry.id), entry.racquetId);
    if (action.dataset.action === 'edit') {
      editingId = entry.id;
      return renderPanel(entry.racquetId);
    }
    if (
      action.dataset.action === 'delete' &&
      window.confirm('Delete this entry? This cannot be undone.')
    ) {
      return commit(deleteEntry(doc, entry.id, now), entry.racquetId);
    }
    return;
  }
  const wipe = t.closest<HTMLElement>('[data-log-wipe]');
  if (wipe) {
    if (window.confirm('Delete ALL log entries for this racquet? This cannot be undone.')) {
      commit(
        wipeRacquet(doc, wipe.dataset.logWipe!, new Date().toISOString()),
        wipe.dataset.logWipe,
      );
    }
    return;
  }
  if (t.closest('[data-log-export]')) return void exportLog();
  if (t.closest('[data-log-import]')) return void importLog();
}

/** Live entries in the shape the search index takes. */
export function logSearchEntries(): LogSearchEntry[] {
  return doc.entries
    .filter((e) => e.deletedAt === null)
    .map((e) => ({
      id: e.id,
      racquet: e.racquetId,
      date: e.date,
      stringName: e.string.name,
      tension: formatTension(e.tension),
      note: e.note,
    }));
}

export async function initLog(data: TennisDb, logStore: LogStore): Promise<void> {
  db = data;
  store = logStore;
  document.addEventListener('click', onClick);
  document.addEventListener('change', (e) => {
    const t = e.target as HTMLElement;
    if (!t.matches('[data-form-string-select]')) return;
    const row = t.closest('.log-form')!.querySelector<HTMLElement>('[data-custom-name-row]')!;
    row.style.display = (t as HTMLSelectElement).value === CUSTOM ? '' : 'none';
    t.classList.remove('log-form-error');
  });
  document.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    if (t.matches('.log-form [name="tension"]')) t.classList.remove('log-form-error');
  });
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    if (!form.matches('.log-form')) return;
    e.preventDefault();
    submitForm(form);
  });
  try {
    doc = await store.load();
  } catch (err) {
    console.warn('[log] load failed:', err);
  }
  renderAll();
  emit('log', undefined);
}
