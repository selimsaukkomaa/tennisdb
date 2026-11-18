# Phase 2: a normalized data model (proposal)

**Status:** decided with the owner on 2026-11-04 (D1–D9); the order of work is
in D10. Nothing here is implemented yet; the data is unchanged since v0.990.

Phase 1 kept `TENNIS_DB` verbatim, so the data stores what the page shows:
`"Firm · 1.10"`, `"22–24"`, `"100 sq in"`, bar widths set by hand. Every
consumer has to parse those strings back into values; the validators already
do, and a native SwiftUI app would have to as well. Phase 2 stores raw values
with their provenance and derives the display strings in `src/core`.

## Ground rules

- Display strings are derived, not stored, except where the text is a
  judgement: notes, summaries, and (for now) rating labels.
- The migration is a script with asserted match counts, run on a sample batch
  first.
- After each step the app renders identically, except for differences
  declared in the parity suite and listed in the changelog. Decisions that
  change what the page shows say so.
- Label and note changes follow the content rules: approval first, a sample
  batch of about five, corrections never silent.

## Decisions

### D1. How stiffness is stored

Today: `stiffness: { label: "Firm · 1.10", width: 88 }`. 62 of 72 strings
carry a figure: 15 approximate (`~`), 5 ranges (stored as their midpoint for
any rule). 10 carry only a band: Vamos, Cash, A5 Infrared, Truffle X, O-Toro
Snap Tour Flex, Confidential Soft, Vanquish (Multi), Poly Tour Force, Tour
Super 850 (Multi), Tour Mako Short Fin. Hybrids carry only bands.

Proposal:

```ts
stiffness: {
  kgPerMm: number | { min: number; max: number } | null;
  approx: boolean;
  source: 'legacy' | 'Racketpedia' | 'manufacturer' | 'review';
  retrieved: string | null; // 'YYYY-MM'
  inferredBand?: Band;      // only when kgPerMm is null
}
```

Open question: the provenance of the 62 legacy figures. Only 7 notes name
Racketpedia; 48 state the figure without a source and 7 don't mention it. The
v0.989 changelog calls the carried-over figures "Racketpedia numbers".

- **a.** Mark all 62 `source: 'legacy'`, `retrieved: null`, and list them for
  re-verification. Records what is known and nothing more. *(recommended)*
- **b.** Mark all 62 `source: 'Racketpedia'`, `retrieved: null`.

**Decision (2026-11-04): a.** The 62 figures are `source: 'legacy'`,
`retrieved: null`, and the migration lists them for re-verification; a later
check upgrades each to a named source and date. The 10 without a figure carry
their current band as `inferredBand`. Confirmed after noting that every brand
footer says "Stiffness (kg/mm) from Racketpedia lab testing": that is a claim
about a whole brand, not a per-figure source, and there are no retrieval dates.

**Done in v0.998, with the shape refined:** the figure is its own nested
object, so its provenance travels with it and a string without a figure
carries none:

```ts
stiffness: {
  band: Band;                // stored until D2 derives it from the figure
  figure: {
    kgPerMm: number | { min: number; max: number };
    approx: boolean;
    source: 'legacy' | 'Racketpedia' | 'manufacturer' | 'review';
    retrieved: string | null; // 'YYYY-MM'; null exactly when source is 'legacy'
  } | null;                  // null for the 10 strings without a figure
  width: number;             // stored until D3 derives it
}
```

Hybrids store `{ band, width }` only: a hybrid's stiffness is a judgement of
the bed, never a lab figure. The stored band of a string without a figure is
what the sketch called `inferredBand`. `stiffnessLabel()` in
`src/core/stiffness.ts` prints the same label as before.

**Re-checked in v1.5** (step 4) against Racketpedia, read on 2026-11-18 from
its brand listings: 30 figures confirmed and 4 adopted, now `source:
"Racketpedia"` with the pages (colour and gauge) they come from. For 20 the
reading disagrees; Tennis Warehouse University's impact tests, a different
measure that can only rank, were the tie-breaker. Our figure stays, still
`legacy`, and Racketpedia's reading is kept in `stiffness.disputed` and the
changelog, not in the notes (the owner's call). 15 strings are not on
Racketpedia and 3 entries could not be told apart.

### D2. The stiffness-label rule

Labels derived from the figure (range midpoint) with fixed thresholds; "Med"
folds into "Medium":

| Very Soft | Soft | Med-Soft | Medium | Med-Firm | Firm | Very Firm |
|---|---|---|---|---|---|---|
| < 0.70 | 0.70–0.84 | 0.85–0.91 | 0.92–0.97 | 0.98–1.04 | 1.05–1.09 | ≥ 1.10 |

Effect: 32 of the 62 labels move, and 8 Firm/Soft chips move, all Firm → Soft:
Poly Tour Strike, Poly Tour Rev, Sync, Tour M8, Paradox Pro, ALU Power Feel,
4G Soft, Big Hitter Silver Rough. It settles the cases v0.990 listed: O-Toro
and Toro Toro (both 0.95) become Medium; Sync (0.85–0.95) becomes Med-Soft.
Poly Tour Pro moves Med-Firm → Firm at 1.05; its source conflict stays flagged.
Bands without a figure keep their stored band. Row by row: Appendix A.

- **a.** Apply the rule; labels are derived from then on. Notes that use the
  old band word get a sample-first content pass. *(recommended)*
- **b.** Keep labels as stored judgements; the validator warns when one
  disagrees with its figure.
- **c.** Other thresholds. The set tuned to move the fewest labels still moves
  25, with irregular bands.

**Decision (2026-11-04): a.** Labels are derived by the rule. Of the 32 moves,
22 go one step softer, 7 one step firmer and 3 two steps softer. It ships as
its own release with declared differences. Up to 51 texts in 17 of the moved
rows use the old band word (many as plain description, e.g. "firm feel"); they
get a separate notes pass, starting with a sample of five.

**Done in v1.1**, with the 32 moves above, Vamos's "Med" folded into
"Medium", and the 8 chips. A string with a figure stores no band:
`bandFor()` in `src/core/stiffness.ts` derives it. The 10 strings without a
figure store their band as an estimate, and the hybrids their judgement; the
schema allows a stored band exactly when there is no figure. The bar width is
still stored until D3. The hybrids' side labels ("Hexagonal · Firm") were left
as written, by the owner's decision on 2026-11-17: 14 of them name a band
word their string no longer has (8 already did), for the notes pass.

**Notes pass done in v1.2**, approved on 2026-11-18 after a sample of five. Of
the 51 texts the word count found, most stay true (a Very Firm string is
firm) or describe the strung bed in a given frame. 23 texts in 11 strings
changed: a word naming the string's own band that is now wrong, or a
firm-side word on one of the 8 strings moved to Soft; only those words, the
rest verbatim. Each hybrid side label now names its string's band (14
labels), and validate.ts keeps it so (hybrid-side-band).

### D3. Bar scale

Bar widths are set by hand, relative within each brand: 1.05 kg/mm is drawn
at 78, 82, 88 and 92, and 8 figures are drawn at more than one width.

- **a.** Derive stiffness bars from kg/mm on one scale for every brand, so bars
  compare across brands. Most bars change; before/after screenshots first.
- **b.** Keep the hand-set widths, stored as they are.

**Decision (2026-11-04): a, with a narrower range.** One scale for every
brand: 0.55 kg/mm = 10%, 1.15 kg/mm = 100%, linear, so the usual 0.85–1.10
strings still spread out within a brand. Only Tour Mako (0.45) falls outside
and is drawn at the 4% minimum. Strings without a figure are drawn at their
band's midpoint (Very Soft 0.65, Soft 0.78, Med-Soft 0.88, Medium 0.95,
Med-Firm 1.01, Firm 1.07, Very Firm 1.12), an estimate. The footers' "Bars are
relative within the … lineup" needs new wording, which goes to the owner
first. Compared before deciding: today, 0.40–1.20, and 0.55–1.15, on the
Toroline, Yonex and Luxilon tables.

**Done in v1.3**, approved on 2026-11-18 after a preview: footer wording A, and
hybrids drawn at their band's midpoint like the strings without a figure.
`stiffnessWidth()` in `src/core/stiffness.ts` derives every bar (rounded in
exact arithmetic, a half up); no width is stored. 68 of the 72 string bars and
all 10 hybrid bars changed. Each footer's "Bars are relative within the …
lineup" now says the stiffness bars share one scale and the rating bars stay
relative within the lineup.

### D4. Racquet fields and the head-size unit

Today: `headSize: "100 sq in"`, `pattern: "16×19"`, `ra: 64`. Proposal:
`{ headSizeSqIn: 100, pattern: { mains: 16, crosses: 19 }, ra: 64 }`, with the
label and the context-line spec derived. The metric convention covers kg, mm
and kg/mm; head size is quoted in sq in across the industry.

- **a.** Store and show sq in. *(recommended: the unit printed on frames)*
- **b.** Store and show cm² (100 sq in = 645 cm²).
- **c.** Store cm², show both.

**Decision (2026-11-04): a.** `headSizeSqIn`, shown as today ("100 sq in"). The
unit printed on frames and spec sheets; an exception to the metric rule, which
covers kg, mm and kg/mm.

**Done in v0.997.** `headSizeSqIn` and `pattern: { mains, crosses }` are
stored; the `label` field is gone, derived as brand plus model (it was exactly
that in all three records). `racquetLabel()` and `racquetSpec()` in
`src/core/labels.ts` print the same text as before. A racquet whose display
name isn't brand plus model would need a stored label again.

### D5. Rating vocabulary

Power, spin, control and comfort (and grip tackiness, absorption, durability)
are a hand-set label plus a hand-set width. The words drift: comfort uses
Low-Mod, Med-Low, Moderate and Medium; spin has both Mod-High and Med-High, and
"High (Slice)"; widths overlap between labels (spin Moderate 55–65, Medium
55–60).

- **a.** Store `{ score, label }` now, with each label checked against an
  ordered per-axis list; unify the words in a later content pass.
  *(recommended)*
- **b.** Unify the vocabulary as part of Phase 2.
- **c.** Derive labels from scores (needs b first).

**Decision (2026-11-04): a.** Ratings become `{ score, label }` with each label
checked against an ordered per-axis list of today's words. Unifying the words
is a later content pass of its own, starting with a sample of five.

**Done in v0.999.** All 458 ratings are `{ score, label }`; the score is the
number that was the bar's width. The word lists are in `src/core/ratings.ts`,
one per axis: strings and hybrids share power and spin, the grips have their
three, and the gut pairings have their own, because they say "Med" where the
strings say "Medium" and sit higher on the scale. Near-synonyms ("Medium" and
"Moderate", "Mod-High" and "Med-High") are placed by the lowest score each is
used at, which is provisional until the word pass. The schema checks the word;
the `rating-order` rule checks that a word's lowest score never falls below
that of the word before it. `ratingBar()` gives the views the same bar as
before.

### D6. Tension

Strings: 212 ranges (`"22–24"`), 2 maximums (`"max 16"`), 2 prestretch
(`"25 (5% PS)"`). Hybrids and gut: 51 mains/crosses splits (`"23/24"`).
Proposal, a discriminated union: `range { minKg, maxKg }`, `max { maxKg }`,
`prestretch { kg, pct }`, `split { mainsKg, crossesKg }`. Displays stay
identical.

**Decision (2026-11-04):** as proposed.

**Done in v0.995.** The prestretch field is `prestretchPct`. Strings take a
range, a maximum or a prestretch, hybrids and gut pairings a split; the schemas
enforce both. `tensionLabel()` in `src/core/pairings.ts` prints the same text
as before.

### D7. Pairings as records

Today each string and hybrid holds `perRacquet: { regna: { tension, note } }`,
and gut pairings are keyed by racquet. Proposal: one list of
`{ itemId, itemKind: 'string' | 'hybrid' | 'gut', racquetId, tension, note }`;
hybrid mains and crosses link to strings by id. A fourth racquet is then a
racquet record plus its pairings. Displays stay identical.

**Decision (2026-11-04):** as proposed.

**Done in v0.995, with one adjustment:** gut pairings did not join the
pairings list. Four gut combinations appear in more than one racquet, but their
feel and bars differ every time, so each gut pairing already is a
racquet-specific pairing; it stays one record, with a `racquetId`, in
`gutHybrids.json` (now a flat list). `pairings.json` holds the 246 string and
hybrid pairings (`itemKind: 'string' | 'hybrid'`). Since v0.996 each hybrid's
mains and crosses carry a `stringId`, from a table the owner approved: "O-Toro
Snap TF" is O-Toro Snap Tour Flex, and "Wasabi X" stays unlinked (`null`),
because it isn't in the data.

### D8. Feel: computed vs stored

- Computed: Firm/Soft from the band (so D2 moves the 8 chips), Crisp from the
  tags and summary, and each tag's colour from a label → colour table. The
  table makes "one label, one colour" hold by construction, which also fixes
  the grip tags that use two colours for one label (a visible change).
- Stored and validated: Plush and Lively (v0.990's rules as minimum
  conditions), the hybrids' judgements, grip feel tokens.

**Decision (2026-11-04):** as proposed. The single colour for each grip label
(Tacky, Firm, Classic, Dry) goes to the owner with screenshots before it ships.

**Firm/Soft done in v1.1:** derived from the band (`feelTokens()` in
`src/core/stiffness.ts`), so `feelAttr` stores only Crisp, Plush and Lively
and the firm-xor-soft and firm-soft-band rules hold by construction. Crisp is
still stored and checked against the tags (crisp-tag); the tag colours come
with the grip-tag release.

**Tag colours done in v1.4**, approved on 2026-11-18 (scheme A, after
screenshots): a tag stores its label and the colour comes from a table in
`src/core/tags.ts`, so one label has one colour by construction. Strings and
hybrids use v0.990's table; grips have their own, each label in the colour
most grips already used, which changed five grip tags (Forte's Firm, Kimony
Tourna's and Tourna Grip Original's Classic, Dry Grap's Dry, Tac's Tacky).
The schema allows only a table's labels, which retired the tag-variant rule.

### D9. Schemas and plain-text notes

A Zod schema per collection (racquets, brands, strings, hybrids, pairings,
grips, gut strings, copy, log), exported as JSON Schema for a future Swift
`Codable` model. The validators become schema refinements. Notes become plain
text (none contains markup today); the one grip spec with HTML
(`<em>Made in USA</em>`) becomes `{ text, emphasis }`.

**Decision (2026-11-04):** as proposed.

**Done in v0.994 (schemas):** the schemas own the shape, written so it all
exports to JSON Schema (types, patterns, enums). Content and cross-record
rules stay in `validate.ts` rather than becoming refinements, because JSON
Schema can't carry code. Plain-text notes and the structured grip spec come in
step 2.

**Done in v1.0 (plain text):** the one grip spec with markup is
`{ text: "Made in USA", emphasis: true }`, and all 73 specs take that shape so
every reader handles one. No note held markup, so no note changed; the views
now escape notes like any other text. The `plain-text` rule keeps tags and
entities out of every string in `data/`. The copy in `content/` stays HTML.

### D10. Order of work

Each step is its own release, and each stops for the owner's review.

1. **Schemas over today's data** (D9), nothing changed: Zod schemas, JSON
   Schema export, the shape checks moved into the schemas. *Done in v0.994.*
2. **Moves that render identically**, each checked by the parity suite with no
   new declared difference: tension (D6) and pairings (D7), *done in v0.995*;
   hybrid sides linked by id (D7), *done in v0.996*; racquet fields (D4),
   *done in v0.997*;
   stiffness storage with `source: 'legacy'` (D1), *done in v0.998*; ratings as
   `{ score, label }` (D5), *done in v0.999*; plain-text notes and the
   structured grip spec (D9), *done in v1.0* (the owner's call on
   2026-11-16: v0.999 was the last number of the old scheme). Step 2 is
   complete.
   The migration script asserts every count and runs on a sample first.
3. **Visible changes**, one release each, with declared differences:
   - stiffness labels and the 8 Firm/Soft chips (D2, D8), *done in v1.1*;
   - the notes that use an old band word, sample of five first (D2), *done in
     v1.2*;
   - the bar scale and the footers' new wording (D3), *done in v1.3*;
   - one colour per grip tag label, with screenshots first (D8), *done in v1.4*.
   Step 3 is complete.
4. **Later, separately:** re-verifying the 62 legacy figures (D1), *done in
   v1.5*, and unifying the rating words (D5).

Out of scope, as before: the feel taxonomy (Medium band, damping axis,
Bite/Snapback chip), the Poly Tour Pro and Eco Power conflicts, the grip Thin
chip.

## Appendix A: the stiffness rule, row by row

Rows in data order. **Moves** marks a label the rule changes; **Chip** marks a
Firm/Soft chip that moves with it. Strings without a figure keep their band.

| String | Brand | Figure (kg/mm) | Label now | By the rule | Moves | Chip |
|---|---|---|---|---|---|---|
| O-Toro Tour | Toroline | 1.10 | Firm | Very Firm | yes |  |
| Caviar | Toroline | 1.00 | Med-Firm | Med-Firm |  |  |
| Vamos | Toroline | — | Med | (no figure) | | |
| Cash | Toroline | — | Med-Firm | (no figure) | | |
| A5 | Toroline | 0.90 | Med | Med-Soft | yes |  |
| A5 Infrared | Toroline | — | Med-Soft | (no figure) | | |
| O-Toro | Toroline | 0.95 | Med-Soft | Medium | yes |  |
| O-Toro Octa | Toroline | ~1.10 | Firm | Very Firm | yes |  |
| O-Toro Spin | Toroline | ~0.95 | Medium | Medium |  |  |
| O-Toro Snap | Toroline | ~0.95 | Medium | Medium |  |  |
| Wasabi | Toroline | 0.95–1.00 | Medium | Medium |  |  |
| Toro Toro | Toroline | 0.95 | Medium | Medium |  |  |
| Enso Pro (Carbon) | Toroline | 0.90 | Med-Soft | Med-Soft |  |  |
| Snapper | Toroline | 0.85 | Soft | Med-Soft | yes |  |
| Super Toro | Toroline | 0.90 | Med-Soft | Med-Soft |  |  |
| Truffle X | Toroline | — | Very Soft | (no figure) | | |
| O-Toro Snap Tour Flex | Toroline | — | Med-Firm | (no figure) | | |
| Tour Bite | Solinco | 1.12 | Firm | Very Firm | yes |  |
| Confidential | Solinco | 1.00 | Med-Firm | Med-Firm |  |  |
| Confidential Soft | Solinco | — | Medium | (no figure) | | |
| Hyper-G | Solinco | 1.10 | Firm | Very Firm | yes |  |
| Mach-10 | Solinco | 0.85 | Med-Soft | Med-Soft |  |  |
| Tour Bite Soft | Solinco | 0.85 | Med-Soft | Med-Soft |  |  |
| Hyper-G Soft | Solinco | 0.95 | Medium | Medium |  |  |
| Revolution | Solinco | ~1.00 | Med-Firm | Med-Firm |  |  |
| TB Diamond Rough | Solinco | ~0.95 | Medium | Medium |  |  |
| Hyper-G Round | Solinco | ~0.95 | Medium | Medium |  |  |
| Barb Wire | Solinco | ~0.95 | Medium | Medium |  |  |
| Outlast | Solinco | ~0.90 | Med-Soft | Med-Soft |  |  |
| Vanquish (Multi) | Solinco | — | Soft | (no figure) | | |
| Poly Tour Spin | Yonex | 1.08 | Firm | Firm |  |  |
| Poly Tour Strike | Yonex | 0.92 | Med-Firm | Medium | yes | Firm → Soft |
| Poly Tour Pro | Yonex | 1.05 | Med-Firm | Firm | yes |  |
| Poly Tour Rev | Yonex | 0.85–0.95 | Med-Firm | Med-Soft | yes | Firm → Soft |
| Poly Tour Drive | Yonex | ~0.90 | Medium | Med-Soft | yes |  |
| Poly Tour Force | Yonex | — | Med-Firm | (no figure) | | |
| Poly Tour Fire | Yonex | 0.80 | Medium | Soft | yes |  |
| Poly Tour Air | Yonex | 0.72 | Soft | Soft |  |  |
| Poly Tour Tough | Yonex | 0.77 | Med-Soft | Soft | yes |  |
| Tour Super 850 (Multi) | Yonex | — | Soft | (no figure) | | |
| Vivo | ReString | 1.05 | Firm | Firm |  |  |
| Sync | ReString | 0.85–0.95 | Med-Firm | Med-Soft | yes | Firm → Soft |
| Zero | ReString | 1.05–1.10 | Firm | Firm |  |  |
| SLAP (Ltd. Edition) | ReString | ~0.95 | Medium | Medium |  |  |
| Tour Sniper | Grapplesnake | 1.05 | Firm | Firm |  |  |
| Soldier | Grapplesnake | ~1.00 | Firm | Med-Firm | yes |  |
| Tour M8 | Grapplesnake | 0.90–0.95 | Med-Firm | Medium | yes | Firm → Soft |
| Alpha | Grapplesnake | 0.90 | Medium | Med-Soft | yes |  |
| Aspera Triplum | Grapplesnake | ~0.85 | Med-Soft | Med-Soft |  |  |
| Game Changer | Grapplesnake | ~0.90 | Medium | Med-Soft | yes |  |
| Paradox Pro | Grapplesnake | ~0.95 | Med-Firm | Medium | yes | Firm → Soft |
| Tour Mako | Grapplesnake | 0.45 | Very Soft | Very Soft |  |  |
| Tour Mako Short Fin | Grapplesnake | — | Med-Firm | (no figure) | | |
| Irukandji | Grapplesnake | ~0.85 | Medium | Med-Soft | yes |  |
| ALU Power | Luxilon | 1.05 | Firm | Firm |  |  |
| ALU Power Rough | Luxilon | 1.05 | Firm | Firm |  |  |
| ALU Power Soft | Luxilon | 0.85 | Med | Med-Soft | yes |  |
| ALU Power Spin | Luxilon | 1.00 | Firm | Med-Firm | yes |  |
| ALU Power Feel | Luxilon | 0.95 | Med-Firm | Medium | yes | Firm → Soft |
| 4G | Luxilon | 1.10 | Very Firm | Very Firm |  |  |
| 4G Rough | Luxilon | 1.10 | Very Firm | Very Firm |  |  |
| 4G Soft | Luxilon | 0.95 | Med-Firm | Medium | yes | Firm → Soft |
| Element | Luxilon | 0.85 | Med | Med-Soft | yes |  |
| Adrenaline | Luxilon | 1.00 | Firm | Med-Firm | yes |  |
| M2 Pro | Luxilon | 0.85 | Med | Med-Soft | yes |  |
| Eco Power | Luxilon | 1.00 | Med-Firm | Med-Firm |  |  |
| Big Hitter Black 7 | Tourna | 1.00 | Firm | Med-Firm | yes |  |
| Big Hitter Blue Rough | Tourna | 1.05 | Firm | Firm |  |  |
| Big Hitter Silver Rough | Tourna | 0.92 | Med-Firm | Medium | yes | Firm → Soft |
| Pro 16 | Tourna | 0.98 | Firm | Med-Firm | yes |  |
| Quasi-Gut Armor | Tourna | 0.65 | Soft | Very Soft | yes |  |
| Pro Tour | Tourna | 0.55 | Soft | Very Soft | yes |  |
