// Where the stringing log lives. The app talks to a LogStore; the backend is swappable
// (localStorage on the web, Capacitor Preferences on iOS, a sync service later).
import { mergeLogs, type MergeResult } from './merge';
import { LOG_SCHEMA_VERSION, LogFormatError, emptyLog, parseLogDoc, type LogDoc } from './schema';

export interface LogStore {
  load(): Promise<LogDoc>;
  save(doc: LogDoc): Promise<void>;
  /** The stored log as a backup file (JSON text). */
  export(): Promise<string>;
  /** Validates a backup file, merges it into the stored log and saves the result. */
  import(json: string): Promise<MergeResult>;
}

/** Minimal async key-value storage a LogStore can sit on. */
export interface KeyValueBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export const LOG_STORAGE_KEY = 'tennis_log_v2';

export class KeyValueLogStore implements LogStore {
  constructor(
    private readonly backend: KeyValueBackend,
    private readonly now: () => string = () => new Date().toISOString(),
    private readonly key: string = LOG_STORAGE_KEY,
  ) {}

  async load(): Promise<LogDoc> {
    const raw = await this.backend.get(this.key);
    if (raw === null) return emptyLog();
    try {
      return parseLogDoc(raw);
    } catch (e) {
      if (!(e instanceof LogFormatError)) throw e;
      // Never overwrite data we can't read: set it aside and start empty.
      await this.backend.set(`${this.key}.unreadable-${this.now()}`, raw);
      console.warn(`[log] stored log unreadable (${e.message}); kept under a backup key`);
      return emptyLog();
    }
  }

  async save(doc: LogDoc): Promise<void> {
    const { entries, pins } = doc;
    await this.backend.set(this.key, JSON.stringify({ schema: LOG_SCHEMA_VERSION, entries, pins }));
  }

  async export(): Promise<string> {
    const { entries, pins } = await this.load();
    const file: LogDoc = {
      schema: LOG_SCHEMA_VERSION,
      app: 'tennisdb',
      exportedAt: this.now(),
      entries,
      pins,
    };
    return JSON.stringify(file, null, 2) + '\n';
  }

  async import(json: string): Promise<MergeResult> {
    const result = mergeLogs(await this.load(), parseLogDoc(json));
    await this.save(result.doc);
    return result;
  }
}
