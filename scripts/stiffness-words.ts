// Phase 2 step 3, second release (docs/phase-2-data-model.md, D2): the texts that still used a
// stiffness word v1.1's bands no longer support. One-off, kept for provenance; the tests import
// STIFFNESS_WORD_EDITS to apply the same edits to legacy v0.990 (patch G) and to its data in the
// round trip.
//
// Scope, approved by the owner on 2026-11-18 after a sample of five:
//   - a word naming the string's own band that is now wrong ("medium-firm" on a string that is
//     now Medium or Med-Soft), or a firm-side word on one of the 8 strings v1.1 moved to Soft:
//     23 texts in 11 strings. Each edit changes only those words;
//   - each hybrid side label's stiffness word matches the band of the string it links to: 14
//     labels (validate.ts keeps them matching: hybrid-side-band).
// Words that stay true (a Very Firm string is firm), descriptions of the strung bed in a given
// frame, and quotes stay. Poly Tour Rev's "Firmer than Pro" is left as a flag.
//
// Before writing, it asserts every edit's text occurs exactly once where it is listed, the
// counts above, and that the hybrid labels then match their strings.
//
//   tsx scripts/stiffness-words.ts --sample   prints a sample batch, writes nothing
//   tsx scripts/stiffness-words.ts            edits data/strings.json, pairings.json, hybrids.json
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stiffnessBand } from '../src/core/stiffness';

export interface TextEdit {
  /** A string's or a hybrid's id. */
  id: string;
  /** A string's feel text, its note in `racquet`, or a hybrid side's label. */
  field: 'feelSummary' | 'feelExpand' | 'note' | 'mains' | 'crosses';
  racquet?: string;
  from: string;
  to: string;
}

const note = (id: string, racquet: string, from: string, to: string): TextEdit => ({
  id,
  field: 'note',
  racquet,
  from,
  to,
});
const side = (id: string, field: 'mains' | 'crosses', from: string, to: string): TextEdit => ({
  id,
  field,
  from,
  to,
});

export const STIFFNESS_WORD_EDITS: readonly TextEdit[] = [
  // Poly Tour Strike: Medium · 0.92, moved to Soft
  {
    id: 'yonex-poly-tour-strike',
    field: 'feelExpand',
    from: 'with a firm, penetrating response',
    to: 'with a penetrating response',
  },
  note(
    'yonex-poly-tour-strike',
    'regna',
    '0.92 kg/mm: firm, penetrating',
    '0.92 kg/mm: penetrating',
  ),
  note(
    'yonex-poly-tour-strike',
    'regna',
    'Full bed in the 64 RA frame is firm and clear without being sharp',
    'Full bed in the 64 RA frame: medium stiffness, clear without being sharp',
  ),
  note(
    'yonex-poly-tour-strike',
    'headpt630',
    'plays mid-firm and stable',
    'plays medium and stable',
  ),
  // Poly Tour Rev: Med-Soft · 0.85–0.95, moved to Soft
  {
    id: 'yonex-poly-tour-rev',
    field: 'feelSummary',
    from: 'Firm but dampened',
    to: 'Octagonal, damped',
  },
  {
    id: 'yonex-poly-tour-rev',
    field: 'feelExpand',
    from: 'Stiff stringbed',
    to: 'Medium-soft stringbed',
  },
  // Sync: Med-Soft · 0.85–0.95, moved to Soft
  note(
    'restring-sync',
    'headpt630',
    "softening the string's firmness",
    "softening the string's stiffness",
  ),
  // Tour M8: Medium · 0.90–0.95, moved to Soft
  {
    id: 'grapplesnake-tour-m8',
    field: 'feelSummary',
    from: 'Octagonal, medium-firm',
    to: 'Octagonal, medium stiffness',
  },
  note(
    'grapplesnake-tour-m8',
    'regna',
    'frame: medium-firm, good pocketing',
    'frame: medium stiffness, good pocketing',
  ),
  note(
    'grapplesnake-tour-m8',
    'percept',
    'Medium-firm stiffness through the extra crosses',
    'Medium stiffness through the extra crosses',
  ),
  // Paradox Pro: Medium · ~0.95, moved to Soft
  {
    id: 'grapplesnake-paradox-pro',
    field: 'feelExpand',
    from: 'with firm, traditional feel',
    to: 'with a solid, traditional feel',
  },
  note(
    'grapplesnake-paradox-pro',
    'regna',
    'frame: medium-firm, low launch',
    'frame: medium stiffness, low launch',
  ),
  note(
    'grapplesnake-paradox-pro',
    'headpt630',
    'softens the metal-infused firmness',
    'softens the metal-infused string',
  ),
  // ALU Power Feel: Medium · 0.95, moved to Soft
  note(
    'luxilon-alu-power-feel',
    'headpt630',
    'Medium-firm bed in the 58 RA frame',
    'Medium bed in the 58 RA frame',
  ),
  // 4G Soft: Medium · 0.95, moved to Soft
  note(
    'luxilon-4g-soft',
    'regna',
    'frame: medium-firm, more dwell',
    'frame: medium stiffness, more dwell',
  ),
  note('luxilon-4g-soft', 'percept', 'Medium-firm round poly', 'Medium-stiffness round poly'),
  // Big Hitter Silver Rough: Medium · 0.92, moved to Soft
  note(
    'tourna-big-hitter-silver-rough',
    'regna',
    'frame: medium-firm, more dwell',
    'frame: medium stiffness, more dwell',
  ),
  // Poly Tour Drive: Med-Soft · ~0.90 (its "medium-firm" was already at odds with v1.0's Medium)
  {
    id: 'yonex-poly-tour-drive',
    field: 'feelSummary',
    from: 'Pentagonal, medium-firm',
    to: 'Pentagonal, medium-soft',
  },
  {
    id: 'yonex-poly-tour-drive',
    field: 'feelExpand',
    from: 'Medium-firm pentagonal co-poly',
    to: 'Medium-soft pentagonal co-poly',
  },
  note(
    'yonex-poly-tour-drive',
    'regna',
    'moderate pocketing, medium-firm feedback that stays clear',
    'moderate pocketing, feedback that stays clear',
  ),
  note(
    'yonex-poly-tour-drive',
    'percept',
    "the string's medium stiffness",
    "the string's medium-soft stiffness",
  ),
  note(
    'yonex-poly-tour-drive',
    'headpt630',
    'Shaped, medium-firm and inexpensive',
    'Shaped, medium-soft and inexpensive',
  ),
  // Poly Tour Tough: Soft · 0.77 (its "firm" was already at odds with v1.0's Med-Soft)
  {
    id: 'yonex-poly-tour-tough',
    field: 'feelSummary',
    from: 'Low-powered, firm',
    to: 'Low-powered, muted',
  },
  // Game Changer: Med-Soft · ~0.90
  note(
    'grapplesnake-game-changer',
    'regna',
    'medium stiffness, more launch',
    'medium-soft stiffness, more launch',
  ),

  // Hybrid side labels: the stiffness word is the linked string's band
  side('toroline-k-pop', 'mains', 'Square · Firm', 'Square · Medium'),
  side('toroline-k-pop-spin', 'mains', 'Pentagonal · Med', 'Pentagonal · Medium'),
  side('toroline-k-pop-spin', 'crosses', 'Hexagonal · Med-Soft', 'Hexagonal · Medium'),
  side('toroline-dreddy', 'mains', 'Hexagonal · Firm', 'Hexagonal · Very Firm'),
  side('toroline-dreddy', 'crosses', 'Round · Soft', 'Round · Medium'),
  side('toroline-stevie', 'mains', 'Hexagonal · Firm', 'Hexagonal · Very Firm'),
  side('toroline-101', 'mains', 'Hexagonal · Med-Soft', 'Hexagonal · Medium'),
  side('toroline-101', 'crosses', 'Round · Soft', 'Round · Medium'),
  side('toroline-o-snap', 'mains', 'Hexagonal · Med-Soft', 'Hexagonal · Medium'),
  side('toroline-wasabi-pro', 'mains', 'Square · Firm', 'Square · Medium'),
  side('toroline-what-the-hybrid', 'mains', 'Square · Firm', 'Square · Medium'),
  side('toroline-what-the-hybrid', 'crosses', 'Hexagonal · Med-Soft', 'Hexagonal · Medium'),
  side('toroline-snapaholic', 'mains', 'Octagonal · Firm', 'Octagonal · Med-Soft'),
  side('toroline-cole', 'mains', 'Hexagonal · Firm', 'Hexagonal · Very Firm'),
];

// ---------------------------------------------------------------- the one-off run

function assert(ok: boolean, message: string): void {
  if (!ok) throw new Error(`migration check failed: ${message}`);
}

/** Replaces `from` with `to`, which must occur exactly once in `text`. */
export function applyOnce(text: string, edit: TextEdit): string {
  const n = text.split(edit.from).length - 1;
  assert(
    n === 1,
    `${edit.id} ${edit.field}${edit.racquet ? '/' + edit.racquet : ''}: "${edit.from}" occurs ${n} times`,
  );
  return text.replace(edit.from, () => edit.to);
}

function main(): void {
  const DATA = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
  const read = <T>(f: string): T => JSON.parse(readFileSync(join(DATA, f), 'utf8')) as T;
  const write = (f: string, v: unknown): void =>
    writeFileSync(join(DATA, f), `${JSON.stringify(v, null, 2)}\n`);
  type Rec = Record<string, unknown> & { id: string; name: string };
  type Side = { shapeFeelLabel: string; stringId: string | null };
  type Pairing = { itemId: string; racquetId: string; note: string };

  const strings = read<Rec[]>('strings.json');
  const hybrids = read<(Rec & { mains: Side; crosses: Side })[]>('hybrids.json');
  const pairings = read<Pairing[]>('pairings.json');
  const before = JSON.stringify([strings, hybrids, pairings]);
  const texts = new Set<string>();
  const items = new Set<string>();

  for (const e of STIFFNESS_WORD_EDITS) {
    if (e.field === 'mains' || e.field === 'crosses') {
      const h = hybrids.find((x) => x.id === e.id);
      assert(!!h, `hybrid ${e.id}`);
      assert(h![e.field].shapeFeelLabel === e.from, `${e.id} ${e.field} is "${e.from}"`);
      h![e.field].shapeFeelLabel = e.to;
    } else if (e.field === 'note') {
      const p = pairings.find((x) => x.itemId === e.id && x.racquetId === e.racquet);
      assert(!!p, `pairing ${e.id}/${e.racquet}`);
      p!.note = applyOnce(p!.note, e);
      texts.add(`${e.id}/note/${e.racquet}`);
      items.add(e.id);
    } else {
      const s = strings.find((x) => x.id === e.id);
      assert(!!s, `string ${e.id}`);
      s![e.field] = applyOnce(s![e.field] as string, e);
      texts.add(`${e.id}/${e.field}`);
      items.add(e.id);
    }
  }
  const labels = STIFFNESS_WORD_EDITS.filter((e) => e.field === 'mains' || e.field === 'crosses');
  assert(
    texts.size === 23 && items.size === 11,
    `23 texts in 11 strings (got ${texts.size} in ${items.size})`,
  );
  assert(labels.length === 14, '14 hybrid side labels');
  assert(STIFFNESS_WORD_EDITS.length === 38, "38 edits (Strike's Regna note takes two)");

  // The labels now name their string's band (validate.ts checks the same: hybrid-side-band).
  for (const h of hybrids) {
    for (const s of [h.mains, h.crosses]) {
      if (!s.stringId) continue;
      const str = strings.find((x) => x.id === s.stringId) as unknown as {
        stiffness: Parameters<typeof stiffnessBand>[0];
      };
      const word = s.shapeFeelLabel.split(' · ')[1];
      assert(
        word === stiffnessBand(str.stiffness),
        `${h.id}: "${s.shapeFeelLabel}" names its string's band`,
      );
    }
  }

  if (process.argv.includes('--sample')) {
    const show = (title: string, was: string, now: string): void =>
      console.log(`${title}\n  was: ${was}\n  now: ${now}\n`);
    const [s0, h0, p0] = JSON.parse(before) as [Rec[], typeof hybrids, Pairing[]];
    const str = (list: Rec[], id: string) => list.find((x) => x.id === id)!;
    show(
      'Poly Tour Rev, feel summary',
      str(s0, 'yonex-poly-tour-rev').feelSummary as string,
      str(strings, 'yonex-poly-tour-rev').feelSummary as string,
    );
    const pn = (list: Pairing[], id: string, r: string) =>
      list.find((x) => x.itemId === id && x.racquetId === r)!.note;
    show(
      'Tour M8, Regna note',
      pn(p0, 'grapplesnake-tour-m8', 'regna'),
      pn(pairings, 'grapplesnake-tour-m8', 'regna'),
    );
    show(
      'Poly Tour Strike, Regna note',
      pn(p0, 'yonex-poly-tour-strike', 'regna'),
      pn(pairings, 'yonex-poly-tour-strike', 'regna'),
    );
    show(
      'Poly Tour Drive, feel summary',
      str(s0, 'yonex-poly-tour-drive').feelSummary as string,
      str(strings, 'yonex-poly-tour-drive').feelSummary as string,
    );
    show('K-Pop mains label', h0[0]!.mains.shapeFeelLabel, hybrids[0]!.mains.shapeFeelLabel);
    console.log(
      "Checks passed: 38 edits, 23 texts in 11 strings, 14 hybrid labels, each text found exactly once; every linked label names its string's band. Nothing written.",
    );
  } else {
    write('strings.json', strings);
    write('hybrids.json', hybrids);
    write('pairings.json', pairings);
    console.log('Edited 23 texts in 11 strings and 14 hybrid side labels.');
  }
}

if (process.argv[1] && relative(process.argv[1], fileURLToPath(import.meta.url)) === '') {
  main();
}
