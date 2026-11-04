// Writes the schemas as JSON Schema (draft 2020-12) to schemas/, for tools and a future native
// app: the equipment data, the UI copy and the stringing log's backup format. The files are
// generated; run `npm run schemas` after changing src/core/schema.ts or src/core/log/schema.ts.
// tests/data/schemas.test.ts fails while they are out of date.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { LogDocSchema } from '../src/core/log/schema';
import { CopySchema, TennisDbSchema } from '../src/core/schema';

export const SCHEMAS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'schemas');

export const SCHEMA_FILES: Record<string, z.ZodType> = {
  'tennisdb.schema.json': TennisDbSchema,
  'copy.schema.json': CopySchema,
  'stringing-log.schema.json': LogDocSchema,
};

/** Parts with an id in schema.ts (String, Grip, Bar...) become named $defs; the rest is inlined. */
export function renderSchema(schema: z.ZodType): string {
  return `${JSON.stringify(z.toJSONSchema(schema), null, 2)}\n`;
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') {
  mkdirSync(SCHEMAS_DIR, { recursive: true });
  for (const [file, schema] of Object.entries(SCHEMA_FILES)) {
    writeFileSync(join(SCHEMAS_DIR, file), renderSchema(schema));
  }
  console.log(`Wrote ${Object.keys(SCHEMA_FILES).length} JSON Schema files to schemas/.`);
}
