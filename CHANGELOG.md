# Strung — Changelog

Strung was the Tennis Equipment Database (EquipDB) until v0.993. Releases up to
v0.990 shipped as a single HTML file. Their changelogs are in `legacy/`
(`tennis_equipmentdb_changelog_v0_989.md`, `…_v0_990.md`).

---

# v1.2 — Stiffness words in the notes

**Date:** 2026-11-18
**Base:** v1.1 (stiffness bands by rule)
**Status:** content release. Phase 2 step 3, second release
(`docs/phase-2-data-model.md`, D2): the texts that still used a stiffness word
v1.1's bands no longer support, and the hybrids' side labels. Approved by the
owner on 2026-11-18 after a sample of five. Each edit changes only the
stiffness words; the rest of every text is verbatim. `TENNIS_DB.version` stays
`0.990`.

---

## Scope

v1.1 counted 51 texts in 17 moved rows that use their old band word. Read one
by one, most stay true and are unchanged:

- "firm" on a string now Very Firm or Med-Firm, "soft" on one now Very Soft or
  Med-Soft: still the right side and still accurate;
- descriptions of the strung bed in a given frame ("the extra crosses firm up
  the 0.90 stiffness into a medium bed");
- relative claims backed by the figures ("softer and more elastic than Tour")
  and quotes (Yonex's "comfortably firm").

What changed: **23 texts in 11 strings**, where a word named the string's own
band and is now wrong ("medium-firm" on a string now Medium or Med-Soft), or a
firm-side word sat on one of the 8 strings v1.1 moved to Soft; and **14 hybrid
side labels**, whose stiffness word now names the band of the string they link
to.

## Texts (23, in 24 edits)

| String | Text | Was | Now |
|---|---|---|---|
| Poly Tour Strike | feel text | with a firm, penetrating response | with a penetrating response |
| Poly Tour Strike | note, Regna 100 | 0.92 kg/mm: firm, penetrating | 0.92 kg/mm: penetrating |
| Poly Tour Strike | note, Regna 100 | Full bed in the 64 RA frame is firm and clear without being sharp | Full bed in the 64 RA frame: medium stiffness, clear without being sharp |
| Poly Tour Strike | note, Pro Tour 630 | plays mid-firm and stable | plays medium and stable |
| Poly Tour Rev | feel summary | Firm but dampened | Octagonal, damped |
| Poly Tour Rev | feel text | Stiff stringbed | Medium-soft stringbed |
| Sync | note, Pro Tour 630 | softening the string's firmness | softening the string's stiffness |
| Tour M8 | feel summary | Octagonal, medium-firm | Octagonal, medium stiffness |
| Tour M8 | note, Regna 100 | frame: medium-firm, good pocketing | frame: medium stiffness, good pocketing |
| Tour M8 | note, Percept 100D | Medium-firm stiffness through the extra crosses | Medium stiffness through the extra crosses |
| Paradox Pro | feel text | with firm, traditional feel | with a solid, traditional feel |
| Paradox Pro | note, Regna 100 | frame: medium-firm, low launch | frame: medium stiffness, low launch |
| Paradox Pro | note, Pro Tour 630 | softens the metal-infused firmness | softens the metal-infused string |
| ALU Power Feel | note, Pro Tour 630 | Medium-firm bed in the 58 RA frame | Medium bed in the 58 RA frame |
| 4G Soft | note, Regna 100 | frame: medium-firm, more dwell | frame: medium stiffness, more dwell |
| 4G Soft | note, Percept 100D | Medium-firm round poly | Medium-stiffness round poly |
| Big Hitter Silver Rough | note, Regna 100 | frame: medium-firm, more dwell | frame: medium stiffness, more dwell |
| Poly Tour Drive | feel summary | Pentagonal, medium-firm | Pentagonal, medium-soft |
| Poly Tour Drive | feel text | Medium-firm pentagonal co-poly | Medium-soft pentagonal co-poly |
| Poly Tour Drive | note, Regna 100 | moderate pocketing, medium-firm feedback that stays clear | moderate pocketing, feedback that stays clear |
| Poly Tour Drive | note, Percept 100D | the string's medium stiffness | the string's medium-soft stiffness |
| Poly Tour Drive | note, Pro Tour 630 | Shaped, medium-firm and inexpensive | Shaped, medium-soft and inexpensive |
| Poly Tour Tough | feel summary | Low-powered, firm | Low-powered, muted |
| Game Changer | note, Regna 100 | medium stiffness, more launch | medium-soft stiffness, more launch |

## Hybrid side labels (14)

| Hybrid | Side | Was | Now |
|---|---|---|---|
| K-Pop | mains (Wasabi) | Square · Firm | Square · Medium |
| K-Pop Spin | mains (O-Toro Spin) | Pentagonal · Med | Pentagonal · Medium |
| K-Pop Spin | crosses (O-Toro) | Hexagonal · Med-Soft | Hexagonal · Medium |
| Dreddy | mains (O-Toro Tour) | Hexagonal · Firm | Hexagonal · Very Firm |
| Dreddy | crosses (O-Toro Snap) | Round · Soft | Round · Medium |
| Stevie | mains (O-Toro Tour) | Hexagonal · Firm | Hexagonal · Very Firm |
| 101 | mains (O-Toro) | Hexagonal · Med-Soft | Hexagonal · Medium |
| 101 | crosses (O-Toro Snap) | Round · Soft | Round · Medium |
| O-Snap | mains (O-Toro) | Hexagonal · Med-Soft | Hexagonal · Medium |
| Wasabi Pro | mains (Wasabi) | Square · Firm | Square · Medium |
| What The Hybrid | mains (Wasabi) | Square · Firm | Square · Medium |
| What The Hybrid | crosses (Toro Toro) | Hexagonal · Med-Soft | Hexagonal · Medium |
| Snapaholic | mains (Snapper) | Octagonal · Firm | Octagonal · Med-Soft |
| Cole | mains (O-Toro Tour 1.23 Mint) | Hexagonal · Firm | Hexagonal · Very Firm |

Wasabi Pro's crosses (Wasabi X) has no record and keeps "Round · Med-Soft".
The new rule `hybrid-side-band` keeps every linked label's word equal to its
string's band, so a future change to a figure flags the labels it affects.

`scripts/stiffness-words.ts` (one-off) holds the edits and ran on a sample
batch first (the five the owner saw). Before writing, it asserts that each
edit's text occurs exactly once where it is listed, 23 texts in 11 strings, 14
labels, and that every linked label then names its string's band.

## Declared differences from v0.990 (added in v1.2)

| Difference | Visible? | Legacy patch |
|---|---|---|
| The 23 texts and 14 labels above | yes | G: `V0990_TEXT_EDITS` applies the same edits (`STIFFNESS_WORD_EDITS`) to legacy's data, each text found exactly once, and swaps the old text for the new in the cells already on the page (a feel text and a side label in each racquet's row, a note in its racquet's row). Compare reads the data |

`tests/data/legacy-roundtrip.test.ts` applies the same edits to the v0.990
blob, after v1.1's rule.

---

## Data corrections

Two feel summaries were already at odds with their band in v1.0, before v1.1's
rule:

- **Poly Tour Drive:** "Pentagonal, medium-firm" on a Medium string with the
  Soft chip; now "Pentagonal, medium-soft" (Med-Soft since v1.1). Its feel
  text and three notes said "medium-firm" too.
- **Poly Tour Tough:** "Low-powered, firm" on a Med-Soft string with the Soft
  chip; now "Low-powered, muted", the word its Regna note uses ("muted rather
  than soft").

No note carries a parenthetical for these: the owner's call for this pass is
that the changelog lists each change, before and after.

## Flags left open

Unchanged since v0.989 (listed under v0.991), plus one stated here: Poly Tour
Rev's Regna note says "Firmer than Pro", which the figures contradict (Rev
0.85–0.95, Pro 1.05). It reports feel, and it is the same conflict Poly Tour
Pro's note already flags ("flagged, not resolved"); left as written.

## Verification

`npm run check` passes: 341 Vitest tests (339 in v1.1), 60 Playwright tests.

- **New tests, 2:** `hybrid-side-band` fires on a side label naming the wrong
  band, and on a figure change that moves a linked string's band.
- **Against v0.990:** with v1.1's rule and these edits applied to the blob, the
  data equals v0.990's value for value and serialises to the same length.
- **Parity:** all 15 pixel views and 25 DOM scenarios pass. Without patch G,
  25 DOM scenarios and the desktop "filters open, Hex active" view fail.

## File size

| | v1.1 | v1.2 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 454,826 | 454,870 | +0.0 KB |
| gzip | 103,314 | 103,312 | 0.0 KB |

## Still open

Unchanged from v1.1, except:

- **Closed:** the texts that use an old band word, and the hybrid side labels.
- The wording these edits left alone is unchanged, including the ranking-style
  phrases already listed (Strike's "Best tension maintenance in the Yonex
  lineup").

Next in Phase 2 step 3: the bar scale and the footers' new wording (D3), the
wording to the owner first; then one colour per grip tag label (D8), with
screenshots first.

---

# v1.1 — Stiffness bands by rule

**Date:** 2026-11-17
**Base:** v1.0 (plain-text data)
**Status:** visible release. Phase 2 step 3, first release
(`docs/phase-2-data-model.md`, D2 and the Firm/Soft part of D8): a string's
stiffness band is derived from its lab figure by fixed thresholds, and the
Firm/Soft feel chip from the band. 33 stiffness labels change and 8 strings
move from the Firm chip to the Soft one. The owner approved the full list on
2026-11-17 after a preview with screenshots. No note content changed;
`TENNIS_DB.version` stays `0.990`.

---

## The rule

| Very Soft | Soft | Med-Soft | Medium | Med-Firm | Firm | Very Firm |
|---|---|---|---|---|---|---|
| < 0.70 | 0.70–0.84 | 0.85–0.91 | 0.92–0.97 | 0.98–1.04 | 1.05–1.09 | ≥ 1.10 |

On the figure in kg/mm, or a range's midpoint. "Med" folds into "Medium".
Med-Firm and firmer carry the Firm chip, Medium and softer the Soft one, as
in v0.990.

- **62 strings with a figure** store no band any more: `bandFor()` in
  `src/core/stiffness.ts` derives it.
- **10 strings without a figure** store their band as an estimate, and the
  hybrids store theirs as a judgement of the bed. Only Vamos changes: "Med"
  becomes "Medium".
- **Firm/Soft** is no longer stored in `feelAttr`, which now holds Crisp,
  Plush and Lively only (25 rows hold none); `feelTokens()` adds Firm or Soft
  from the band, in v0.990's place, after Crisp.
- **Bar widths** are unchanged until D3, so a bar can sit out of step with its
  new label until then (ALU Power Soft reads Med-Soft on its old bar).

## Labels that change (33)

| String | Brand | Was | Now | Chip |
|---|---|---|---|---|
| O-Toro Tour | Toroline | Firm · 1.10 | Very Firm · 1.10 | |
| Vamos | Toroline | Med | Medium | |
| A5 | Toroline | Med · 0.90 | Med-Soft · 0.90 | |
| O-Toro | Toroline | Med-Soft · 0.95 | Medium · 0.95 | |
| O-Toro Octa | Toroline | Firm · ~1.10 | Very Firm · ~1.10 | |
| Snapper | Toroline | Soft · 0.85 | Med-Soft · 0.85 | |
| Tour Bite | Solinco | Firm · 1.12 | Very Firm · 1.12 | |
| Hyper-G | Solinco | Firm · 1.10 | Very Firm · 1.10 | |
| Poly Tour Strike | Yonex | Med-Firm · 0.92 | Medium · 0.92 | Firm → Soft |
| Poly Tour Pro | Yonex | Med-Firm · 1.05 | Firm · 1.05 | |
| Poly Tour Rev | Yonex | Med-Firm · 0.85–0.95 | Med-Soft · 0.85–0.95 | Firm → Soft |
| Poly Tour Drive | Yonex | Medium · ~0.90 | Med-Soft · ~0.90 | |
| Poly Tour Fire | Yonex | Medium · 0.80 | Soft · 0.80 | |
| Poly Tour Tough | Yonex | Med-Soft · 0.77 | Soft · 0.77 | |
| Sync | ReString | Med-Firm · 0.85–0.95 | Med-Soft · 0.85–0.95 | Firm → Soft |
| Soldier | Grapplesnake | Firm · ~1.00 | Med-Firm · ~1.00 | |
| Tour M8 | Grapplesnake | Med-Firm · 0.90–0.95 | Medium · 0.90–0.95 | Firm → Soft |
| Alpha | Grapplesnake | Medium · 0.90 | Med-Soft · 0.90 | |
| Game Changer | Grapplesnake | Medium · ~0.90 | Med-Soft · ~0.90 | |
| Paradox Pro | Grapplesnake | Med-Firm · ~0.95 | Medium · ~0.95 | Firm → Soft |
| Irukandji | Grapplesnake | Medium · ~0.85 | Med-Soft · ~0.85 | |
| ALU Power Soft | Luxilon | Med · 0.85 | Med-Soft · 0.85 | |
| ALU Power Spin | Luxilon | Firm · 1.00 | Med-Firm · 1.00 | |
| ALU Power Feel | Luxilon | Med-Firm · 0.95 | Medium · 0.95 | Firm → Soft |
| 4G Soft | Luxilon | Med-Firm · 0.95 | Medium · 0.95 | Firm → Soft |
| Element | Luxilon | Med · 0.85 | Med-Soft · 0.85 | |
| Adrenaline | Luxilon | Firm · 1.00 | Med-Firm · 1.00 | |
| M2 Pro | Luxilon | Med · 0.85 | Med-Soft · 0.85 | |
| Big Hitter Black 7 | Tourna | Firm · 1.00 | Med-Firm · 1.00 | |
| Big Hitter Silver Rough | Tourna | Med-Firm · 0.92 | Medium · 0.92 | Firm → Soft |
| Pro 16 | Tourna | Firm · 0.98 | Med-Firm · 0.98 | |
| Quasi-Gut Armor | Tourna | Soft · 0.65 | Very Soft · 0.65 | |
| Pro Tour | Tourna | Soft · 0.55 | Very Soft · 0.55 | |

Of the 32 moves with a figure, 22 go one step softer, 7 one step firmer and 3
two steps softer; Vamos is the fold. The Firm chip now shows 27 strings
(was 35) and Soft 45 (was 37). The hybrids' chips don't change.

`scripts/derive-stiffness-bands.ts` (one-off) ran on a sample batch first.
Before writing, it asserts exactly these moves by id, the fold and the 8
chips, that every other band and chip comes out as stored, that Firm or Soft
sat in its usual place in every `feelAttr`, and that 25 rows are left with no
stored token.

**Validation.** The schema allows a stored band exactly when there is no
figure, drops "Med", and keeps Firm and Soft out of `feelAttr`. v0.990's
`firm-xor-soft` and `firm-soft-band` rules are retired: both hold by
construction.

## Declared differences from v0.990 (added in v1.1)

| Difference | Visible? | Legacy patch |
|---|---|---|
| 33 stiffness labels (above) | yes | F: `V0990_STIFFNESS_RULE` applies the rule to legacy's own labels and data (it throws unless exactly 33 labels and 8 chips move); the 99 label cells on the page (33 × 3 racquets) and each row's `data-feel` are redrawn. Compare reads the patched data |
| 8 strings under Soft instead of Firm | in the Feel filters | F, as above |

The rule in patch F works from v0.990's labels, not from the app's code, and
`tests/data/legacy-roundtrip.test.ts` compares the data with the same change
applied to the v0.990 blob, so everything else is still checked value for
value. A new DOM scenario, "Firm chip", covers the chips.

---

## Data corrections

None. The label changes are the rule's, listed above.

## Flags left open

Unchanged since v0.989 (listed under v0.991). Poly Tour Pro moves to Firm at
1.05; its source conflict stays flagged.

## Verification

`npm run check` passes: 339 Vitest tests (317 in v1.0), 60 Playwright tests
(59 in v1.0).

- **New tests:** 20 in `tests/unit/stiffness.test.ts` (every band's lower
  bound and the value below it, range midpoints without floating-point drift,
  labels, feel tokens and their order, the 8 chips); four shapes the schema
  rejects (a stored band beside a figure, no figure and no band, "Med", a
  stored Firm token); the "Firm chip" DOM scenario. Two mutation tests retired
  with `firm-xor-soft` and `firm-soft-band`.
- **Against v0.990:** with the declared change applied to the blob, the data
  equals v0.990's value for value and serialises to the same length.
- **Parity:** all 15 pixel views and 25 DOM scenarios pass. Without patch F,
  the load and "Firm chip" DOM scenarios and the phone's default and compare
  views fail. (On the desktop pixel views the changed labels stay under the
  0.1% threshold; the DOM scenarios check every label's text.)

## File size

| | v1.0 | v1.1 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 456,362 | 454,826 | −1.5 KB (−0.3%) |
| gzip | 103,102 | 103,314 | +0.2 KB |

The data loses the 62 derived bands and 82 Firm/Soft tokens; the code adds
the rule.

## Still open

Unchanged from v1.0, except:

- **New: texts that use an old band word.** 51 texts in 17 of the moved rows
  (notes, feel summaries and feel texts) still use the old band word, some now
  at odds with their row: Poly Tour Rev's summary "Firm but dampened" sits
  under the Soft chip, Tour M8's "Octagonal, medium-firm" beside Medium. They
  are the next release, the notes pass, starting with a sample of five.
- **New: hybrid side labels.** 14 of the hybrids' side labels ("Hexagonal ·
  Firm") name a band word their string no longer has: 8 already did, 6 are
  new (O-Toro Tour's three, O-Toro's three). Left as written by the owner's
  decision, for the notes pass.

Next in Phase 2 step 3: the notes that use an old band word (D2), sample of
five first; then the bar scale and the footers' wording (D3); then one colour
per grip tag label (D8).

---

# v1.0 — Plain-text data

**Date:** 2026-11-17
**Base:** v0.999 (ratings as values)
**Status:** model release, no visible change. Phase 2 step 2, sixth and last
move (`docs/phase-2-data-model.md`, D9): nothing in `data/` is HTML any more.
The one grip spec that held markup is structured, and notes are rendered as
text. No note content changed; `TENNIS_DB.version` stays `0.990`.

The first release of the new numbering (the owner's decision, 2026-11-16):
the version tag reads v1.0. The iOS app's own version number was already 1.0.

With this, Phase 2 step 2 is complete: every move that renders identically has
shipped. Step 3, the visible changes, is next.

---

## Grip specs as values

| | Was | Now |
|---|---|---|
| Kimony Tourna, second spec | `"<em style=\"color:#d97706;\">Made in USA</em>"` | `{ text: "Made in USA", emphasis: true }` |
| Any other spec | `"29mm × 105cm"` | `{ text: "29mm × 105cm", emphasis: false }` |

- All 73 specs on the 35 grips take the same shape, `emphasis` always stated,
  so every reader handles one shape. Exactly one is emphasised.
- Tourna Tac's "Made in USA" was plain in v0.990 and stays plain.
- `specHtml()` in `src/ui/tables.ts` draws an emphasised spec in the same
  amber `<em>` as before.

## Notes as text

None of the 302 notes (246 pairing notes, 35 grip notes, 21 gut notes) held a
tag or an entity, so none changed. The string and hybrid tables and compare
injected them as HTML, as v0.990 did; they now escape them like any other
text. The grip and gut tables already did. `raw()` is left for the views' own
markup and the HTML copy in `content/copy.json`.

## Search: a markup quirk fixed

Search read the spec's inline HTML, so searching "d97706" or "style" found
Kimony Tourna. It now reads the text only. "Made in USA" still finds it. No
parity view searches for these, so the suite needs no declared difference;
`tests/unit/search.test.ts` checks both.

`scripts/migrate-specs.ts` (one-off) ran on a sample batch first (Kimony
Tourna, Hi-Soft EX, Tourna Tac). Before writing, it asserts 35 grips, 73
specs, exactly one emphasised, that every spec prints back to the string it
was, that nothing else in `grips.json` changes, and that none of the 4,066
strings in `data/` holds a tag or an entity.

**Validation.** The schema fixes the spec shape (`GripSpec`). New rule:
`plain-text`, no string anywhere in `data/` holds a tag or a character
entity; a bare "&" is text ("Anti-bacterial & deodorizing").

## Declared differences from v0.990

None added.

---

## Data corrections

None.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

## Verification

`npm run check` passes: 317 Vitest tests (309 in v0.999), 59 Playwright tests.

- **New tests, 8:** four `plain-text` cases (a tag in a pairing note, an
  entity in a gut note, a tag in a grip spec, a tag in a string's feel
  text); two shapes the schema rejects (a spec as a string, a spec without
  its emphasis flag); a standard JSON Schema validator rejecting a spec as a
  string; and the search check above.
- **Against v0.990:** converted back with `specHtml`, the data still equals
  v0.990's value for value, and serialises to the same length.
- **Parity:** all 15 pixel views and 24 DOM scenarios pass with no new
  declared difference. Both the grips view and the compare view draw specs or
  notes, now through escaping.
- **Schemas:** `schemas/tennisdb.schema.json` regenerated with a `GripSpec`
  definition.

## File size

| | v0.999 | v1.0 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 454,685 | 456,362 | +1.7 KB (+0.4%) |
| gzip | 102,987 | 103,102 | +0.1 KB |

The structured specs add the bytes: `emphasis` on each of the 73.

## Still open

Unchanged from v0.999. Next, Phase 2 step 3, the visible changes, one release
each with declared differences:

- stiffness labels and the 8 Firm/Soft chips (D2, D8);
- the notes that use an old band word, sample of five first (D2);
- the bar scale and the footers' new wording (D3);
- one colour per grip tag label, with screenshots first (D8).

---

# v0.999 — Ratings as values

**Date:** 2026-11-16
**Base:** v0.998 (stiffness as values)
**Status:** model release, no visible change. Phase 2 step 2, fifth move
(`docs/phase-2-data-model.md`, D5): every rating is stored as a score and a
label, and renders exactly as before. No note content changed and no rating
word changed; `TENNIS_DB.version` stays `0.990`.

This is the last release numbered v0.99x. By the owner's decision the next one
is **v1.0**.

---

## Ratings as values

| | Was | Now |
|---|---|---|
| A rating | `{ label: "Low-Med", width: 38 }` | `{ score: 38, label: "Low-Med" }` |
| Gut protection on a gut-crosses pairing | `null` | `null` |

- **458 ratings:** 308 on strings and hybrids (72 strings × power, spin,
  control, comfort; 10 hybrids × power, spin), 78 on grips (26 × tackiness,
  absorption, durability; the 9 replacement grips have none), 72 on gut
  pairings (21 × power, spin, comfort, plus 9 gut-protection ratings).
- The score is the number that was the bar's width. `ratingBar()` in
  `src/core/ratings.ts` gives the views the bar they drew before.
- Stiffness is not a rating and is untouched; its band and width wait for D2
  and D3.

**The word lists.** Each label is checked against the list of today's words for
its axis, lowest first (`RATING_WORDS` in `src/core/ratings.ts`):

| Axis | Words, lowest first |
|---|---|
| Power (strings, hybrids) | Low · Low-Med · Med-Low · Medium · Med-High · High · Very High |
| Spin (strings, hybrids) | Low · Low-Med · Med-Low · Medium · Moderate · Mod-High · Med-High · High · High (Slice) · Very High · Elite |
| Control | Low-Med · Moderate · Good · Very Good · Very High · Excellent · Outstanding |
| Comfort | Low · Low-Mod · Med-Low · Moderate · Medium · Good · Med-High · Very Good · High · Very High · Excellent · Elite |
| Grip tackiness | Low · Low-Med · Moderate · High · Very High · Elite |
| Grip absorption | Low · Med-Low · Medium · Moderate · High · Very High · Excellent · Elite |
| Grip durability | Low · Moderate · Medium · Good · Very Good · Excellent |
| Gut power, spin, protection | Med-Low · Med · Med-High · High · Very High |
| Gut comfort | Very Good · Excellent · Outstanding |

- Gut pairings have their own lists: they say "Med" where the strings say
  "Medium", and their scale sits higher (a gut pairing's "Med-Low" power is
  52–55, a string's 42–50).
- Near-synonyms are placed by the lowest score each is used at, so "Medium"
  comes before "Moderate" on spin and after it on comfort and on the grips.
  That placing is provisional. Unifying the words is the later content pass
  D5 sets aside, starting with a sample of five.

`scripts/migrate-ratings.ts` (one-off) ran on a sample batch first (a string,
a hybrid, a grip and two gut pairings). Before writing, it asserts the counts
above, that every label is on its list, that every listed word is in use, that
the lowest scores never fall along a list, that no `{ label, width }` bar is
left, and that converting back gives the data as it was, character for
character.

**Validation.** The schema fixes each axis's words, so a word from another
list ("Med" on a string) or the old bar shape fails. New rule:
`rating-order`, along each list a word's lowest score never falls below that
of the word before it. It catches a word used far below its place (a "High" at
20). It does not catch one used too high (a "Low" at 90): the scores of
neighbouring words overlap today, so no stricter rule holds until the words
are unified.

## Declared differences from v0.990

None added.

---

## Data corrections

None.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

## Verification

`npm run check` passes: 309 Vitest tests (299 in v0.998), 59 Playwright tests.

- **New tests, 10:** four ratings that break the order (a string, a hybrid, a
  grip, a gut pairing); five shapes the schema rejects (a word not on its
  list, a gut word on a string, a string's word on a gut pairing, a grip word
  from another axis, a stored bar width), where two bar-width tests became
  score tests; and one check that a standard JSON Schema validator rejects a
  word from another list and the old bar shape.
- **Against v0.990:** converted back with `ratingBar`, the data still equals
  v0.990's value for value, and serialises to the same length.
- **Parity:** all 15 pixel views and 24 DOM scenarios pass with no new
  declared difference.
- **Schemas:** `schemas/tennisdb.schema.json` regenerated; the single `Bar`
  definition is replaced by one named definition per axis (`PowerRating`,
  `GutProtectionRating` and so on).

## File size

| | v0.998 | v0.999 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 454,575 | 454,685 | +0.1 KB (+0.0%) |
| gzip | 102,842 | 102,987 | +0.1 KB |

## Still open

Unchanged from v0.998, except:

- **Closed: version numbers.** The release after this one is v1.0.
- **New: the rating words.** The lists record today's words as they are,
  near-synonyms included; `rating-order` is as strict as they allow.
  Unifying them is Phase 2 step 4.

Next in Phase 2 step 2, as v1.0: plain-text notes and the structured grip spec
(D9).

---

# v0.998 — Stiffness as values; "strung" title and "Notes" headers

**Date:** 2026-11-16
**Base:** v0.997 (racquet fields as values)
**Status:** model release with two small visible changes. Phase 2 step 2,
fourth move (`docs/phase-2-data-model.md`, D1): stiffness is stored as a band
plus a figure with its provenance, and renders exactly as before. Separately,
at the owner's request, the tab title and the notes column headers changed.
No note content changed; `TENNIS_DB.version` stays `0.990`.

---

## 1. Stiffness as values

| | Was | Now |
|---|---|---|
| String with a figure | `{ label: "Firm · ~1.10", width: 88 }` | `{ band: "Firm", figure: { kgPerMm: 1.1, approx: true, source: "legacy", retrieved: null }, width: 88 }` |
| Range | `"Medium · 0.95–1.00"` | `kgPerMm: { min: 0.95, max: 1 }` |
| String without a figure | `{ label: "Med", width: 62 }` | `{ band: "Med", figure: null, width: 62 }` |
| Hybrid | `{ label: "Med-Firm", width: 75 }` | `{ band: "Med-Firm", width: 75 }` |

- 62 of the 72 strings have a figure: 15 approximate, 5 ranges. All 62 are
  marked `source: "legacy"` with no retrieval date, the decision for D1; a
  later check upgrades each to a named source and a month.
- The figure is a nested object, a refinement of the D1 sketch (which had its
  fields flat): the provenance travels with the figure, and the 10 strings
  without one carry none. Hybrids never have a lab figure and store band and
  width only.
- The band and the bar width are still stored. Deriving the band from the
  figure is D2 and the width D3, each a visible release. "Med" and "Medium"
  both remain until then.
- `stiffnessLabel()` in `src/core/stiffness.ts` prints the label as before.

`scripts/migrate-stiffness.ts` (one-off) ran on a sample batch first (one of
each form and a hybrid). Before writing, it asserts 72 strings (62 with a
figure, 15 approximate, 5 ranges, 10 without), 10 hybrids, the count in each of
the eight bands, and that every label prints back exactly.

**Validation.** The schema fixes the band list, so the `stiffness-band` rule
moved into it. New rules: `stiffness-range` (a range runs forwards) and
`stiffness-provenance` (a figure has a retrieval date exactly when its source
isn't `legacy`).

## 2. Tab title and "Notes" headers

- **Tab title:** "strung" (was "Strung — Selim S."). The home-screen name
  stays "Strung".
- **Notes column:** the string and hybrid tables' "Notes for Your Setup" is now
  "Notes", as the grip and gut tables already said; compare's "Note" row is
  "Notes" too. This closes the "Notes for Your Setup" item under Still open.

## Declared differences from v0.990 (added in v0.998)

| Difference | Visible? | Legacy patch |
|---|---|---|
| "Notes" heads the notes column in the string and hybrid tables and in compare | yes | E: the 24 table headers renamed (the patch throws on any other count); compare's header renamed whenever its table is redrawn |

The tab title is not part of the page the parity suite compares.

---

## Data corrections

None.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

## Verification

`npm run check` passes: 299 Vitest tests (292 in v0.997), 59 Playwright tests.

- **New tests, 8:** a backwards range, a non-legacy source without a date, a
  legacy figure with one; and five shapes the schema rejects (an unknown band,
  a figure written as text, a stored label, a figure on a hybrid, a retrieval
  date that isn't a month). One mutation test retired with `stiffness-band`.
- **Against v0.990:** converted back with `stiffnessBar`, the data still
  equals v0.990's value for value.
- **Parity:** all 15 pixel views and 24 DOM scenarios pass. Without patch E,
  the desktop page view and the compare DOM scenario fail.
- **A harness weakness found and fixed.** One phone view ("compare open")
  failed about 1 run in 175 under load. Both pages were right; they had been
  left at different scroll positions, because Playwright re-scrolls when the
  fixed compare bar covers the checkbox it is about to click, and a full-page
  screenshot draws fixed elements wherever the page is scrolled. Full-page
  captures are now taken from the top of the page. Since then the compare
  tests passed 280 of 280 runs under load and the full suite 177 of 177.

## File size

| | v0.997 | v0.998 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 450,038 | 454,575 | +4.4 KB (+1.0%) |
| gzip | 102,556 | 102,842 | +0.3 KB |

## Still open

Unchanged from v0.997, except:

- **Closed:** the "Notes for Your Setup" table header.
- **New: the gut hybrid section's UX.** The owner finds the Natural Gut / Poly
  Hybrids strip confusing as it is; how it should work is to be worked out
  later. Nothing changed here.
- **Version numbers.** v0.999 is the last number in this scheme, and Phase 2
  has more releases left than that; the numbering needs a decision before the
  release after next.

Next in Phase 2 step 2: ratings as `{ score, label }` (D5).

---

# v0.997 — Racquet fields as values

**Date:** 2026-11-16
**Base:** v0.996 (hybrid sides linked)
**Status:** model release, Phase 2 step 2, third move (`docs/phase-2-data-model.md`,
D4). Racquets store head size and pattern as numbers. The page renders exactly
as before; `TENNIS_DB.version` stays `0.990`.

---

## 1. The fields

| Field | Was | Now |
|---|---|---|
| Head size | `headSize: "100 sq in"` | `headSizeSqIn: 100` |
| Pattern | `pattern: "16×19"` | `pattern: { mains: 16, crosses: 19 }` |
| Label | `label: "Yonex Regna 100"` | not stored; derived as brand plus model |

`id`, `brand`, `model` and `ra` are unchanged. Head size stays in square
inches, the owner's pick for D4. The label was exactly brand plus model in all
three records; a racquet whose display name isn't would need the field back.

`racquetLabel()` and `racquetSpec()` in `src/core/labels.ts` derive the
context line's name and its "64 RA · 16×19 · 100 sq in" spec.

## 2. The migration

`scripts/migrate-racquets.ts`, a one-off kept for provenance. With three
racquets, the sample shown before the run was the full set. Before writing, it
asserts three racquets and that each record's label and spec line print back
exactly from the new fields.

## 3. Validation

The schema takes whole numbers within sane bounds (head size 80–140 sq in,
mains 12–22, crosses 14–24, RA 40–80 as before) and no longer accepts a
`label` key.

## Declared differences from v0.990 (added in v0.997)

None. The parity suite passed unchanged.

---

## Data corrections

None.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

## Verification

`npm run check` passes: 292 Vitest tests (289 in v0.996), 59 Playwright tests.

- **New tests, 3:** a head size written as text, a pattern written as text, and
  a stored `label` key are each rejected by the schema.
- **Against v0.990:** converted back (head size and pattern as text, the label
  from `racquetLabel`), the data still equals v0.990's value for value.
- **Parity:** all 15 pixel views at both viewports and all 24 DOM scenarios
  pass unchanged.

## File size

| | v0.996 | v0.997 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 450,022 | 450,038 | +16 bytes |
| gzip | 102,549 | 102,556 | +7 bytes |

## Still open

Unchanged from v0.996. Next in Phase 2 step 2: stiffness storage (D1).

---

# v0.996 — Hybrid sides linked to their strings

**Date:** 2026-11-09
**Base:** v0.995 (pairings and numeric tensions)
**Status:** model release, Phase 2 step 2, second move (`docs/phase-2-data-model.md`,
D7). Each hybrid's mains and crosses now name the string they use by id. The
page renders exactly as before; `TENNIS_DB.version` stays `0.990`.

---

## 1. The links

Every hybrid side gained a `stringId` next to its text, as gut pairings
already had. The text stays as it was and is still what the page shows. 19 of
the 20 sides are linked. The links come from a table the owner approved, not
from name matching:

- 15 sides name a string exactly (K-Pop, K-Pop Spin, Dreddy, Stevie, 101 and
  What The Hybrid in full, plus the mains of O-Snap, Wasabi Pro and
  Snapaholic).
- **"O-Toro Snap TF"** (O-Snap and Snapaholic crosses) →
  `toroline-o-toro-snap-tour-flex`. Both hybrids' notes say "Snap Tour Flex",
  and the side's "Round · Med-Firm" matches Tour Flex, not O-Toro Snap
  (Medium). Matching on the start of the name would have linked O-Toro Snap.
- **Cole:** "O-Toro Tour 1.23 Mint" → `toroline-o-toro-tour` and "O-Toro 1.23
  Green" → `toroline-o-toro`; the gauge and colour are part of the name.
- **"Wasabi X"** (Wasabi Pro crosses) stays unlinked (`null`). It is described
  as round and slick, while Wasabi is square, and there's no record for it.

`scripts/link-hybrid-sides.ts` (one-off) holds the table, checks each side's
text before linking, and asserts 20 sides with 19 links.

## 2. Validation

- New rule `hybrid-string-refs`: a link names a single string in the data,
  not a hybrid or an unknown id.
- The schema requires `stringId` on every side (a string id or `null`).

## Declared differences from v0.990 (added in v0.996)

None. The parity suite passed unchanged.

---

## Data corrections

None. The links add information; no text changed.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

## Verification

`npm run check` passes: 289 Vitest tests (286 in v0.995), 59 Playwright tests.

- **New tests, 3:** a link to an unknown id, a link to a hybrid, and a side
  without its `stringId`.
- **Against v0.990:** with the links removed, the data still equals v0.990's
  value for value.
- **Parity:** all 15 pixel views at both viewports and all 24 DOM scenarios
  pass unchanged.

## File size

| | v0.995 | v0.996 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 448,794 | 450,022 | +1.2 KB |
| gzip | 102,605 | 102,549 | −56 bytes |

## Still open

Unchanged from v0.995, plus:

- **Wasabi X** is the crosses string of the Wasabi Pro hybrid, but the data
  has no record for it, so that side can't be linked. Adding it would be new
  content: a string record and a note for each racquet.

Next in Phase 2 step 2: the racquet fields (D4).

---

# v0.995 — Pairings and numeric tensions

**Date:** 2026-11-06
**Base:** v0.994 (data schemas)
**Status:** model release, Phase 2 step 2, first move (`docs/phase-2-data-model.md`,
D6 and D7). The data is stored differently; the page renders exactly as before.
No content changes; `TENNIS_DB.version` stays `0.990`.

---

## 1. Pairings

How each string and hybrid is strung in each racquet moved out of the item
into `data/pairings.json`: 246 records (72 strings and 10 hybrids, 3 racquets
each) of `{ itemId, itemKind, racquetId, tension, note }`. Strings and
hybrids no longer carry `perRacquet`. A fourth racquet is now a racquet
record plus its pairings.

Gut pairings stay whole records: four combinations appear in more than one
racquet, but their feel and bars differ every time, so each is already a
racquet-specific pairing. `data/gutHybrids.json` went from a map keyed by
racquet to a flat list of 21, each with a `racquetId` after its `id`. This
adjusts D7 as written, which had them join the pairings list.

The views read pairings through one lookup, `src/core/pairings.ts`: the
tables, compare, search and the gut strip.

## 2. Tensions as numbers

| Kind | Count | Was | Now |
|---|---:|---|---|
| range | 212 | `22–24` | `{ kind: "range", minKg: 22, maxKg: 24 }` |
| max | 2 | `max 16` | `{ kind: "max", maxKg: 16 }` |
| prestretch | 2 | `25 (5% PS)` | `{ kind: "prestretch", kg: 25, prestretchPct: 5 }` |
| split | 51 | `23/24` | `{ kind: "split", mainsKg: 23, crossesKg: 24 }` |

Strings take a range, a maximum or a prestretch; hybrids and gut pairings
take a split. The schemas enforce both, with every value between 5 and 40 kg.
`tensionLabel()` prints them as before.

## 3. The migration

`scripts/migrate-pairings.ts`, a one-off kept for provenance. It ran on a
sample batch first (one of each tension kind, a hybrid and a gut pairing),
shown before the full run. Before writing, it asserts:

- 216 string, 30 hybrid and 21 gut pairings;
- tension kinds 212 / 2 / 2 / 51, with split for hybrids and gut only;
- every tension prints back to exactly its original text;
- all 246 notes carried over unchanged and in order.

`scripts/extract-legacy.ts` writes the v0.990 shapes, so running it again
would undo this; its `npm run extract` shortcut is removed.

## 4. Validation

- `pairings-complete` replaces `per-racquet-keys`: every string and hybrid
  has exactly one pairing per racquet.
- New: `pairing-refs` (a pairing names a real item of its kind, and a real
  racquet) and `tension-range` (a range doesn't run backwards).
- `gut-racquets` now checks each gut pairing's `racquetId`.
- Schema issues on a pairing name it by item and racquet, e.g.
  `data: pairings.toroline-k-pop/regna.tension`.

## Declared differences from v0.990 (added in v0.995)

None. The parity suite passed unchanged.

---

## Data corrections

None.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

## Verification

`npm run check` passes: 286 Vitest tests (278 in v0.994), 59 Playwright tests.

- **Against v0.990:** the data, converted back to the v0.990 shape with the
  app's own `tensionLabel`, equals the blob embedded in v0.990: every key and
  value, arrays in order, and the same length when serialised. Until v0.994
  this was a byte-for-byte comparison. It can't be now: in 18 of the 82 strings
  and hybrids (all 12 Luxilon and all 6 Tourna), v0.990 put `perRacquet` in
  the middle of the record, and key order carries no meaning in JSON.
- **Parity:** all 15 pixel views at both viewports and all 24 DOM scenarios
  pass with no new declared difference.
- **New tests, 8:** two pairing gaps (a missing and a duplicated pairing), two
  bad pairing references, a backwards range, three tensions the schema
  rejects (the wrong kind for a hybrid, text instead of numbers, 60 kg), and the
  length check above. One mutation test was retired with `per-racquet-keys`.

## File size

| | v0.994 | v0.995 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 425,033 | 448,794 | +23.8 KB (+5.6%) |
| gzip | 100,771 | 102,605 | +1.8 KB (+1.8%) |

Explicit pairing records repeat their key names 246 times, which compresses
well. On disk, `data/` grew from 246 KB to 275 KB (pretty-printed).

## Still open

Unchanged from v0.994. Next in Phase 2 step 2: linking hybrid mains and
crosses to strings by id (D7), then the racquet fields (D4).

---

# v0.994 — Data schemas

**Date:** 2026-11-04
**Base:** v0.993 (rename)
**Status:** model release, Phase 2 step 1 (`docs/phase-2-data-model.md`, D9 and
D10). Every collection and the UI copy now have a schema. No data, content or
behaviour changes; `TENNIS_DB.version` stays `0.990`.

---

## 1. Schemas

`src/core/schema.ts` has a Zod schema per collection (racquets, brands,
strings, hybrids, grips, gut strings, gut pairings) plus the UI copy,
describing the data exactly as stored today. They own its shape:

- every field, required or optional, with no unknown keys allowed;
- formats: kebab-case ids, hex colours, whole-number bar widths 0–100, the
  "100 sq in" and "16×19" forms, the data version;
- the vocabularies: the shape and feel tokens the filter chips match, the six
  tag colours, the three grip types, the two gut configurations.

The TypeScript types are now inferred from the schemas instead of written by
hand. The imports are type-only, so the app bundle doesn't carry the schemas.

## 2. What the schemas found

On their first run they caught two places where the hand-written types had
been wrong about the data. The data was right; the types now say so:

| Field | The old type said | The data has |
|---|---|---|
| `gutProtection` on a gut pairing | always a bar | `null` in all 12 gut-crosses pairings (the strip shows a dash) |
| `gauge` on each side of a hybrid | non-empty | empty for Toroline Cole, whose gauges are part of the string names |

## 3. Validation

`npm run validate` (and every build) runs the schemas first. If the shape is
wrong, it reports only that, with the record's id in the location, e.g.
`data: strings.toroline-caviar.feelAttr`. The content and cross-record rules
in `validate.ts` run on well-formed data, as before.

The schemas took over four checks: the `feel-tokens` and `shape-tokens`
rules, and the `topPick` key and `"square-textured"` parts of `retired`
(the "Connected" check stays). The other rules stay in `validate.ts`, not as
schema refinements: JSON Schema can't carry code, and these are checks on this
repo's content (neutral text, a note per racquet, references, CSS coverage)
rather than facts about the data's shape.

## 4. JSON Schema export

`npm run schemas` writes `schemas/tennisdb.schema.json`, `copy.schema.json`
and `stringing-log.schema.json` (draft 2020-12), for a future native app. The
named parts (TennisDb, Racquet, Brand, String, Hybrid, Grip, GutString,
GutPairing, Bar, FeelTag, PerRacquet) become definitions. Every constraint
above is plain JSON Schema (types, patterns, enums), so it carries over. The
files are generated and left out of Prettier.

---

## Data corrections

None. The two findings above corrected the types, not the data.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

## Verification

`npm run check` passes: 278 Vitest tests (261 in v0.993), 59 Playwright tests.

- **Schema mutations, 14:** a feel or shape token no chip matches,
  "square-textured", a `topPick` key, an unknown key on a grip, a missing
  field, a bar width over 100 or written as text, a colour that isn't hex, an
  id that isn't kebab-case, an unknown grip type, tag colour or gut
  configuration, and copy without the gut intro. Each is reported as a schema
  issue at the right record, and nothing else runs.
- **Export, 7:** each `schemas/` file matches a fresh export; a standard JSON
  Schema validator (Ajv 8, a new dev dependency) accepts the data, the copy
  and a log backup, and rejects a bad feel token, an unknown key and an
  uppercase id.
- The four mutation tests for the retired rules became schema tests.

## File size

| | v0.993 | v0.994 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 424,956 | 425,033 | +77 bytes |
| gzip | 100,738 | 100,771 | +33 bytes |

## Still open

Unchanged from v0.993. Next in Phase 2 (D10 step 2): the moves that render
identically, starting with tension and pairings.

---

# v0.993 — Renamed to Strung

**Date:** 2026-10-27
**Base:** v0.992 (bug-fix release)
**Status:** name and icon release — the app is called Strung, with a new icon.
No data, content or behaviour changes; `TENNIS_DB.version` stays `0.990`.

---

## 1. The name

| Where | Was | Now |
|---|---|---|
| iOS home screen (`CFBundleDisplayName`, Capacitor `appName`) | EquipDB | Strung |
| Web app manifest (`name` / `short_name`) | Tennis equipment database / EquipDB | Strung / Strung |
| Home-screen name Safari suggests (`apple-mobile-web-app-title`, new) | the page title | Strung |
| Browser tab (`<title>`) | Tennis equipment database — Selim S. | Strung — Selim S. |
| Topbar wordmark (desktop; hidden on phones, as before) | EQUIP + a dimmed DB, in Space Mono | "strung" in heavy DM Sans with a blue line under it, like the icon |
| Log backup file | `tennisdb-log-YYYY-MM-DD.json` | `strung-log-YYYY-MM-DD.json` |

Unchanged on purpose: the iOS app id (`com.selimsaukkomaa.tennisdb`), the
address (`/tennisdb/`) and the repository. Installed copies, the iOS app and
the home-screen web app, update in place and keep their stringing log. Import
still accepts backups under the old file name.

## 2. The icon

"strung" in heavy DM Sans (the app's own body font) with a line under it, like
a string, white on electric blue (`#1f4fff`). It replaces the Space Mono
"EQUIP / DB" wordmark on near-black. One design at every size: the PWA icons
(192, 512, maskable 512 with the word inside the safe circle), the apple-touch
icon, the favicon and the iOS app icon. The launch screen stays plain
`#f0efeb`. `npm run icons` regenerates them; the alternatives it was picked
from (optic yellow, coral, pink) stay in its preview mode.

The topbar wordmark follows the icon: "strung" in DM Sans at weight 800 with a
2 px `#1f4fff` line under it. The v0.990 font declarations stop at weight 700,
so one more `@font-face` maps 800 to the same bundled variable file. The
wordmark stays hidden on phones.

## Declared differences from v0.990 (added in v0.993)

| Difference | Visible? | Legacy patch |
|---|---|---|
| Topbar wordmark reads "strung" in heavy DM Sans with a blue line | yes, on desktop | D: the wordmark's text and style, and the weight-800 font, as in the app |

The title, manifest and icons are not part of the page the parity suite
compares.

## Data corrections

None.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

## Verification

`npm run check` passes: 261 Vitest tests, 59 Playwright tests (57 in v0.992).

- **New view:** a close-up of the top bar at both viewports. At full-page size
  the wordmark is too few pixels for the 0.1% threshold; the close-up fails
  without patch D (2.7% of pixels differ on desktop). On phones the wordmark is
  hidden, so that viewport passes either way.
- Without patch D the DOM comparison fails too (checked on the first scenario;
  every scenario includes the top bar).
- The patch loads the weight-800 face itself and waits for it, since the
  harness waits for fonts before patching. The browser suite then passed 177 of
  177 runs under load.

## Still open

Unchanged from v0.992, plus (nothing changed):

- **"Strung" is also a label inside the app:** the context line reads
  "STRUNG Caviar @ 23 kg" for the string currently in a racquet.
- **`.topbar-mark-dim`** in the v0.990 stylesheet is now a dead rule.

---

# v0.992 — Three v0.990 bugs fixed

**Date:** 2026-10-27
**Base:** v0.991 (repository port)
**Status:** bug-fix release — the three v0.990 bugs v0.991 kept for parity
are fixed. No data or content changes; `TENNIS_DB.version` stays `0.990`.
**Cutover:** the first release live on GitHub Pages from this repository,
deployed by GitHub Actions from `main` on 2026-10-27; it replaces v0.990.

---

## 1. Grip filters cover every brand (bug A)

Under any grip filter, v0.990 force-showed only the Kimony and Yonex sections,
and Tourna had no filter header. Tourna's matches stayed hidden unless the
Tourna tab was the one selected, yet the status counted them as shown: with
Dry on, "9 of 35 grips" listed six.

- Every grip brand's section is shown under a filter, each with its header.
  A brand with no match is hidden along with its header, as before.
- Tourna's header uses `#1e40af`, Tourna's colour on light backgrounds
  everywhere else in the app (compare, log, gut, search).
- A new validator rule, `grip-header-css`, requires a header colour for every
  grip brand, so a new brand can't repeat this.

## 2. One string filter state for every racquet (bug B)

v0.990 kept one set of active chips for all racquets but filtered only the
racquet on screen. Filter on Regna, switch to Percept and clear: back on Regna
the hex-only rows, the "— showing all" badge and the all-brands view were
still there, with no chip active.

- Every filter pass now covers every racquet, so they are filtered and cleared
  together. The status still counts the racquet on screen.
- Unchanged: an active filter still follows you when you switch racquet, as in
  v0.990.

## 3. The search clear button shows

The palette's ✕ was hidden by its CSS (`display: none`), and its script only
ever reset the inline style, so it never appeared. Chrome and Safari drew their
own blue ✕ inside the field instead; Firefox drew none.

- The palette's ✕ now shows inside the field's right edge while the field has
  text, in the palette's grey with its existing hover state. Clicking it
  empties the field and closes the results, as v0.990's code intended. It is
  a real button, so Tab reaches it.
- The browser's own ✕ is hidden, so there is one in every browser.
- The hint ("Esc to close · ↑↓ to navigate") doesn't move.

## Declared differences from v0.990 (added in v0.992)

The parity suite now patches each fix into the legacy page before comparing
(`tests/visual/legacy-fixes.ts`), so the rest of every view and DOM scenario
is still compared in full. Bugs A and B are patched through legacy's own
filter functions; the CSS repeats the app's rules.

| Difference | Visible? | Legacy patch |
|---|---|---|
| Tourna shown under grip filters, with a `#gfh-tourna` header | yes, under a grip filter | `getGripBrandSections` returns all three sections; header and colour added |
| Every racquet filtered and cleared together | yes, after switching racquet | `applyFilters` runs legacy's own pass for each racquet, the active one last |
| Palette ✕ shown while the field has text; browser ✕ hidden | yes, in the palette | the class toggle and CSS; legacy's inline `display` removed |

---

## Data corrections

None.

## Flags left open

Unchanged since v0.989 (listed under v0.991).

---

## Verification

`npm run check` passes locally and in CI.

The new close-up first failed intermittently in CI (2 of 3 runs): both pages
focus the palette's field and select its text 10 ms after opening, and under
load the test sometimes typed first, so the selection appeared on one page
and not the other, or swallowed the first keys ("caviar" became "viar"). It
reproduced locally under load (23 of 40 runs). Typing into the palette's field
now waits for that focus (`typeInto` in `tests/visual/dom.ts`); since then
the search tests passed 325 of 325 runs under the same load, and the full
browser suite 171 of 171. CI failures now show as public annotations
(Playwright's `github` reporter), so they can be read without signing in.

**iOS Simulator** (iPhone 18 Pro): the palette's ✕ is the only one in the
field, shows with text, and a tap empties the field and closes the results.
The log entry saved under v0.991 survived installing v0.992 over it.

**Vitest: 261 tests** (248 in v0.991).

- **Fixes, 12 new** (`tests/smoke/fixes-v0992.test.ts`, jsdom): A (5),
  B (3), search clear button (4). They state the fixed behaviour without
  reference to legacy. Run against v0.991's code, 8 fail; the other 4 guard
  behaviour that already worked.
- **Validator, 1 new:** a mutation test for `grip-header-css`.

**Playwright: 57 tests** (55 in v0.991; 27 skipped by design, as before).

- **New view:** the search field with text and the ✕ hovered, as a close-up
  at both viewports. At full-page size the ✕ is fewer pixels than the 0.1%
  threshold, so only a close-up can see it.
- **Each patch checked** by running the suite without it: without A, all 24
  DOM scenarios and the Dry view fail (the Tourna header is in every page);
  without B, the three filter scenarios that use it fail; without C, the
  search scenarios and the close-up fail.
- The two DOM scenarios named after the bugs are renamed after the fixes.

## File size

| | v0.991 | v0.992 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 423,044 | 424,103 | +1.1 KB |
| gzip | 100,020 | 100,374 | +0.4 KB |

## Still open

Unchanged from v0.991, plus one observation (nothing changed):

- **The palette hint on phones** ("Esc to close · ↑↓ to navigate") is wider
  than the field leaves room for and is cut off at the right edge. Its
  keyboard hints mean little on a touch screen.

---

# v0.991 — Repository port

**Date:** 2026-10-27
**Base:** v0.990 (polish release)
**Status:** platform release — the single HTML file becomes a repository that
builds a PWA on GitHub Pages and an iOS app. Same behaviour, same look, same
data. No note, tag, chip, bar or label changed; `TENNIS_DB.version` stays
`0.990`.

---

## 1. From one file to a repository

| v0.990 (one file) | v0.991 |
|---|---|
| `TENNIS_DB`, a 188 KB JSON blob in a script tag | `data/`, one JSON file per collection, UTF-8, key order kept. Reassembled, it equals the v0.990 blob exactly (tested). |
| Copy in markup and JS: 5 brand footers (with PT630 overrides for Toroline and Solinco), the Toroline hybrid card, 3 grip About boxes, the gut intro, legends | `content/copy.json`, verbatim |
| ~2,600 lines of CSS layered by version | `src/styles/`, split into 8 files verbatim and imported in the same cascade order; v0.991 rules in `additions.css` |
| 7 inline scripts talking through window globals, with v0.97 and ux988 wrapper chains | TypeScript modules: `src/core` (data, filters, search, log; no DOM) and `src/ui` (rendering, events). The wrappers became direct calls. |
| The three racquets hard-coded in about nine places (three `showBrand` variants, four `getActiveRacquet` copies probing `style.display`, per-racquet ID prefixes) | One shell generated from `racquets.json` × brands, one `showBrand(racquet, brand)`, and a state module. A fourth racquet needs only data. |
| `build_990.py` invariants, checked when the file was built | `src/core/validate.ts`, run by every dev and production build, in CI and by `npm run validate` |
| `smoke_v990.js` | Vitest suite (see Verification) |
| Google Fonts | the same woff2 files, self-hosted |

The context line now re-renders when the log changes, instead of on every
click anywhere in the page.

## 2. Stringing log v2

The log is rebuilt behind a storage interface, so the web and iOS store it
differently but behave the same.

| | v0.990 (v1) | v0.991 (v2) |
|---|---|---|
| Storage key | `tennis_log_v1` | `tennis_log_v2` (localStorage on the web, Capacitor Preferences on iOS) |
| Entry id | timestamp plus a random suffix | UUID |
| Tension | free text, shown with " kg" appended | numbers: `{ mainsKg, crossesKg }` |
| Pin | flag on the entry | `pins: { racquet: entryId }` |
| Delete / Clear all | removes the entry | marks it deleted (`deletedAt`), so imports and a future sync can't bring it back |
| Timestamps | none | `createdAt`, `updatedAt` |

- **Tension input** keeps its text field and accepts `24`, `23/24`, `23.5`,
  `24 kg` and a decimal comma, between 5 and 40 kg. Unparseable input is
  marked in red and blocks saving. The context line reads `@ 23/24 kg`; v0.990
  showed `@ 24 kg kg` when the field already said kg.
- **Backups:** Export and Import links in the log panel footer.
  - Export writes `tennisdb-log-YYYY-MM-DD.json`: a download on the web, the
    share sheet (Files, AirDrop, Mail) on iOS.
  - Import validates the file, merges by entry id (the newer `updatedAt` wins,
    deletions are respected, the local pin wins) and reports how many entries
    were added and updated.
- A stored log that fails validation is moved to a backup key rather than
  overwritten.
- **No v1 migration**, as decided. The log starts empty; a v0.990 log stays in
  the browser under `tennis_log_v1`, untouched and unread.

## 3. PWA, iOS and deploy

- **PWA:** manifest ("Tennis equipment database", short name EquipDB,
  standalone, `#f0efeb`), a dark wordmark icon (192, 512, maskable,
  apple-touch) and a service worker that precaches the whole app, fonts and
  data included (29 files, 654 KiB). It works offline and updates itself on
  the next visit.
- **iOS:** Capacitor 8 app "EquipDB" (`com.selimsaukkomaa.tennisdb`, iOS 15+),
  wrapping the same build. The log lives in Preferences (UserDefaults) and
  exports through the share sheet. A strip in the page colour sits behind the
  status bar so the page doesn't show under the clock; the launch screen is
  plain `#f0efeb`. The service worker is web-only.
- **Deploy:** a GitHub Actions workflow runs every check on each push and pull
  request and builds the `/tennisdb/` site each time. It deploys only from
  `main`. Cutover (merge, then switch the Pages source to GitHub Actions) has
  not happened: the live site still serves v0.990.

## 4. Declared differences from v0.990

Everything else renders identically (see Verification). Each difference below
is masked or erased in the parity tests, with the reason in the test.

| Difference | Visible? | In the tests |
|---|---|---|
| Version tag reads v0.991 (×3); the data stays 0.990 | yes | masked; erased from DOM snapshots |
| Export / Import links in the log footer; the footer shows on an empty log too | yes | `.log-backup` masked; erased from DOM snapshots |
| Unparseable tension marked in red and not saved | yes, on error | unit and smoke tests |
| Context line no longer doubles "kg" | yes, when tension was typed with kg | unit tests |
| Log entry ids are UUIDs | no | `data-entry-id` / `data-form-id` normalised |
| Deletes are soft (tombstones) | no | log core tests |
| Brand-section, switcher and filter-header ids follow one scheme, `<racquet>-<brand>-…` (v0.990: no prefix, `p-`, `h-`); nothing styles or reads them | no | ids dropped from DOM snapshots |
| Inline `onclick` handlers replaced by `data-nav-*` hooks | no | dropped from DOM snapshots |
| `data-render-section` (on three Luxilon sections, read by nothing) dropped | no | dropped from DOM snapshots |
| Fonts served from the app instead of Google | no | both sides load the same files |
| Favicon, apple-touch icon, theme colour and manifest in `<head>` | browser tab and home screen | n/a |
| Status-bar strip | iOS app only | n/a |

---

## Data corrections

None. Every validator passes on the v0.990 data as shipped.

## Flags left open (unchanged since v0.989)

- **Poly Tour Pro** — 1.05 kg/mm, above Strike's 0.92, while every source
  describes Pro as the softer string. Flagged in the Regna note.
- **Eco Power** — 1.00 kg/mm sits nearer standard ALU Power than ALU Power
  Soft, where Luxilon positions it. Flagged.
- **No lab stiffness:** Cash, Vamos and Poly Tour Force (bands inferred, stated
  in-note).
- **Mach-10** — the "slightly muted" summary is inferred from stiffness.
- **Fonseca** — attributed to Poly Tour Force only; not independently
  verified.

---

## Verification

`npm run check` passes, locally and in CI (run on `a7dac7f`).

**Vitest: 248 tests.**

- **Smoke port, 105 checks:** `smoke_v990.js`'s 106 less the 3 v0.989
  regression checks, plus the search-index check v0.990 always skipped
  (`GLOBAL_SEARCH_API` was never defined), plus a guard that the tag-variant
  scan finds all six variants. 84 run against the app in jsdom; 21 scan a
  fresh production build (dead-code needles, no "Connected", CSS for every tag
  variant).
- **Data, 70:** the round trip to the v0.990 blob (33), the CSS split against
  v0.990's stylesheet (1), and the validators (36): the data passes, the file
  checks pass, every rule has a mutation test that breaks it, and a fourth
  racquet without notes is reported 82 times.
- **Unit, 73:** fourth racquet (14: topbar button, container, brand sections,
  tables, gut strip, log strip, compare tab, search entries), filters (9),
  compare (4), gut (3), search (8), log core (32: schema, tension parser,
  model, merge, store), DOM snapshot normaliser (3).

**Playwright: 55 tests** (27 more are skipped by design: each is desktop-only
or phone-only).

- **Pixel parity, 28:** 13 views at 1440×900 and 390×844, legacy and v0.991
  side by side in the same browser, at most 0.1% of pixels differing, plus a
  check that the harness catches a difference. Views: default, Percept, Pro
  Tour 630, Grips, gut strip expanded (page and element), filters with Hex,
  grip filters with Dry, compare open (2 strings + 1 hybrid) and its Percept
  tab, log with two entries and a pin, search on "caviar", search results for
  "gut".
- **DOM parity, 24:** live DOM snapshots compared node for node across
  navigation, sorting, filters (bugs A and B included), compare, gut, search
  and log scenarios.
- **Backups, 2:** export → clear → import restores the log; the footer on an
  empty log stays inside the panel.
- **Offline, 1:** with the network off, a reload renders all 281 rows in the
  right fonts and racquet switching works.

**iOS Simulator** (iPhone 18 Pro, iOS 27.1): strings and grips views, racquet
switching, safe areas, fonts from the bundle; a log entry saved in
Preferences survived quitting and reinstalling; Export opens the share sheet.
Import was not run on iOS.

## File size

v0.990 was one file; v0.991 is a page, a script and a stylesheet (bytes):

| | v0.990 | v0.991 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 411,239 | 423,044 | +11.8 KB (+2.9%) |
| gzip | 79,811 | 100,020 | +20.2 KB (+25%) |
| Fonts | from Google | 184,224 (10 woff2) | self-hosted |

The data is the same 187 KB. Most of the gzip growth is Zod (~25 KB), which
validates the log on load and import; Capacitor's core adds ~3 KB. The CSS is
not minified: the minifier drops the unprefixed `backdrop-filter`, which
removes the blur in Chromium. The whole site, with icons and the service
worker, is 736 KB.

---

## Scheduled for v0.992: v0.990 bugs kept for parity

These reproduce exactly in v0.991 so the parity tests could hold. Each fix
will get a behaviour test, and the affected views become declared
differences.

- **A. Grip filters skip Tourna.** Only Kimony and Yonex are shown under a
  grip filter, and Tourna has no filter header. Tourna matches stay hidden
  unless the Tourna tab is active, yet count as shown.
- **B. Stale filters on the racquet switched away from.** Filtering touches
  only the active racquet: filter on Regna, switch to Percept, clear, and
  Regna keeps its hidden rows when you switch back.
- **Search clear button never shows.** The ✕ in the palette's search field
  is never made visible.

## Still open

Carried from v0.990:

- **Feel taxonomy:** a Medium band, a damping axis (Transmitting / Damped),
  possibly a Bite / Snapback chip, and an audit of what Crisp means under the
  neutral model.
- **Poly Tour Pro and Eco Power stiffness conflicts:** still flagged, not
  resolved.
- **Stiffness labels vs numbers are not consistent across brands.** O-Toro
  0.95 is Med-Soft, Toro Toro 0.95 is Medium, Sync 0.85–0.95 is Med-Firm. A
  threshold rule is proposed in the Phase 2 sketch (not applied); it would
  move 32 labels and 8 Firm/Soft chips.
- **Grip Thin chip:** Tourna Original (0.45 mm) isn't tagged thin while Dry
  Super Grap (0.45 mm) is.

New observations, nothing changed:

- **Grip tags are not one label, one colour.** Tacky, Firm and Classic appear
  in both the firm and crisp variants; Dry in both round and crisp. v0.990
  normalised strings and hybrids only.
- **15 notes with ranking-style phrasing**, for a future content pass:
  - O-Toro Tour / PT630, Vanquish Multi / PT630, Tour Super 850 Multi /
    PT630, Quasi-Gut Armor / PT630: "the most flexible frame here"
  - Caviar / Regna, Confidential / Regna: tension maintenance "is the
    standout"
  - Poly Tour Strike / Regna, 4G / Regna, Vivo / PT630, gh-regna-6: "best
    tension maintenance / hold / stability" in the database
  - Tour Bite / Regna: "the most tunable string here"
  - TB Diamond Rough / Regna: "the most surface grip in the Solinco line"
  - Cash / PT630: "shows best"; Wasabi / Percept: "do their best work"
  - Sync / Regna: TennCom's "best round poly in the world" (attributed)
- **Grip text with verdict-like phrasing:** Hi-Soft EX "The default choice
  for maximum grip security and control"; Last Dry "Outstanding durability";
  Expert Techni Leather "Superior bevel feel"; Synthetic Pro "Most players
  already get this from their racquet". Wet Super Grap's "one of the world's
  best-selling grips" is a sales fact and probably fine.
- **"Notes for Your Setup"** table header is second person.
- **CSS quirks:** Tourna's later grip subheadings sit 32px below the table
  above, where other brands use 20px; `.active-tourna` is defined twice; dead
  rules `.percept-placeholder`, `.subtitle`, `.racquet-label`, `.brand-label`,
  `.category-label`, `.grip-towel`.
- **Phone grip cards:** the model runs straight into its specs
  ("KGT1010.33mm").
- **iOS:** text inputs under 16px zoom the page on focus; the log's date
  input is slightly wider than the panel; tapping the status bar to scroll to
  the top can't be checked in the Simulator and needs a device.
