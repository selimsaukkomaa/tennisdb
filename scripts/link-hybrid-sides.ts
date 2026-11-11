// Phase 2 step 2, second move (docs/phase-2-data-model.md, D7): each hybrid's mains and
// crosses get a `stringId` linking them to the string they name. One-off, kept for provenance.
//
// The links come from a table the owner approved on 2026-11-09, not from name matching:
// "O-Toro Snap TF" is O-Toro Snap Tour Flex (the notes say so; a prefix match would pick
// O-Toro Snap), and "Wasabi X" is not in the data (round, unlike the square Wasabi), so it
// stays unlinked (null). The script checks each side's text before linking it, asserts 20
// sides with 19 links, and writes nothing if anything differs.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'hybrids.json');

/** [hybrid id, side, text the side holds, string id or null] */
const LINKS: [string, 'mains' | 'crosses', string, string | null][] = [
  ['toroline-k-pop', 'mains', 'Wasabi', 'toroline-wasabi'],
  ['toroline-k-pop', 'crosses', 'Caviar', 'toroline-caviar'],
  ['toroline-k-pop-spin', 'mains', 'O-Toro Spin', 'toroline-o-toro-spin'],
  ['toroline-k-pop-spin', 'crosses', 'O-Toro', 'toroline-o-toro'],
  ['toroline-dreddy', 'mains', 'O-Toro Tour', 'toroline-o-toro-tour'],
  ['toroline-dreddy', 'crosses', 'O-Toro Snap', 'toroline-o-toro-snap'],
  ['toroline-stevie', 'mains', 'O-Toro Tour', 'toroline-o-toro-tour'],
  ['toroline-stevie', 'crosses', 'Truffle X', 'toroline-truffle-x'],
  ['toroline-101', 'mains', 'O-Toro', 'toroline-o-toro'],
  ['toroline-101', 'crosses', 'O-Toro Snap', 'toroline-o-toro-snap'],
  ['toroline-o-snap', 'mains', 'O-Toro', 'toroline-o-toro'],
  ['toroline-o-snap', 'crosses', 'O-Toro Snap TF', 'toroline-o-toro-snap-tour-flex'],
  ['toroline-wasabi-pro', 'mains', 'Wasabi', 'toroline-wasabi'],
  ['toroline-wasabi-pro', 'crosses', 'Wasabi X', null],
  ['toroline-what-the-hybrid', 'mains', 'Wasabi', 'toroline-wasabi'],
  ['toroline-what-the-hybrid', 'crosses', 'Toro Toro', 'toroline-toro-toro'],
  ['toroline-snapaholic', 'mains', 'Snapper', 'toroline-snapper'],
  ['toroline-snapaholic', 'crosses', 'O-Toro Snap TF', 'toroline-o-toro-snap-tour-flex'],
  ['toroline-cole', 'mains', 'O-Toro Tour 1.23 Mint', 'toroline-o-toro-tour'],
  ['toroline-cole', 'crosses', 'O-Toro 1.23 Green', 'toroline-o-toro'],
];

interface Side {
  string: string;
  stringId?: string | null;
}
type Hybrid = { id: string } & Record<'mains' | 'crosses', Side>;

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`link check failed: ${message}`);
}

const hybrids = JSON.parse(readFileSync(FILE, 'utf8')) as Hybrid[];
const stringIds = new Set(
  (JSON.parse(readFileSync(join(dirname(FILE), 'strings.json'), 'utf8')) as { id: string }[]).map(
    (s) => s.id,
  ),
);
assert(hybrids.length * 2 === LINKS.length, `20 sides (got ${hybrids.length * 2})`);
for (const [id, side, text, stringId] of LINKS) {
  const h = hybrids.find((x) => x.id === id);
  assert(!!h, `hybrid ${id} exists`);
  assert(h![side].string === text, `${id} ${side} reads "${text}" (got "${h![side].string}")`);
  assert(!('stringId' in h![side]), `${id} ${side} not linked yet`);
  assert(stringId === null || stringIds.has(stringId), `${stringId} is a string`);
  h![side].stringId = stringId;
}
const linked = hybrids.flatMap((h) => [h.mains, h.crosses]).filter((s) => s.stringId).length;
assert(linked === 19, `19 links and 1 unlinked (got ${linked})`);

writeFileSync(FILE, `${JSON.stringify(hybrids, null, 2)}\n`);
console.log(`Linked ${linked} of ${LINKS.length} hybrid sides; Wasabi X left unlinked.`);
