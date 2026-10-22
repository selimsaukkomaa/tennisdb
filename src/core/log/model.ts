// Stringing-log operations. Pure: each returns a new document; storage is the LogStore's job.
// Deletes are soft (deletedAt) so a later sync can tell a deletion from a missing entry.
import type { RacquetId } from '../types';
import type { LogDoc, LogEntry } from './schema';

/** The fields a user enters for one stringing. */
export type EntryInput = Pick<
  LogEntry,
  'racquetId' | 'date' | 'string' | 'tension' | 'rating' | 'note'
>;

export const isLive = (e: LogEntry): boolean => e.deletedAt === null;

export function entriesFor(doc: LogDoc, racquet: RacquetId): LogEntry[] {
  return doc.entries.filter((e) => isLive(e) && e.racquetId === racquet);
}

/** Newest stringing first; same-day entries by when they were logged, newest first. */
export function sortedEntries(doc: LogDoc, racquet: RacquetId): LogEntry[] {
  return entriesFor(doc, racquet).sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export const isPinned = (doc: LogDoc, e: LogEntry): boolean => doc.pins[e.racquetId] === e.id;

/** "Currently strung": the pinned entry if there is one, else the most recent stringing. */
export function currentFor(doc: LogDoc, racquet: RacquetId): LogEntry | null {
  const pinned = entriesFor(doc, racquet).find((e) => isPinned(doc, e));
  return pinned ?? sortedEntries(doc, racquet)[0] ?? null;
}

export function addEntry(doc: LogDoc, input: EntryInput, id: string, now: string): LogDoc {
  const entry: LogEntry = { ...input, id, createdAt: now, updatedAt: now, deletedAt: null };
  return { ...doc, entries: [...doc.entries, entry] };
}

export function updateEntry(
  doc: LogDoc,
  id: string,
  patch: Partial<EntryInput>,
  now: string,
): LogDoc {
  return {
    ...doc,
    entries: doc.entries.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: now } : e)),
  };
}

function withoutPinsTo(pins: LogDoc['pins'], ids: ReadonlySet<string>): LogDoc['pins'] {
  return Object.fromEntries(Object.entries(pins).filter(([, id]) => !ids.has(id)));
}

export function deleteEntry(doc: LogDoc, id: string, now: string): LogDoc {
  return {
    ...doc,
    entries: doc.entries.map((e) =>
      e.id === id && isLive(e) ? { ...e, deletedAt: now, updatedAt: now } : e,
    ),
    pins: withoutPinsTo(doc.pins, new Set([id])),
  };
}

/** Deletes every entry of one racquet. */
export function wipeRacquet(doc: LogDoc, racquet: RacquetId, now: string): LogDoc {
  const ids = new Set(entriesFor(doc, racquet).map((e) => e.id));
  return {
    ...doc,
    entries: doc.entries.map((e) => (ids.has(e.id) ? { ...e, deletedAt: now, updatedAt: now } : e)),
    pins: withoutPinsTo(doc.pins, ids),
  };
}

/** Pins an entry as currently strung (replacing the racquet's pin), or unpins it. */
export function togglePin(doc: LogDoc, id: string): LogDoc {
  const entry = doc.entries.find((e) => e.id === id && isLive(e));
  if (!entry) return doc;
  const pins = { ...doc.pins };
  if (pins[entry.racquetId] === id) delete pins[entry.racquetId];
  else pins[entry.racquetId] = id;
  return { ...doc, pins };
}
