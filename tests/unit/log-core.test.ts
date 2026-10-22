import { describe, expect, test } from 'vitest';
import { mergeLogs } from '../../src/core/log/merge';
import {
  addEntry,
  currentFor,
  deleteEntry,
  sortedEntries,
  togglePin,
  updateEntry,
  wipeRacquet,
  type EntryInput,
} from '../../src/core/log/model';
import { LogFormatError, emptyLog, parseLogDoc, type LogDoc } from '../../src/core/log/schema';
import { KeyValueLogStore, LOG_STORAGE_KEY, type KeyValueBackend } from '../../src/core/log/store';
import { formatTension, parseTension } from '../../src/core/log/tension';
import seed from '../fixtures/log-seed.json';

const ID = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const T = (day: number): string => `2026-10-${String(day).padStart(2, '0')}T12:00:00.000Z`;
const input = (over: Partial<EntryInput> = {}): EntryInput => ({
  racquetId: 'regna',
  date: '2026-10-01',
  string: { id: 'toroline-caviar', name: 'Caviar' },
  tension: { mainsKg: 23, crossesKg: 24 },
  rating: 4,
  note: '',
  ...over,
});

describe('tension', () => {
  test.each([
    ['24', { mainsKg: 24, crossesKg: null }],
    ['23.5', { mainsKg: 23.5, crossesKg: null }],
    ['23,5', { mainsKg: 23.5, crossesKg: null }],
    ['23/24', { mainsKg: 23, crossesKg: 24 }],
    [' 23 / 24 kg ', { mainsKg: 23, crossesKg: 24 }],
    ['24 kg', { mainsKg: 24, crossesKg: null }],
    ['23kg/24kg', { mainsKg: 23, crossesKg: 24 }],
  ])('parses %j', (text, value) => {
    expect(parseTension(text)).toEqual({ ok: true, value });
  });

  test('empty means no tension', () => {
    expect(parseTension('  ')).toEqual({ ok: true, value: null });
  });

  test.each(['abc', '24 lbs', '23-24', '2', '55', '23/', '/24', '23/24/25'])(
    'rejects %j',
    (text) => {
      expect(parseTension(text).ok).toBe(false);
    },
  );

  test('formats as entered, without a unit', () => {
    expect(formatTension({ mainsKg: 24, crossesKg: null })).toBe('24');
    expect(formatTension({ mainsKg: 23.5, crossesKg: 24 })).toBe('23.5/24');
    expect(formatTension(null)).toBe('');
  });
});

describe('schema', () => {
  test('the fixture parses', () => {
    const doc = parseLogDoc(JSON.stringify(seed.tennis_log_v2));
    expect(doc.entries).toHaveLength(3);
  });

  test('rejects other formats with a readable reason', () => {
    expect(() => parseLogDoc('not json')).toThrow(LogFormatError);
    expect(() => parseLogDoc(JSON.stringify(seed.tennis_log_v1))).toThrow(/schema/i);
    const bad = structuredClone(seed.tennis_log_v2);
    bad.entries[0]!.rating = 7;
    expect(() => parseLogDoc(JSON.stringify(bad))).toThrow(/entries\.0\.rating/);
  });
});

describe('operations', () => {
  const two = (): LogDoc => {
    let doc = addEntry(emptyLog(), input({ date: '2026-09-01' }), ID(1), T(1));
    doc = addEntry(
      doc,
      input({ date: '2026-10-01', string: { id: null, name: 'Custom' } }),
      ID(2),
      T(2),
    );
    return doc;
  };

  test('newest stringing first; the latest is current until something is pinned', () => {
    const doc = two();
    expect(sortedEntries(doc, 'regna').map((e) => e.id)).toEqual([ID(2), ID(1)]);
    expect(currentFor(doc, 'regna')?.id).toBe(ID(2));
    expect(currentFor(doc, 'percept')).toBeNull();
  });

  test('same-day entries order by when they were logged', () => {
    let doc = addEntry(emptyLog(), input(), ID(1), T(1));
    doc = addEntry(doc, input(), ID(2), T(2));
    expect(sortedEntries(doc, 'regna')[0]!.id).toBe(ID(2));
  });

  test('a pin overrides recency and toggles off', () => {
    let doc = togglePin(two(), ID(1));
    expect(currentFor(doc, 'regna')?.id).toBe(ID(1));
    doc = togglePin(doc, ID(2));
    expect(doc.pins).toEqual({ regna: ID(2) });
    doc = togglePin(doc, ID(2));
    expect(doc.pins).toEqual({});
  });

  test('update stamps updatedAt and keeps createdAt', () => {
    const doc = updateEntry(two(), ID(1), { rating: 5 }, T(9));
    const e = doc.entries.find((x) => x.id === ID(1))!;
    expect([e.rating, e.createdAt, e.updatedAt]).toEqual([5, T(1), T(9)]);
  });

  test('delete is soft and drops the pin', () => {
    const doc = deleteEntry(togglePin(two(), ID(1)), ID(1), T(9));
    expect(doc.entries).toHaveLength(2);
    expect(doc.entries.find((x) => x.id === ID(1))!.deletedAt).toBe(T(9));
    expect(sortedEntries(doc, 'regna').map((e) => e.id)).toEqual([ID(2)]);
    expect(doc.pins).toEqual({});
  });

  test('wipe deletes one racquet only', () => {
    let doc = addEntry(two(), input({ racquetId: 'percept' }), ID(3), T(3));
    doc = wipeRacquet(doc, 'regna', T(9));
    expect(sortedEntries(doc, 'regna')).toEqual([]);
    expect(sortedEntries(doc, 'percept')).toHaveLength(1);
  });
});

describe('merge', () => {
  const base = (): LogDoc => addEntry(emptyLog(), input(), ID(1), T(1));

  test('adds new entries and keeps local ones', () => {
    const theirs = addEntry(emptyLog(), input(), ID(2), T(2));
    const r = mergeLogs(base(), theirs);
    expect([r.added, r.updated, r.unchanged]).toEqual([1, 0, 0]);
    expect(r.doc.entries.map((e) => e.id).sort()).toEqual([ID(1), ID(2)]);
  });

  test('the newer version of an entry wins, either way round', () => {
    const edited = updateEntry(base(), ID(1), { rating: 1 }, T(5));
    expect(mergeLogs(base(), edited).updated).toBe(1);
    const r = mergeLogs(edited, base());
    expect([r.updated, r.unchanged]).toEqual([0, 1]);
    expect(r.doc.entries[0]!.rating).toBe(1);
  });

  test('a newer deletion carries over', () => {
    const deleted = deleteEntry(base(), ID(1), T(5));
    const r = mergeLogs(base(), deleted);
    expect(r.updated).toBe(1);
    expect(r.doc.entries[0]!.deletedAt).toBe(T(5));
  });

  test('pins: local wins, imported fills in, dead pins drop', () => {
    let local = addEntry(base(), input(), ID(2), T(2));
    local = togglePin(local, ID(1));
    const theirs = togglePin(addEntry(local, input({ racquetId: 'percept' }), ID(3), T(3)), ID(3));
    const otherPin = togglePin(local, ID(2));
    expect(mergeLogs(local, otherPin).doc.pins).toEqual({ regna: ID(1) });
    expect(mergeLogs(local, theirs).doc.pins).toEqual({ regna: ID(1), percept: ID(3) });
    const localDeleted = deleteEntry(local, ID(1), T(9));
    expect(mergeLogs(localDeleted, otherPin).doc.pins).toEqual({ regna: ID(2) });
  });
});

describe('KeyValueLogStore', () => {
  const memory = (): KeyValueBackend & { data: Map<string, string> } => {
    const data = new Map<string, string>();
    return {
      data,
      async get(k) {
        return data.get(k) ?? null;
      },
      async set(k, v) {
        data.set(k, v);
      },
    };
  };

  test('starts empty and round-trips', async () => {
    const store = new KeyValueLogStore(memory(), () => T(1));
    expect(await store.load()).toEqual(emptyLog());
    const doc = addEntry(emptyLog(), input(), ID(1), T(1));
    await store.save(doc);
    expect(await store.load()).toEqual(doc);
  });

  test('sets unreadable data aside instead of overwriting it', async () => {
    const backend = memory();
    backend.data.set(LOG_STORAGE_KEY, '{"broken":');
    const store = new KeyValueLogStore(backend, () => T(1));
    expect(await store.load()).toEqual(emptyLog());
    expect(backend.data.get(`${LOG_STORAGE_KEY}.unreadable-${T(1)}`)).toBe('{"broken":');
  });

  test('export is a tagged backup file that imports back', async () => {
    const source = new KeyValueLogStore(memory(), () => T(7));
    await source.save(togglePin(addEntry(emptyLog(), input(), ID(1), T(1)), ID(1)));
    const file = await source.export();
    expect(JSON.parse(file)).toMatchObject({ schema: 2, app: 'tennisdb', exportedAt: T(7) });

    const target = new KeyValueLogStore(memory());
    const result = await target.import(file);
    expect([result.added, result.updated]).toEqual([1, 0]);
    expect((await target.load()).pins).toEqual({ regna: ID(1) });
    expect((await target.import(file)).unchanged).toBe(1);
  });
});
