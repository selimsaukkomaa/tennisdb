// Stringing log, schema v2. Stored as one JSON document; the same shape is the backup file.
//
// v2 against v0.990's tennis_log_v1 (no migration: the log starts empty):
//   - UUID ids, createdAt / updatedAt, and soft deletes (deletedAt), so a later sync can merge
//   - tension as numbers in kg instead of free text
//   - one pin per racquet (`pins`) instead of a pinnedAsCurrent flag on every entry
//   - `schema` version for future migrations
import { z } from 'zod';
import { MAX_KG, MIN_KG } from './tension';

export const LOG_SCHEMA_VERSION = 2;

const Kg = z.number().min(MIN_KG).max(MAX_KG);

export const LogEntrySchema = z.object({
  id: z.uuid(),
  racquetId: z.string().min(1),
  /** Local calendar date of the stringing, YYYY-MM-DD. */
  date: z.iso.date(),
  /** `id` is a string or hybrid id from the database, or null for a custom name. */
  string: z.object({ id: z.string().min(1).nullable(), name: z.string().min(1).max(60) }),
  tension: z.object({ mainsKg: Kg, crossesKg: Kg.nullable() }).nullable(),
  /** 0 = unrated, else 1-5 stars. */
  rating: z.number().int().min(0).max(5),
  note: z.string().max(500),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deletedAt: z.iso.datetime().nullable(),
});

export const LogDocSchema = z.object({
  schema: z.literal(LOG_SCHEMA_VERSION),
  /** Present in backup files. */
  app: z.literal('tennisdb').optional(),
  exportedAt: z.iso.datetime().optional(),
  entries: z.array(LogEntrySchema),
  /** The entry pinned as "currently strung", per racquet. */
  pins: z.record(z.string(), z.uuid()),
});

export type LogEntry = z.infer<typeof LogEntrySchema>;
export type LogDoc = z.infer<typeof LogDocSchema>;

export const emptyLog = (): LogDoc => ({ schema: LOG_SCHEMA_VERSION, entries: [], pins: {} });

export class LogFormatError extends Error {}

/** Parses and validates a stored document or backup file. Throws LogFormatError. */
export function parseLogDoc(json: string): LogDoc {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new LogFormatError('Not a JSON file.');
  }
  const result = LogDocSchema.safeParse(data);
  if (!result.success) {
    const schema = (data as { schema?: unknown } | null)?.schema;
    if (schema !== undefined && schema !== LOG_SCHEMA_VERSION) {
      throw new LogFormatError(`Unsupported log schema: ${String(schema)}.`);
    }
    const issue = result.error.issues[0];
    throw new LogFormatError(
      `Not a valid stringing log (${issue?.path.join('.') || 'file'}: ${issue?.message}).`,
    );
  }
  return result.data;
}
