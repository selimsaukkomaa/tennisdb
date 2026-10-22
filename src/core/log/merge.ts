// Merging an imported log (a backup, or the other device's export) into the local one.
// Entries match by id and the newer updatedAt wins, so a deletion (a tombstone with a newer
// updatedAt) carries over like any edit. Nothing local is lost to an older copy.
import { isLive } from './model';
import { LOG_SCHEMA_VERSION, type LogDoc, type LogEntry } from './schema';

export interface MergeResult {
  doc: LogDoc;
  /** Live entries that were not in the local log. */
  added: number;
  /** Local entries replaced by a newer version (edits and deletions). */
  updated: number;
  unchanged: number;
}

export function mergeLogs(local: LogDoc, incoming: LogDoc): MergeResult {
  const byId = new Map<string, LogEntry>(local.entries.map((e) => [e.id, e]));
  let added = 0;
  let updated = 0;
  let unchanged = 0;
  for (const theirs of incoming.entries) {
    const ours = byId.get(theirs.id);
    if (!ours) {
      byId.set(theirs.id, theirs);
      if (isLive(theirs)) added++;
    } else if (theirs.updatedAt > ours.updatedAt) {
      byId.set(theirs.id, theirs);
      updated++;
    } else {
      unchanged++;
    }
  }
  const entries = [...byId.values()];

  // A pin survives if it points at a live entry; the local pin wins over the imported one.
  const live = new Set(entries.filter(isLive).map((e) => e.id));
  const pins: LogDoc['pins'] = {};
  for (const racquet of new Set([...Object.keys(local.pins), ...Object.keys(incoming.pins)])) {
    const pick = [local.pins[racquet], incoming.pins[racquet]].find((id) => id && live.has(id));
    if (pick) pins[racquet] = pick;
  }

  return { doc: { schema: LOG_SCHEMA_VERSION, entries, pins }, added, updated, unchanged };
}
