// The JSON Schema files in schemas/ are generated from the Zod schemas (`npm run schemas`). They
// must be current, and since a native app would build on them, a standard JSON Schema validator
// must accept the real data with them and reject what the Zod schemas reject.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormatsModule from 'ajv-formats';
import { describe, expect, test } from 'vitest';
import { SCHEMA_FILES, SCHEMAS_DIR, renderSchema } from '../../scripts/export-schemas';
import { loadFromDisk } from '../../scripts/validate-data';
import seed from '../fixtures/log-seed.json';

const addFormats = addFormatsModule as unknown as (ajv: Ajv2020) => Ajv2020;
const committed = (file: string): string => readFileSync(join(SCHEMAS_DIR, file), 'utf8');

test.each(Object.entries(SCHEMA_FILES))('schemas/%s is up to date', (file, schema) => {
  expect(committed(file), 'run `npm run schemas`').toBe(renderSchema(schema));
});

describe('a standard JSON Schema validator agrees with the Zod schemas', () => {
  const ajv = addFormats(new Ajv2020({ allErrors: true }));
  const check = (file: string, data: unknown): string[] => {
    const validate = ajv.compile(JSON.parse(committed(file)));
    validate(data);
    return (validate.errors ?? []).map((e) => `${e.instancePath} ${e.message}`);
  };
  const { db, copy } = loadFromDisk();

  test('the equipment data passes', () => expect(check('tennisdb.schema.json', db)).toEqual([]));
  test('the copy passes', () => expect(check('copy.schema.json', copy)).toEqual([]));
  test('a stringing-log backup passes', () => {
    expect(check('stringing-log.schema.json', seed.tennis_log_v2)).toEqual([]);
  });

  test('it rejects a feel token no chip matches, an unknown key and an uppercase id', () => {
    const bad = structuredClone(db);
    bad.strings[0]!.feelAttr += ',muted';
    (bad.strings[1] as unknown as Record<string, unknown>).topPick = true;
    bad.strings[2]!.id = 'Toroline-X';
    const errors = check('tennisdb.schema.json', bad);
    expect(errors.some((e) => e.startsWith('/strings/0/feelAttr'))).toBe(true);
    expect(errors.some((e) => e.startsWith('/strings/1 '))).toBe(true);
    expect(errors.some((e) => e.startsWith('/strings/2/id'))).toBe(true);
  });
});
