# Strung — Changelog

Strung was the Tennis Equipment Database (EquipDB) until v0.993. Releases up to
v0.990 shipped as a single HTML file. Their changelogs are in `legacy/`
(`tennis_equipmentdb_changelog_v0_989.md`, `…_v0_990.md`).

---

# v1.13 — The Pure Drive 2025

**Date:** 2026-11-25
**Base:** v1.12 (frame profiles)
**Status:** data release with a visible change: the first racket beyond the owner's three, the
first of the common rackets. The Babolat Pure Drive 2025 joins with its frame profile, a pairing
for each of the 82 strings and hybrids, and seven gut setups. The owner's calls, 2026-11-23:
- the profile was approved before any note was written, with stability "medium";
- tensions follow the tension rule (offset +1), capped at Babolat's 25 kg maximum (option A);
- the notes were approved after a sample of five;
- each frame's gut setups get their own ratings, set from its profile, not copied from the
  Regna's.

`TENNIS_DB.version` stays `0.990`.

---

## The racket

- **In `racquets.json`:** `puredrive2025`, Babolat Pure Drive 2025, 100 sq in, 16×19, 69 RA
  (Tennis Warehouse's strung figure, as for every new frame). It comes last in the file, so a
  first visit still opens on the Regna 100. The menu lists it first, under Babolat (brands A–Z).
- **The profile:** four hands-on reviews. Specs: 318 g strung, 4 pts HL, swingweight 317, beam
  23/26/23 mm. Construction: NF2 Tech 2.0 (a flax throat), HTR, FSI Power, the elliptical beam.

| | Feel | Power | Launch | Spin | Stability | Comfort | Control | Sources |
|---|---|---|---|---|---|---|---|---:|
| Pure Drive 2025 | crisp | high | high | high | medium | medium | medium | 4 |

## Tensions

- **The rule:** the Regna 100's tension shifted by one whole-kg offset, from string-bed density
  and RA (v1.12, Still open). For the Pure Drive the offset is +1.
- **The cap** (owner, option A): Babolat rates the frame 21–25 kg, and the rule put 41 of the 89
  items (82 pairings, 7 gut setups) above 25. After the shift nothing goes above the maker's
  maximum:
  - 24 ranges stop at 25 (24–26 → 24–25);
  - 9 ranges that would start at 25 become "max 25" (Snapper, Super Toro, Vanquish Multi, Poly
    Tour Air, Tour Super 850 Multi, Element, M2 Pro, Quasi-Gut Armor, Pro Tour);
  - the prestretch and 7 splits move down whole, so each keeps its mains/crosses gap: Truffle X
    26 → 25 (5% PS), Stevie 24/26 → 23/25, and six of the gut setups (27/25 → 25/23,
    27/24 → 25/22, 26/24 → 25/23, 25/27 → 23/25, and 24/26 → 23/25 twice).

  Rejected: the rule as is (41 items above the maker's range), and shifting every item to fit
  (63 of 89 at 23–25). The nine "max 25" notes read "Up to 25 kg, the frame's rated
  maximum"; the other capped notes give their band as it now stands.
- **CLAUDE.md** now records the rule, the cap and the gut ratings under "Content (a new frame's
  tensions and gut)".

## Notes

- **82 pairings and 7 gut notes**, written to the note order with the profile as step 2: 47–62
  words, median 58. A sample of five was approved first, then all 89.
- **The texts:** the band is stated in kilograms, never as "the Regna's plus one". A disputed
  stiffness gets no figure. No reviewer or player is named.

## Natural gut

- **The Regna's seven setups**, with tensions by the rule and the cap and new notes.
- **Ratings set for this frame** (owner): power, spin, comfort and gut protection come from the
  profile against the Regna's. The Pure Drive has more power (high against medium-high) and more
  spin (high against medium on the same 16×19), and less comfort (medium against high). Firm poly
  mains pass more of the frame through, and hex edges wear the gut harder at its ball speed. Nine
  rating words differ from the Regna's, and Caviar over VS Touch reads "Firm · Crisp" instead of
  "Med-Firm · Crisp".
- **Two notes fixed in review** to agree with these ratings: O-Toro Tour over VS Touch no longer
  claims more power than the Caviar version, and Tour Bite over Wilson gut is "the least plush" of
  the seven rather than "the firmest".

## Tests

- **The round trip** sets the added rackets aside before converting back to v0.990
  (`ADDED_RACQUETS`), asserting each one's racket, 82 pairings and 7 gut setups.
- **Ten rackets:** the data's four plus six placeholders; the Pure Drive placeholder is gone, and
  the test's menu, keyboard and search steps use the real one.
- **Counts:** four rackets in the menu and in search, 28 gut setups. The v0.992 clearing test
  loops over the pages built so far.

## Baselines updated

Approved with screenshots on 2026-11-25, then `--update-snapshots=all`:

- **New:** one pixel view, "Pure Drive 2025" (at both sizes), and two DOM scenarios, "Pure Drive
  2025, Toroline" (ranges, "max 25", the prestretch and the splits) and "Pure Drive 2025,
  Natural gut". That makes 19 views and 28 scenarios.
- **Changed:** the racket menu, which lists the Pure Drive under Babolat: the "racket menu open"
  view at both sizes and its DOM scenario (one group and option added, the later groups'
  ids renumbered). The Percept 100D and Pro Tour 630 phone views changed too, by one button's
  hover shade (157 and 282 pixels): the menu's options sit lower now, so the pointer rests on a
  different strings button after the pick. Five views differed only below the per-pixel
  threshold and were restored.

---

## Data corrections

None: the racket is new.

## Flags left open

Since v1.12, plus these:

- **Pure Drive RA:** 68 at Tennisnerd, 69 at Tennis Warehouse. Kept 69 (Tennis Warehouse's
  strung figure for every frame).
- **Pure Drive weight and swingweight:** 315 g and 315 at Tennis.com, 318 g and 317 at Tennis
  Warehouse. Kept 318 and 317.
- **Pure Drive power:** Babolat's spec sheet says "Low-Medium", against "high" in every
  playtest. The word rests on the playtests.
- **Pure Drive stability:** one review calls it top-notch; the others find it solid for its
  weight but pushed around by heavy pace. Kept "medium".
- **The Regna's gut ratings:** Caviar over VS Touch has more power than O-Toro Tour over VS Touch
  (70 against 62). The O-Toro Tour note says the reverse, and so do the strings' own power
  ratings (38 against 30). Left as is; the Pure Drive's ratings follow the note.

## Verification

`npm run check` passes: 387 Vitest tests (the same number as v1.12; the tests above changed, none
were added), and the browser suite, 69 passed and 29 skipped on the Mac. On CI the pixel views
are skipped as well.

- **Against v0.990:** the data equals v0.990's value for value, with the declared changes and the
  Pure Drive set aside.
- **iOS:** not rebuilt; nothing native changed. The app takes the Pure Drive at its next
  `npm run build:ios`.

## File size

| | v1.12 | v1.13 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 359,353 | 406,837 | +47,484 |
| gzip | 81,924 | 89,646 | +7,722 bytes |

All of it is the Pure Drive's data: 38,693 bytes of pairings, 4,990 of gut setups and 3,802 of
racket and profile (9,509 gzipped together). Six more frames at this size would add about
46 KB gzipped.

## Still open

Unchanged from v1.12, except:

- **Common rackets:** the Pure Drive 2025 is done. Six remain, one per release, each with its
  profile shown first, then a sample of five notes: Pure Aero 2026 (offset 0), EZONE 100 2025 (0),
  Pro Staff 97 v15 (0), Blade 98 v10 (−1), Speed MP 2026 (−1), Clash 100 v3 (−2). Each one's
  rated tension range is checked for the cap.
- **The three rackets' notes:** still to be revised against the profiles, a sample of five
  first.
- **New flags:** above.

---

# v1.12 — Frame profiles

**Date:** 2026-11-23
**Base:** v1.11 (the Regna 100 at 65 RA)
**Status:** visible release and data release: each racket gets a frame profile, kept in
`racquets.json` and shown in the card. A profile holds what the frame is made of, its measured
specs, and how published reviews and players describe its play, trait by trait. The owner's calls
on 2026-11-23:
- the profile lives in the data and in the app;
- a trait is one word from a fixed list plus a line;
- only published sources count, with the Regna 100 the exception (below);
- the three rackets get profiles now, and their 246 notes are revised against them later, a
  sample of five first;
- the card shows no sources, and the texts never say who said what;
- the Pro Tour 630's texts leave out the 2020 Pro Tour 2.0, a different frame.

`TENNIS_DB.version` stays `0.990`.

---

## The frame profile

- **In the data:** each racket in `racquets.json` has a `profile`, with:
  - `edition`: which frame exactly;
  - a `summary` of 35–70 words;
  - `construction`: materials, damping and build, a name and a line each;
  - `specs`: strung weight, balance, swingweight and beam, null where no figure is published;
  - `traits`: feel, power, launch, spin, stability, comfort and control, each a word and a line;
  - `sources`: each a review, players' reports or an article, with its publisher, title, author,
    date, address and the model it covers.

  Every line cites its sources by id. The schema is `FrameProfileSchema` in `src/core/schema.ts`;
  the words and helpers are in `src/core/frame.ts`.
- **The words:**
  - feel: damped, neutral or crisp;
  - power: Tennis Warehouse's five steps (low, low-medium, medium, medium-high, high);
  - launch, spin, stability, comfort and control: low, medium or high.
- **Evidence:** a trait rests on a hands-on review or on players' reports that agree. Articles
  (maker or retailer copy, news, spec listings) give construction and specs only. A trait no
  source supports is left out.
- **The Regna 100 exception** (owner): no professional review of the 100 exists, so personal blogs
  and single players' posts count for it alone. Its profile has 13 sources:
  - five Japanese hands-on blogs;
  - Talk Tennis owners' threads;
  - Tennis Bear's user comments;
  - Tennisnerd's Regna 98 review, for the production figure only;
  - spec and launch articles.

  Most describe the 2019 frame (V2). The 2022 model (V3, the owner's) is the same frame in a new
  design.
- **No attribution in the texts** (owner, after a sample of five): the lines say how the frame
  plays, never who said it or a review site's score. Where sources disagree, the line gives the
  reading its word rests on, and the disagreement is flagged below.

| | Feel | Power | Launch | Spin | Stability | Comfort | Control | Sources |
|---|---|---|---|---|---|---|---|---:|
| Regna 100 | neutral | medium-high | medium | medium | medium | high | high | 13 |
| Percept 100D | crisp | low-medium | low | medium | medium | medium | high | 3 |
| Pro Tour 630 | damped | low | low | medium | high | high | high | 4 |

## In the card

- **A Frame row** sits last in the card, under Strings, with each trait's word ("Feel neutral",
  "Power medium-high", …). On phones the words run as one line of text, with Details beside the
  label, so the row stays short on the first screen.
- **Details** opens under the row and shows:
  - the edition and summary;
  - the specs line ("312 g strung · 3 pts HL · swingweight 318 · beam 21.5/23/21 mm");
  - the line behind each word;
  - the construction.

  It starts closed on each visit and stays open across racket switches; the button is a
  disclosure (`aria-expanded`). A racket without a profile shows no Frame row; only the
  ten-rackets test's placeholders lack one. The code is in `src/ui/frame.ts`, the styles in
  `additions.css`.
- **No sources on screen** (owner): the source list, its numbered citations and its links were
  shown in review, then taken out as clutter. The sources stay in the data, where the validators
  hold every line to them.

## Validators

- **Schema:** it checks the profile's fields, the word lists and source kinds, dates (a year,
  month or day), web addresses and 1–3 beam widths, with no unknown keys. `schemas/` is
  regenerated.
- **New rules:**
  - `profile-present`: every racket in `data/` has a profile.
  - `profile-sources`: ids are unique, every cited id is listed, every listed source is cited,
    and specs with a figure cite a source.
  - `profile-evidence`: every trait cites a review or players' reports.
  - `profile-summary`: the summary is 35–70 words.
- **`neutral-text`** now covers the profile's texts.
- **The `racket` rule skips web addresses** (owner's pick): five source addresses keep
  "racquet" in their path. No address is shown.
- **Mutation tests:** 12 for the rules, 10 for the schema, and one showing that an address may
  hold "racquet".

## Baselines updated

Approved with screenshots on 2026-11-23, then `--update-snapshots=all`:

- **New:** one pixel view, "frame details open" (at both sizes), and one DOM scenario, "frame
  details open, then the Pro Tour 630". That makes 18 views and 26 scenarios.
- **DOM scenarios:** 21 of 25 changed, each only by the Frame row: 1,092 added lines, none
  removed. The four grips scenarios don't show the card and are unchanged.
- **Pixel views:** 19 files changed. Every view showing the card moved down, since the card grew
  55 px on desktop and 125 px on a phone. The Pro Tour 630 gut table close-up differs only by
  anti-aliasing at its new position; its text is the same. Two views differed only below the
  per-pixel threshold and were restored.

---

## Data corrections

None: the profiles are new.

## Flags left open

Since v1.11, plus these from the profiles:

- **Regna 100, V2 or V3:** most sources describe the 2019 frame (V2). tennis-torasan and most
  Talk Tennis owners say the 2022 model (V3) is the same frame in a new design. Two posters
  disagree: one measures the shaft 1 mm thinner, one reads 63 RA (model unstated). Treated as one
  frame.
- **Regna 100 at Tension Lab:** 64 RA and swingweight 317, against Tennis Warehouse's 65 and the
  profile's 318. Kept.
- **Regna 100 spin:** reviewers split, from spin-frame levels to little; "medium" is the middle.
- **Regna 100 comfort:** one player reports arm pain after moving from heavier frames; the others
  find it easy on the arm.
- **Percept 100D swingweight:** 318 at Tennis Warehouse, 319 at Tennis.com. Kept 318.
- **Percept 100D comfort:** "harsh on mis-hits" rests on one tester, and the others find it
  arm-friendly. The line keeps it, since "medium" rests on it.
- **Pro Tour 630 head size:** 98 sq in by Head's outside measurement, "really 95" for some
  players. Kept 98; the frame's tension offset (−3) is the same either way.
- **Pro Tour 630 spin:** Talk Tennis players report strong spin with their own setups; the
  hands-on review finds it adequate.

## Verification

`npm run check` passes: 387 Vitest tests (357 in v1.11; the new ones cover the profile rules and
schema, and the card's Frame section), and the browser suite, 65 passed and 27 skipped on the Mac.
On CI the pixel views are skipped as well.

- **Against v0.990:** the data equals v0.990's value for value, with the declared changes. The
  round trip leaves the profile out, since v0.990 had none.
- **iOS:** not rebuilt; nothing native changed. The app takes the profiles at its next
  `npm run build:ios`.

## File size

| | v1.11 | v1.12 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 341,878 | 359,353 | +17,475 |
| gzip | 76,953 | 81,924 | +4,971 bytes |

The three profiles are 11,629 bytes of data (3,597 gzipped), 4,933 of them the sources that
aren't shown. The rest is the Frame section's code and styles.

## Still open

Unchanged from v1.11, except:

- **Common rackets:** the owner decided two rules on 2026-11-23:
  - **Tension rule:** a new frame takes the Regna 100's tensions shifted by one whole-kg offset,
    from its string-bed density and RA. For the Pure Drive 2025 the offset is +1.
  - **Natural gut:** each new racket gets the Regna's seven gut hybrids.

  Next is the Pure Drive 2025: its profile, its tensions by the rule and its 82 notes, a sample
  of five first.
- **The three rackets' notes:** their 246 notes are to be revised against the profiles, a sample
  of five first. Note order step 2 now includes the frame profile.
- **New flags:** above.

---

# v1.11 — The Regna 100 at 65 RA

**Date:** 2026-11-23
**Base:** v1.10 (a racket menu)
**Status:** data release: the specs check for the common rackets (the first step of that to-do),
and the one correction it found, the Regna 100's stiffness. The owner's calls on 2026-11-19:
Tennis Warehouse's strung figure is the RA of every frame; the new rackets carry their generation
in the name; the Regna 100 takes 65 in place of 64, and its notes change the figure and nothing
else. `TENNIS_DB.version` stays `0.990`.

---

## The specs check

For each proposed frame: the current generation, head size, string pattern and RA, from Tennis
Warehouse's spec tables ("Average Strung Specs"), checked against the maker's own pages. Nothing
is in `data/` yet: each racket comes with its pairings (Still open).

| Menu name | Generation | Head | Pattern | RA | The maker's RA |
|---|---|---:|---|---:|---|
| Babolat Pure Drive 2025 | Gen 11 | 100 | 16×19 | 69 | 72 ± 3, unstrung |
| Babolat Pure Aero 2026 | Gen 9 | 100 | 16×19 | 66 | 69 ± 3, unstrung |
| Head Speed MP 2026 | 2026 | 100 | 16×19 | 60 | not published |
| Wilson Blade 98 v10 | v10, 16×19 (April 2026) | 98 | 16×19 | 61 | not published |
| Yonex EZONE 100 2025 | 8th generation | 100 | 16×19 | 68 | not published |
| Wilson Clash 100 v3 | v3 (2025) | 100 | 16×19 | 54 | 51 on one listing |
| Wilson Pro Staff 97 v15 | v15, the "Classic" finish on v14's specs | 97 | 16×19 | 66 | not published |

- **RA:** Tennis Warehouse's figure for every frame: one method across the brands, measured
  strung, as the frame plays; it matches the Percept 100D's 66. Only Babolat publishes RA, unstrung
  and about three points higher. Retailers and reviews scatter around the lab figure (Pure Drive
  65–72, Pure Aero 66–70, Blade 61–63, EZONE 67–69, Clash 54–56, Pro Staff 64–66).
- **Head size and pattern:** the makers agree on all seven. All are 16×19, so the Percept 100D
  (18×19) and the Pro Tour 630 (18×20) stay the only dense patterns.
- **Names carry the generation**, each brand's own way (years for Babolat, Head and Yonex,
  v-numbers for Wilson), since RA moves between generations: the Blade 98 16×19 measured 62 as v9
  and 61 as v10.

## The Regna 100 at 65 RA

- **The correction:** Tennis Warehouse measures the Regna 100 at 65; the data had 64 since v0.990,
  with no source recorded. `racquets.json` now says 65, so the card, the racket menu and search
  read "65 RA · 16×19 · 100 sq in".
- **67 notes** cited the figure ("In the 64 RA frame…", "Full bed in the 64 RA frame…"). Each now
  reads 65 and nothing else in it changed: the owner's call, no parenthetical in the notes, this
  entry lists the correction. The other 15 Regna notes don't cite it. A sample of five was shown
  first: O-Toro Tour, Tour Bite Soft, SLAP (Ltd. Edition), 4G Soft and Cole.
- **By `scripts/regna-ra.ts`** (one-off): it asserts the racket stands at 64 and that the notes
  citing "64 RA" are exactly the 67 listed, each once and all in the Regna, and afterwards that
  no "64 RA" is left in `data/` or `content/`. With `--sample` it prints five and writes nothing.
- **Against v0.990:** a declared change, like v1.8's spelling. The round trip sets 65 on v0.990's
  Regna and applies the 67 edits after the other text edits: 98 fields (was 40), since 9 of the
  67 notes had an earlier edit.

## Baselines updated

Approved with screenshots on 2026-11-20 (the card, the menu, the O-Toro Tour note), then
`--update-snapshots=all`:

- **DOM scenarios:** 13 of 25, those showing the Regna card or its notes. Every changed line
  (206) is "64 RA" becoming "65 RA".
- **Pixel views:** 11 files: the default view, the card, the racket menu, filters open and
  Natural gut (Regna), each at both sizes, and compare open (desktop). Each change is under the
  0.1% tolerance (25 to 478 pixels), so a plain `--update-snapshots` would have left them out.
  Six views came out different only below the per-pixel threshold and were restored.

---

## Data corrections

- **Regna 100, RA 64 → 65**, and the figure in 67 Regna notes (above).

## Flags left open

Since v1.5, plus:

- **Pro Tour 630 at 58 RA:** the original PT630, with Twaron. No published figure was found to
  check it against (the 2020 Pro Tour 2.0, a different layup, is listed at 65). Kept.

## Verification

`npm run check` passes: 357 Vitest tests, as in v1.10 (the round trip now applies 98 text edits
and the RA), and the browser suite, 62 passed and 26 skipped on the Mac. On CI the pixel views are
skipped as well.

- **Against v0.990:** the data equals v0.990's value for value, with the declared changes.
- **iOS:** not rebuilt; nothing native changed, and the app takes the data at its next
  `npm run build:ios`.

## File size

| | v1.10 | v1.11 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 341,878 | 341,878 | 0 |
| gzip | 76,955 | 76,953 | −2 bytes |

Each change swaps one digit for another, the version number included.

## Still open

Unchanged from v1.10, except:

- **Common rackets:** the specs check is done (above). Next, the tension rule (how a frame's
  tension band follows from its specs), to the owner first; then the first racket with a sample
  of five notes, and one or two rackets per release.
- **New flag:** the Pro Tour 630's RA (above).

---

# v1.10 — A racket menu

**Date:** 2026-11-19
**Base:** v1.9 (phones and iOS)
**Status:** visible release, the first step of the owner's new to-do (common rackets, see Still
open): a UI that takes about ten rackets before any is added. The owner's picks on 2026-11-19: a
racket menu with specs, grouped by brand, in the card and in the compare window; search lists
each string once, for the racket on screen; the strings choice carries over when the racket
switches; the last racket and strings are remembered; rackets are searchable. No data changed;
`TENNIS_DB.version` stays `0.990`.

---

## The racket menu

- **One button in the Racket row:** it names the racket on screen ("Regna 100 ▾") and opens a list
  of every racket, grouped by brand: brands A–Z, then models A–Z (Head: Pro Tour 630; Yonex:
  Percept 100D, Regna 100), each with its spec ("64 RA · 16×19 · 100 sq in"). The racket on
  screen is ticked. A first visit still opens on Regna 100, the first in `racquets.json`.
- **Why:** the row held the three names side by side, and on phones it scrolled sideways once a
  fourth didn't fit. The menu was checked with ten, seven placeholder rackets injected in the
  browser only (nothing in `data/` changed).
- **Keyboard:** a listbox. ↑ ↓ Home End move, Enter or Space picks, Escape closes and puts focus
  back on the button; Tab or a click elsewhere closes it.
- **Phones:** the list spans the card and scrolls past 70% of the screen height.
- **The compare window** uses the same menu in place of its three tabs, and still opens on the
  racket on screen. Escape closes the menu, not the window.

## The strings choice carries over

- **Switching racket keeps the strings on screen:** Yonex on the Regna 100 stays Yonex on the Pro
  Tour 630, and Natural gut stays Natural gut (a racket with no gut pairings shows its message).
  Until now each racket kept its own choice.
- **Remembered:** the app opens on the last racket and strings, in the browser and in the iOS app
  (`localStorage`, key `strung.choice`). A first visit opens on Regna 100 × Toroline. A racket or
  brand the data no longer has falls back to the first, and storage that refuses (a private
  window) is survived: the app opens as on a first visit.

## Search

- **Each string once:** results list each string and hybrid once, matched against its own fields
  and the racket on screen's tension and note, and open in that racket. Until now each string
  came once per racket (three "Caviar" results). Gut pairings are the racket on screen's (7 on
  the Regna 100, was 21).
- **Rackets come first:** a new group, the model with brand and spec under it and a racket icon;
  choosing one switches to it ("pro tour" finds the Pro Tour 630).
- **Placeholder:** "Rackets, strings, grips… (try 'caviar', 'gut', 'hex')", and on phones "Search
  rackets, strings, grips…" (were "Search strings, grips, gut pairings…" with and without the
  hint).

## Under the hood

- **One card:** the card, its strings row and the filter badge exist once, at the top of the
  Strings page; each racket's page had its own. The legend and the version line come once, after
  the pages.
- **Pages built on first show:** a racket's page (its tables and its gut view) is built the first
  time it is shown and kept. At load the page holds 124 table rows (117 + 7 gut), was 302 (281 +
  21). Filters cover every page built so far, and a page built while a filter is on is filtered
  when it is shown; the compare ticks follow onto a new page.
- **Code:** `src/ui/picker.ts` (the menu, card and compare window) and `src/ui/prefs.ts` (the
  remembered choice) are new; the order comes from `racquetGroups` in `src/core/labels.ts` (no
  DOM), the index from `buildSearchIndex(db, racquet)`. `state.brand` replaces the per-racket
  choice; the bus gains `page` (a page was built) and `pick` (a menu choice). The CSS for the
  racket row and the compare tabs is gone.
- **Ten rackets proved from data:** `tests/unit/fourth-racquet.test.ts` became
  `ten-rackets.test.ts`. Seven placeholder rackets (Pure Drive, Pure Aero, Speed MP, Blade 98,
  Clash 100, Pro Staff 97, EZONE 100) with the Regna 100's pairings: the menu, the pages, the
  carry-over, the remembered choice, filters, compare and search follow.

## Baselines updated

Approved with screenshots on 2026-11-19 (the menu, with three rackets and with ten, and the
placeholder), then `--update-snapshots=all`:

- **Pixel views:** 17 (was 16). New: the racket menu, open. "compare modal panel, Percept tab"
  became "compare modal panel, Percept", picked from the menu. Changed: the default view, Percept
  100D, Pro Tour 630, the card, filters open, Natural gut (Regna), Natural gut table (Pro Tour
  630), compare open (the card), the search palette (each string once) and the gut search
  results (one racket's pairings): 20 files. Unchanged: topbar, Grips, grip filters, the Yonex
  grip row and the search field; two of them (grip filters and the search field, desktop) came
  out different only below the per-pixel threshold and were restored.
- **DOM scenarios:** 25 (was 20). New: racket menu by keyboard, racket menu open, strings carry
  over on a racket switch, remembered racket and strings after a reload (a new `reload` step in
  `tests/visual/dom.ts`), and search Enter switches to a racket. "compare 2 strings + hybrid,
  Percept tab" became "…, Percept"; "search jumps to a gut pairing" switches to the Percept 100D
  first, since search lists the racket on screen's pairings. All 19 that kept their name changed,
  since each holds the compare window's header.
- **The offline check** counts 124 rows (was 302) and switches racket through the menu.
- 3.4 MB of pixel baselines and 1.4 MB of DOM baselines.

---

## Data corrections

None.

## Flags left open

Unchanged since v1.5.

## Verification

`npm run check` passes: 357 Vitest tests (339 in v1.9: the ten-rackets test has 14, the
fourth-racquet test had 11; the remembered choice, 9; the racket order, 2; search, 2 more, the
racket on screen's note and the Rackets group; and two smoke tests, no other page built at load
and a page first shown under a filter is filtered) and the browser suite, 62 passed and 26
skipped on the Mac. On CI the pixel views are skipped as well.

- **iOS:** `npm run build:ios` synced, `xcodebuild` for the simulator succeeds, and in the
  Simulator the menu switches racket and the choice survives quitting and reopening the app.

## File size

| | v1.9 | v1.10 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 335,502 | 341,878 | +6.4 KB (+1.9%) |
| gzip | 74,828 | 76,955 | +2.1 KB |

The menu and the remembered choice, and the menu's styles with their comments (CSS isn't
minified). The page builds less at load (124 rows, was 302).

## Still open

Unchanged from v1.9, except:

- **New: common rackets.** The owner's to-do (2026-11-19): 5–7 commonly used rackets beside the
  three, so the app is useful to other players. Proposed: Babolat Pure Drive, Babolat Pure Aero,
  Head Speed MP, Wilson Blade 98 and Yonex EZONE 100, then Wilson Clash 100 and Wilson Pro Staff
  97. Each needs a `racquets.json` entry and a pairing (tension and note) for all 82 strings and
  hybrids, gut pairings optional: about 4,300 words and +9.4 KB gzip per racket. In order:
  1. the specs check: generation, RA, pattern and head size against a spec source;
  2. the tension rule: how a frame's tension band follows from its specs, to the owner first;
  3. the first racket with a sample of five notes, then one or two rackets per release.

---

# v1.9 — Phones and iOS

**Date:** 2026-11-19
**Base:** v1.8 (racket + strings at the centre)
**Status:** visible release, phones and touch screens only: three items from Still open (the
phone grip cards, iOS zooming into text fields, the palette hint on phones), picked by the owner
on 2026-11-19. Desktop looks as it did. No data changed; `TENNIS_DB.version` stays `0.990`.

---

## Grip cards on phones

- **Model and specs each get a line:** "MODEL: KGT100" (with the pack variants under it), then
  "SPECS: 0.50mm / 29mm × 105cm". Until now the two cells shared a line with no gap, so the specs
  ran straight into the model ("KGT1010.33mm"), and the separator dot landed after the last pack
  variant. The replacement grip cards already had a "Specs:" line and are unchanged.

## No zoom into text fields on iOS

- **16px on phones and touch screens:** iOS zooms the page into any text field under 16px when it
  gets focus. The search palette's field was 15.7px and the two filter searches 13.6px; all
  three are now 16px wherever the screen is at most 900px wide or the pointer is a finger (an
  iPad too). Pinch zoom is untouched: the fix is the font size, not a viewport limit.
- **Checked in the iOS app** (Simulator, iPhone 18 Pro): tapping the filter search and typing
  "caviar", and tapping the palette's field, leave the page at its width and scale.

## The palette on phones

- **The keyboard hint is hidden** ("Esc to close · ↑↓ to navigate") on the same screens: it means
  little without a keyboard, and it ran off the right edge. `search.css` already hid it below
  900px, but the palette's own rule in `chrome.css` showed it again.
- **Shorter placeholders** on the same screens, since at 16px the desktop ones were cut off
  ("…gut pairings… (tr"): "Search strings, grips, gut pairings…", "Search by name, shape,
  notes…" and "Search by name, model, notes…". Each field names its short text in
  `data-short-placeholder`; `src/ui/placeholders.ts` swaps it in and back as the screen changes.
  Desktop keeps "… (try 'caviar', 'gut', 'hex')" and the rest as they were.

## Baselines updated

Approved with screenshots on 2026-11-19:

- **Pixel views, phone only:** Grips, grip filters, the Yonex grip row (the card), filters open
  (the placeholder), the search field and the search palette (the hint): 6 files.
- **DOM scenarios:** 6 of 20 show a search field, which now carries `data-short-placeholder`.
- **A gap found on the way:** `--update-snapshots` rewrites only the views that fail, and the
  hint was 277 pixels of the phone palette view, under the 0.1% tolerance, so its old baseline
  still passed. The baselines were rewritten with `--update-snapshots=all`; four views that came
  out different only below the per-pixel threshold (anti-aliasing, 0 pixels over it) were
  restored. CLAUDE.md now says so.

---

## Data corrections

None.

## Flags left open

Unchanged since v1.5.

## Verification

`npm run check` passes: 339 Vitest tests (337 in v1.8, plus two for the placeholders: short on a
small screen and back when it widens, untouched on a large one) and the browser suite, 55 passed
and 21 skipped on the Mac. On CI the pixel views are skipped as well.

- **iOS:** `npm run build:ios` synced, `xcodebuild` for the simulator succeeds, and the app was
  checked in the Simulator as above.
- **Desktop:** the field sizes (15.7px and 13.6px), the hint and the placeholders are unchanged.

## File size

| | v1.8 | v1.9 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 334,138 | 335,502 | +1.4 KB (+0.4%) |
| gzip | 74,333 | 74,828 | +0.5 KB |

The new rules with their comments (CSS isn't minified), the placeholders module and the three
short placeholders.

## Still open

Unchanged from v1.8, except:

- **Closed:** the phone grip cards, iOS zooming into text fields, and the palette hint on phones.
- **Still open from the iOS item:** tapping the status bar to scroll to the top can't be checked
  in the Simulator; it needs a device.

---

# v1.8 — Racket + strings at the centre

**Date:** 2026-11-19
**Base:** v1.7 (the stringing log removed)
**Status:** visible release, the second of the redesign: the racket + string choice in one card
at the top of the page, natural gut as one more choice of strings, and "racket" wherever the app
speaks (the owner's calls on 2026-11-19). Six phrases in the data changed spelling and nothing
else; `TENNIS_DB.version` stays `0.990`.

---

## The card

- **One card at the top of each racket's page:** the title names the pair, "Regna 100 ×
  Toroline", in large type; under it the brand and spec ("Yonex · 64 RA · 16×19 · 100 sq in"),
  then a Racket row and a Strings row. The title follows the choice. While filters span every
  brand, "— showing all" sits on the spec line.
- **Out of the top bar:** the racket tabs. The top bar now holds Strings / Grips, Search and
  Filters, the same on every page. The "Yonex Regna 100 · 64 RA · …" line above the tables went
  into the card; the Grips page keeps its own line.
- **Phone:** the card is tighter and the racket names stay on one line; the row scrolls sideways
  if a fourth frame doesn't fit.

## Natural gut as a choice of strings

- **"Natural gut"** is the last choice in every racket's Strings row, in the gut amber. Picking it
  shows what the strip held (the gut intro, the two gut cards and the pairings table, gut mains
  first), and the title reads "Regna 100 × Natural gut".
- **Gone:** the collapsible gut strip at the top of each page, with its toggle and pairing count.
- **Filters** match strings and hybrids only, so while they span every brand the gut view steps
  aside and its button greys out with the rest; clearing them brings back whatever was picked,
  natural gut included.
- **Search:** a gut pairing result opens that racket's Natural gut view and flashes the row (it
  expanded the strip before).
- **At load:** the gut tables now render with the page instead of on first expand, so the page
  holds 302 table rows (281 + 21).

## "Racket", never "racquet"

The owner's call: the app says "racket" in everything a reader sees.

- **UI:** the card's row label, and the message a racket without gut pairings shows.
- **Data and copy:** six phrases changed spelling and nothing else, by
  `scripts/racket-spelling.ts` (one-off; it asserts each phrase occurs once where listed and that
  no "racquet" is left in any text of `data/` or `content/`):
  - Revolution, Regna note: "lower racket-head speeds";
  - Ultimum Leather, feel: "direct racket feedback";
  - Synthetic Leather Excel Grip: "pre-installed on many Yonex rackets";
  - Tourna Grip XL: "16″ extended-length rackets";
  - Synthetic Pro (Tourna): "from their racket manufacturer";
  - the Yonex About box: "the world's largest racket sports manufacturer".
- **Kept that way:** a validator rule, `racket`, fails on "racquet" in any text of `data/` or
  `content/` (three mutation tests), and a smoke test checks the rendered page. Code names
  (`racquets.json`, `racquetId`, `data-racquet`, CSS classes) keep the old spelling: nobody
  reads them. CLAUDE.md records the convention.
- **Against v0.990:** the six phrases are declared changes in the round trip: the note joins the
  text edits (40 fields, was 39), the four grip texts are applied to v0.990's grips, and the About
  box is changed back before its verbatim check.

## Baselines updated

Approved with screenshots on 2026-11-19, then `npx playwright test --update-snapshots`:

- **Pixel views:** 16 (was 15). New: the card, close up. "gut hybrids expanded" and "gut strip
  expanded (Pro Tour 630)" became "Natural gut (Regna)" and "Natural gut table (Pro Tour 630)",
  a close-up of the gut view. Changed: the default view, topbar, Percept 100D, Pro Tour 630,
  filters open, the search palette, compare open (desktop) and the search field (phone): 14 files.
  Unchanged: Grips, grip filters, the Yonex grip row, the compare panel and the gut search
  results.
- **DOM scenarios:** 20 (was 19). "gut strips expanded on all racquets" became "Natural gut on all
  racquets", and "Natural gut, filter, clear" is new; the other 18 changed too, since each holds
  the top of the page.
- **The offline check** counts 302 rows (was 281).
- 3.1 MB of pixel baselines and 1.1 MB of DOM baselines.

---

## Data corrections

None. The six spelling changes above correct nothing.

## Flags left open

Unchanged since v1.5.

## Verification

`npm run check` passes: 337 Vitest tests (330 in v1.7: the card, the Natural gut choice on every
racket and under filters, the gut rows at load, no "racquet" on the page, and the `racket` rule's
three mutation tests; the gut strip's pairing-count test is gone, and its other tests now open
the Natural gut view) and the browser
suite, 55 passed and 21 skipped on the Mac (the DOM scenarios and the offline check run at one
viewport). On CI the pixel views are skipped as well.

- **Against v0.990:** the data equals v0.990's value for value, with the six declared phrases.

## File size

| | v1.7 | v1.8 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 334,676 | 334,138 | −0.5 KB (−0.2%) |
| gzip | 74,159 | 74,333 | +0.2 KB |

The gut strip's styles and toggle went; the card's styles came.

## Still open

Unchanged from v1.7, except:

- **Closed:** the card and the Natural gut choice (decided in v1.7).

---

# v1.7 — The stringing log removed

**Date:** 2026-11-19
**Base:** v1.6 (rating words from the score)
**Status:** visible release, the first of the redesign. The owner's decisions on 2026-11-19:
Strung is now for telling how racquet + string combinations play, not a personal tool, so the
stringing log goes (it may come back later); the racquet + string choice becomes the centre of
the page, with the gut hybrids as one more choice in the strings row (the next release); and the
pixel and DOM comparison with v0.990's page is retired, since the redesign changes every view.
No data changed; `TENNIS_DB.version` stays `0.990`.

---

## The log removed

- **Gone from the page:** the Log strip and panel in every racquet (adding, editing, pinning,
  "Clear all", rating stars), the Export / Import backups, the "Strung … @ 23/24 kg" or "nothing
  logged yet" slot in the racquet line, and log entries in search results. The search field's
  placeholder now reads "Search strings, grips, gut pairings…" (was "…log entries…").
- **Gone from the code:** `src/core/log` (schema, model, merge, store, tension parser),
  `src/ui/log.ts` and `src/ui/context-line.ts`, `src/platform/storage.ts` and `files.ts`,
  `src/styles/log.css` and the log rules in `chrome.css` and `additions.css`, the `log`
  event, and `schemas/stringing-log.schema.json`. The tension limits (5–40 kg) moved into the
  data schema, their only user now.
- **iOS:** `@capacitor/preferences`, `@capacitor/filesystem` and `@capacitor/share` were used
  only by the log and are uninstalled; the iOS project is synced and builds for the simulator.
- **Logs already saved** in a browser (`localStorage`, key `tennis_log_v2`) or in the iOS app
  (Preferences) are left where they are, unread: nothing deletes them, so a returning log can
  pick them up.

## The comparison with v0.990 retired

Until v1.6 every release was checked against v0.990's page, view by view (15 pixel views at two
sizes, 25 DOM scenarios), with each visible change reproduced on the old page by a patch. The
redesign changes the top of every page, so that comparison is replaced by baselines of the app
itself (`tests/visual/baselines`):

- **Pixel baselines:** the same 15 views, the first screen or a close-up, at 1440×900 and
  390×844, threshold 0.1 and at most 0.1% of pixels differing. Made on macOS; they run only
  there, because CI runs Linux, which renders text differently. 3.2 MB.
- **DOM baselines:** 19 of the 25 scenarios (the six log ones went with the log), the rendered
  DOM as normalised text; elements that don't render are left out, which keeps them to 1.2 MB
  instead of 15 MB. They run everywhere, CI included.
- **Updating them** is deliberate: a visible change is approved with screenshots first, then
  `npx playwright test --update-snapshots` in the same commit.
- **Kept:** the data round trip against v0.990 (`tests/data/legacy-roundtrip.test.ts`); the
  functions that apply the declared data changes moved from `tests/visual/legacy-fixes.ts` to
  `tests/data/v0990-changes.ts`.
- **Retired:** `legacy-fixes.ts` (patches A–K), the legacy static server, the CSS split test
  (`tests/data/legacy-css.test.ts`), the DOM-difference unit test, and the backup test.
- **A harness fix found on the way:** the view tests now pause 150 ms after each click. The filter
  panel focuses its search field 10 ms after opening; under load the next click sometimes came
  first, and the field kept its focus ring only sometimes ("filters open, Hex active" failed 1 run
  in 40). Since then 60 of 60 runs of that view and 208 of 208 of the suite passed under load.
- **Checked that they catch changes:** a changed word (a rating cut-off moved) fails 12 DOM
  baselines; a changed colour (the wordmark line) fails the desktop topbar view.
- **The first CI run failed, and was fixed before deploying:** the DOM baselines include the
  palette's shortcut hint, which reads "⌘K" on a Mac and "Ctrl K" on Linux. The harness now pins
  `navigator.platform` to a Mac in every test; with Linux pinned locally, all 19 DOM baselines
  fail the same way CI did.

---

## Data corrections

None.

## Flags left open

Unchanged since v1.5.

## Verification

`npm run check` passes: 330 Vitest tests (372 in v1.6: the log's unit tests, its fourth-racquet
and search cases, the CSS split test and the DOM-difference test are gone) and the browser suite,
52 passed and 20 skipped on the Mac (the DOM scenarios run at one viewport). On CI the pixel
views are skipped as well.

- **Against v0.990:** the data equals v0.990's value for value, as before.
- **iOS:** `npm run build:ios` synced, and `xcodebuild` for the simulator succeeds without the
  three plugins.

## File size

| | v1.6 | v1.7 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 443,775 | 334,676 | −109.1 KB (−24.6%) |
| gzip | 103,424 | 74,159 | −29.3 KB |

The log validated its backups with Zod at run time; without it the bundle carries no Zod at all,
and the three plugins' web code is gone too.

## Still open

Unchanged from v1.6, except:

- **Next (decided):** the racquet + string choice in one card at the top ("Regna 100 ×
  Toroline", a Racquet row and a Strings row, the racquet tabs out of the top bar), and the gut
  hybrids as "Natural gut", one more choice in the Strings row, instead of the strip at the top.
- **Closed:** the log's open items (the iOS date-field width; the log itself).

---

# v1.6 — Rating words from the score

**Date:** 2026-11-18
**Base:** v1.5 (stiffness figures re-checked)
**Status:** visible release. Phase 2 step 4, second half
(`docs/phase-2-data-model.md`, D5): every rating is stored as its score, and
the word beside its bar is derived from the score on one of two scales, so a
word always agrees with its bar. The owner chose this (option A) on
2026-11-18 after a sample of five and before-and-after screenshots. No score
and no bar changes; `TENNIS_DB.version` stays `0.990`.

With this release, Phase 2 is complete.

---

## The scales

| Scale | Ratings | Words, from the score shown |
|---|---|---|
| Amount | power, spin, tackiness, absorption, gut protection | Low · Low-Med 35 · Medium 45 · Med-High 60 · High 75 · Very High 85 · Elite 95 |
| Quality | control, comfort, durability | Low · Moderate 45 · Good 60 · Very Good 78 · Excellent 88 · Outstanding 95 |

- Gut pairings use the same scales (their power and spin are amounts, comfort
  a quality); their own words ("Med" and the rest) are gone.
- The cut-offs were chosen to change the fewest of today's words (a search over
  cut-offs in steps of 5; for quality, 78 and 88 fit today's words better than
  80 and 85): **137 of the 458 ratings change**, 15 of them only in
  spelling ("Mod-High" → "Med-High", "Med" → "Medium" and so on). Where two
  neighbouring words used to share scores, the score now decides.
- `ratingLabel()` and `ratingBar()` in `src/core/ratings.ts` derive the
  word and bar; the data stores `power: 38`, not `{ score: 38, label: "Low-Med" }`.
- Longer words ("Outstanding", "Very Good") widen some rating columns a
  little, so a few rows wrap one more line of notes.
- One spin rating loses a note: "High (Slice)" is now "High".

## Words that change (137)

| Rows | Rating | Was → now | Ratings | e.g. (score) |
|---|---|---|---:|---|
| Strings | Control | Excellent → Outstanding | 6 | O-Toro Tour 95, Tour Bite 95, Confidential 96 |
| Strings | Control | Very High → Very Good | 4 | Vamos 85, A5 82, O-Toro Snap Tour Flex 85 |
| Strings | Spin | Very High → Elite | 1 | O-Toro 95 |
| Strings | Comfort | High → Very Good | 15 | O-Toro 82, Toro Toro 78, Enso Pro (Carbon) 82 |
| Strings | Power | Med-Low → Low-Med | 2 | O-Toro Octa 42, Vivo 42 |
| Strings | Spin | Mod-High → Med-High | 6 | O-Toro Snap 68, Hyper-G Round 70, Poly Tour Fire 68 |
| Strings | Spin | High → Very High | 2 | Wasabi 85, Confidential 85 |
| Strings | Control | Good → Very Good | 2 | Wasabi 78, Revolution 78 |
| Strings | Spin | Moderate → Med-High | 3 | Enso Pro (Carbon) 60, Poly Tour Strike 62, Tour Sniper 65 |
| Strings | Control | Moderate → Good | 3 | Snapper 62, SLAP (Ltd. Edition) 65, Tour Mako 60 |
| Strings | Spin | Low-Med → Medium | 1 | Truffle X 45 |
| Strings | Control | Low-Med → Low | 1 | Truffle X 40 |
| Strings | Comfort | Elite → Outstanding | 1 | Truffle X 98 |
| Strings | Comfort | Low-Mod → Moderate | 4 | Hyper-G 45, Tour Sniper 45, ALU Power Rough 45 |
| Strings | Spin | High (Slice) → High | 1 | Barb Wire 78 |
| Strings | Spin | Moderate → Medium | 4 | Outlast 58, Poly Tour Pro 55, Poly Tour Force 58 |
| Strings | Spin | Low → Low-Med | 3 | Vanquish (Multi) 35, Tour Super 850 (Multi) 35, Quasi-Gut Armor 35 |
| Strings | Comfort | Very High → Excellent | 4 | Vanquish (Multi) 92, Poly Tour Air 90, Tour Super 850 (Multi) 92 |
| Strings | Comfort | Low-Mod → Low | 3 | Poly Tour Spin 42, 4G 42, 4G Rough 40 |
| Strings | Power | Med-Low → Medium | 8 | ALU Power 50, ALU Power Rough 48, ALU Power Spin 50 |
| Strings | Spin | Medium → Med-High | 6 | ALU Power 60, ALU Power Soft 60, 4G 60 |
| Strings | Comfort | Med-Low → Moderate | 5 | ALU Power 50, ALU Power Spin 50, Adrenaline 50 |
| Strings | Power | Medium → Med-High | 4 | ALU Power Soft 60, ALU Power Feel 60, M2 Pro 60 |
| Strings | Comfort | Med-High → Good | 1 | ALU Power Soft 70 |
| Strings | Comfort | Medium → Good | 3 | ALU Power Feel 60, 4G Soft 60, Big Hitter Silver Rough 60 |
| Strings | Power | Low → Low-Med | 2 | 4G 38, 4G Rough 36 |
| Strings | Spin | Med-Low → Medium | 1 | Element 50 |
| Strings | Comfort | Medium → Moderate | 1 | Eco Power 58 |
| Grips | Absorption | High → Med-High | 1 | Hi-Soft EX Ultra-Thin 72 |
| Grips | Absorption | Excellent → Very High | 7 | Punch (Perforated) 93, Ana Spiral 90, Legend 92 |
| Grips | Tackiness | Moderate → Med-High | 1 | Forte 60 |
| Grips | Absorption | Very High → High | 2 | Wet Super Grap 82, Wet Super Grap (JP) 82 |
| Grips | Tackiness | Elite → Very High | 1 | Wet Super Grap (JP) 93 |
| Grips | Absorption | Moderate → Med-High | 1 | Wave Grap 62 |
| Grips | Tackiness | Moderate → Low-Med | 1 | Dry Super Grap 42 |
| Grips | Absorption | Med-Low → Medium | 1 | Tac 45 |
| Grips | Durability | Medium → Good | 2 | Tac 60, Mega Tac 60 |
| Grips | Absorption | Low → Low-Med | 1 | Mega Tac 35 |
| Grips | Absorption | High → Very High | 1 | Tourna Grip Pro Thin 88 |
| Gut pairings | Spin | Med → Med-High | 4 | gh-regna-1 60, gh-regna-6 60, gh-percept-3 60 |
| Gut pairings | Gut protection | Med-Low → Medium | 2 | gh-regna-2 50, gh-percept-2 50 |
| Gut pairings | Spin | Med-Low → Medium | 1 | gh-regna-3 50 |
| Gut pairings | Power | Med → Med-High | 7 | gh-regna-5 62, gh-regna-7 60, gh-percept-5 62 |
| Gut pairings | Power | Med-Low → Medium | 3 | gh-regna-6 55, gh-percept-7 52, gh-pt630-5 52 |
| Gut pairings | Spin | Med → Medium | 2 | gh-percept-1 58, gh-percept-7 58 |
| Gut pairings | Spin | Med-High → High | 1 | gh-percept-4 75 |
| Gut pairings | Gut protection | Med → Med-High | 1 | gh-pt630-1 60 |

`scripts/derive-rating-words.ts` (one-off) ran on a sample batch first (the
five the owner saw). Before writing, it asserts 458 ratings, 137 words that
change, 15 of them only in spelling, and each sample change.

**Validation.** The schema stores a whole score from 0 to 100 and nothing
else; a stored word fails it. The per-axis word lists and the `rating-order`
rule are retired: a derived word can't be out of order.

## Declared differences from v0.990 (added in v1.6)

| Difference | Visible? | Legacy patch |
|---|---|---|
| 137 rating words derived from their scores | yes | K: `V0990_RATING_WORDS` derives legacy's words from its own bar widths (it throws unless 137 change), and the 310 words beside the rating bars on the page follow (strings and hybrids in three racquets, grips once). Compare and the gut table draw from the data |

The round-trip test applies the same function to the v0.990 blob.

---

## Data corrections

None: the words follow the scores, which are unchanged.

## Flags left open

Unchanged since v1.5.

## Verification

`npm run check` passes: 372 Vitest tests (352 in v1.5), 62 Playwright tests.

- **New tests:** 26 in `tests/unit/ratings.test.ts` (each word's first score
  and the one below it on both scales, the bar, a missing rating); schema
  checks for a score that isn't whole, a stored word on a string and on a gut
  pairing, and a JSON Schema check for a stored word. Four `rating-order`
  tests and five word-list schema tests are retired.
- **Against v0.990:** with every declared change applied to the blob, the data
  equals v0.990's value for value and serialises to the same length.
- **Parity:** all 16 pixel views and 25 DOM scenarios pass. Without patch K,
  33 of them fail.

## File size

| | v1.5 | v1.6 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 455,640 | 443,775 | −11.9 KB (−2.6%) |
| gzip | 104,075 | 103,424 | −0.7 KB |

The data no longer stores a word with each of the 458 ratings.

## Still open

Unchanged from v1.5, except:

- **Closed:** the rating words (D5). Phase 2 has no step left.

What remains is listed above (the disputed stiffness figures, the unclear
Racketpedia entries) and under v1.5 and earlier: the gut hybrid section's
layout, the 15 ranking-style notes, the phone grip cards, iOS input zoom and
date width, the palette hint on phones, the feel taxonomy, the grip Thin chip,
the Wasabi X record.

---

# v1.5 — Stiffness figures re-checked

**Date:** 2026-11-18
**Base:** v1.4 (one colour per tag label)
**Status:** data release with four visible figure changes. Phase 2 step 4,
first half (`docs/phase-2-data-model.md`, D1): every stiffness figure checked
against Racketpedia, with a second lab as tie-breaker where the two disagree.
The owner approved the method after a sample of five, the classification
after the full comparison, and the handling of the disagreements after the
second-lab check, all on 2026-11-18. `TENNIS_DB.version` stays `0.990`.

---

## Method

- **Racketpedia**, the lab the footers cite, read from its brand listings for
  all seven brands (163 entries; average static stiffness in kg/mm, per colour
  and gauge). Each string was matched by name, colour and gauge: the 1.25
  gauge or the nearest one sold, or the gauge whose figure we already store.
- **Where the two disagree**, Tennis Warehouse University's string database
  (`twu.tennis-warehouse.com`) was the tie-breaker. It measures dynamic
  stiffness in lb/in, a different property: on the 22 string-and-gauge pairs
  where Racketpedia agrees with our data, it explains only a third of the
  variation (r = 0.57, about ±0.09 kg/mm), so it can rank but not supply a
  figure. No manufacturer publishes stiffness for these strings.
- **Racketpedia's own figures vary**: ALU Power at 1.25 reads 0.78 in Silver
  and up to 1.05 in other colours; Outlast's 1.25 sits above its 1.20 and 1.30;
  Hyper-G Soft's 1.30 page reads "105 kg/mm".

## Results

| | Strings | |
|---|---:|---|
| Confirmed | 30 | Our figure equals Racketpedia's; now `source: "Racketpedia"`, `retrieved: "2026-11"` and the `pages` it comes from. Six match at a gauge other than 1.25 (Mach-10 and Element at 1.30, Hyper-G Round at 1.20; Sync, Zero and Tour M8 store a range across two gauges). Hyper-G Round's "~" goes: the figure is a measurement now |
| Adopted | 4 | Below |
| Disputed, ours kept | 20 | Below |
| Not on Racketpedia | 15 | Vamos, Cash, A5 Infrared, O-Toro Octa, O-Toro Spin, O-Toro Snap, O-Toro Snap Tour Flex, Poly Tour Force, Soldier, Game Changer, Tour Mako Short Fin, M2 Pro, Pro 16, Quasi-Gut Armor, Pro Tour |
| Unclear entry | 3 | "Big Hitter Rough" names no colour (our Blue Rough or Silver Rough); "Tour Super 850 Pro" may not be our Tour Super 850 |

**Adopted (visible):**

| String | Was | Now | Why |
|---|---|---|---|
| 4G | Very Firm · 1.10 | Very Firm · 1.18 | TWU ranks 4G clearly stiffest (259 lb/in) |
| Barb Wire | Medium · ~0.95 | Med-Soft · 0.90 | TWU sides with Racketpedia (183 lb/in) |
| Confidential Soft | Medium (no figure) | Med-Soft · 0.85 | a figure where we had none; 0.85–0.90 across three gauges |
| Vanquish (Multi) | Soft (no figure) | Very Soft · 0.55–0.65 | a figure where we had none; no 1.25 tested, so 1.20 and 1.30 |

No Firm/Soft chip moves. Bars follow the scale: 4G 93% → 100%, Barb Wire
70% → 63%, Confidential Soft 70% → 55%, Vanquish 45% → 18%.

**Disputed: Racketpedia's reading kept in the data, ours shown.** Where TWU
sides with our figure, or there is no second source, or Racketpedia's reading
looks wrong, our figure stays (`source: "legacy"`), and the reading is
stored as `stiffness.disputed` with its page. By the owner's decision the notes
say nothing of it: the disclaimer is irrelevant to the reader.

| String | Brand | Shown | Racketpedia | TWU (lb/in, 1.25) | Why ours stays |
|---|---|---|---|---:|---|
| ALU Power | Luxilon | Firm · 1.05 | 0.78 at 1.25 | 209 | sides with ours |
| ALU Power Rough | Luxilon | Firm · 1.05 | 0.72 at 1.25 | 209 | sides with ours |
| ALU Power Soft | Luxilon | Med-Soft · 0.85 | 0.73 at 1.25 | 198 | sides with ours |
| ALU Power Spin | Luxilon | Med-Firm · 1.00 | 0.83 at 1.27 | 214 (1.27) | sides with ours |
| ALU Power Feel | Luxilon | Medium · 0.95 | 0.78 at 1.20 | 187 (1.20) | sides with ours |
| 4G Rough | Luxilon | Very Firm · 1.10 | 0.83 at 1.25 | 216 | sides with ours |
| 4G Soft | Luxilon | Medium · 0.95 | 1.13 at 1.25 | 217 | sides with ours |
| Adrenaline | Luxilon | Med-Firm · 1.00 | 0.77 at 1.25 | 203 | sides with ours |
| Eco Power | Luxilon | Med-Firm · 1.00 | 1.05 at 1.25 | 195 | sides with ours |
| Big Hitter Black 7 | Tourna | Med-Firm · 1.00 | 0.77 at 1.25 | 223 | sides with ours |
| Revolution | Solinco | Med-Firm · ~1.00 | 1.15 at 1.25 | 213 | sides with ours |
| TB Diamond Rough | Solinco | Medium · ~0.95 | 0.55 at 1.25 | 192 | sides with ours |
| Poly Tour Drive | Yonex | Med-Soft · ~0.90 | 0.60 at 1.25 | 196 | sides with ours |
| Outlast | Solinco | Med-Soft · ~0.90 | 1.08 at 1.25 | 208 | between the two |
| SLAP (Ltd. Edition) | ReString | Medium · ~0.95 | 0.75 at 1.23 | — | no data |
| Paradox Pro | Grapplesnake | Medium · ~0.95 | 0.70 at 1.29 | — | no data |
| Aspera Triplum | Grapplesnake | Med-Soft · ~0.85 | 0.50 at 1.19 | — | no data |
| Irukandji | Grapplesnake | Med-Soft · ~0.85 | 0.60 at 1.17 | — | no data |
| Hyper-G Soft | Solinco | Medium · 0.95 | 1.10 at 1.25 | 172 | as stiff as Hyper-G; its 1.30 page reads "105" |
| Truffle X | Toroline | Very Soft | 0.20 at 1.30 | — | a third of natural gut (0.55) |

## Declared differences from v0.990 (added in v1.5)

| Difference | Visible? | Legacy patch |
|---|---|---|
| Five stiffness labels and four bars (the adopted figures, Hyper-G Round's "~") | yes | J: the labels set on legacy's data (it throws unless each reads as expected), `V0990_STIFFNESS_SCALE` redraws exactly four bars, and the 15 rows on the page follow |
| Two text corrections (below) | yes | G, with v1.2's edits (39 changed texts now) |

---

## Data corrections

- **4G:** 1.10 → 1.18 kg/mm (Racketpedia, 1.25 Gold). Its Regna note gave
  1.10; it now reads "Firmer than ALU Power (1.18 kg/mm)" and ends with
  "(Earlier notes gave 1.10 kg/mm.)".
- **Barb Wire:** ~0.95 → 0.90 kg/mm (Racketpedia, 1.25 Black), so Medium →
  Med-Soft; its feel text "medium stiffness" now reads "medium-soft
  stiffness".
- **Confidential Soft** 0.85 and **Vanquish** 0.55–0.65: figures where the
  band was an estimate (Medium → Med-Soft, Soft → Very Soft).

## Flags left open

- **The 20 disputed figures** above, in the data and here, not in the notes.
- **The 3 unclear entries** (Big Hitter Blue Rough and Silver Rough, Tour
  Super 850).
- From v0.989, unchanged: Poly Tour Pro's figure (now confirmed by
  Racketpedia at 1.05) against its softer reported feel, still flagged in its
  note; Eco Power's conflict is now this release's dispute (Racketpedia 1.05,
  ours 1.00, TWU sides with ours).

## Verification

`npm run check` passes: 352 Vitest tests (349 in v1.4), 62 Playwright tests.

- **New tests, 3:** `stiffness-provenance` fires on a Racketpedia figure
  without its pages and on a legacy figure with some; the schema rejects a
  disputed reading without its page. The rule's first case now uses a legacy
  figure, since Caviar is Racketpedia's.
- **Against v0.990:** with every declared change applied to the blob (v1.1's
  rule, v1.3's scale, this release's labels and bars, the text edits, v1.4's
  grip tags), the data equals v0.990's value for value and serialises to the
  same length.
- **Parity:** all 16 pixel views and 25 DOM scenarios pass. Without patch J,
  all 25 DOM scenarios fail. `scripts/recheck-stiffness.ts` (one-off) asserts
  that each confirmed figure equals the stored one, the 30 / 4 / 20 split, 34
  Racketpedia figures in all, and that each text edit's text occurs once.

## File size

| | v1.4 | v1.5 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 451,116 | 455,640 | +4.4 KB (+1.0%) |
| gzip | 103,328 | 104,075 | +0.7 KB |

The provenance (pages, month) and the 20 disputed readings add the bytes.

## Still open

Unchanged from v1.4, except:

- **The footers** still say "Stiffness (kg/mm) from Racketpedia lab testing".
  34 figures now are, the 20 disputed ones are earlier figures, and 15 strings
  are not on Racketpedia; by the owner's decision no caveat is added.
- **Closed:** re-verifying the legacy stiffness figures (D1).

Next in Phase 2 step 4: unifying the rating words (D5), sample of five first.

---

# v1.4 — One colour per tag label

**Date:** 2026-11-18
**Base:** v1.3 (one stiffness scale)
**Status:** visible release. Phase 2 step 3, fourth and last release
(`docs/phase-2-data-model.md`, D8): a feel tag stores its label, and its
colour comes from a table, so one label always has one colour. On the grips
four labels had two colours; the owner chose scheme A on 2026-11-18, after
screenshots: each label takes the colour most grips already used, and five
grip tags change. No note content changed; `TENNIS_DB.version` stays
`0.990`.

With this, Phase 2 step 3 is complete.

---

## Tag colours

| Label | Was | Now | Tags that change |
|---|---|---|---|
| Tacky | red ×8, amber ×1 | red | Tourna Tac |
| Dry | indigo ×7, amber ×1 | indigo | Yonex Dry Grap |
| Firm | amber ×5, red ×1 | amber | Kimony Forte |
| Classic | red ×3, amber ×2 | red | Kimony Tourna, Tourna Grip Original |

The leather replacement grips look as before (Firm amber, Classic red).
Every other grip label already had one colour and keeps it.

- **Two tables** in `src/core/tags.ts`: strings and hybrids use v0.990's
  (unchanged; no string or hybrid tag changes colour), grips their own. A
  grip's "Smooth" (amber) and a string's "Smooth" (indigo) stay different, as
  in v0.990: they sit on different pages and describe different things. Mega
  Tac's "Very Tacky" is its own label and stays amber.
- **The data stores the label only:** `feelTags: ["Crisp", "Firm"]`, no
  colour. `feelTagsHtml()` looks the colour up.

`scripts/derive-tag-colours.ts` (one-off) ran on a sample batch first. Before
writing, it asserts that each of the 182 tags has its table's colour except
exactly the five above.

**Validation.** The schema allows only a table's labels: a tag with no colour,
a grip tag on a string and a string tag on a grip all fail it. v0.990's
`tag-variant` rule is retired; `tag-css` now checks every colour in the
tables has its CSS rule.

## Declared differences from v0.990 (added in v1.4)

| Difference | Visible? | Legacy patch |
|---|---|---|
| Five grip tags in their label's colour | yes | I: the five changes (`GRIP_TAG_CHANGES`) applied to legacy's data and to the tags on the page; it throws unless exactly five are recoloured |

**A limit of the pixel comparison, found here.** Pale amber and pale red tags
are within the colour threshold (0.1) of each other, so no pixel view can see
four of the five changes, however close up. A new close-up view of Yonex Dry
Grap's row, whose tag goes from amber to indigo, sees the fifth; the DOM
scenarios see all five through the tags' classes. `CLAUDE.md` records the
limit next to the 0.1% rule.

---

## Data corrections

None.

## Flags left open

Unchanged since v1.2.

## Verification

`npm run check` passes: 349 Vitest tests (348 in v1.3), 62 Playwright tests
(60 in v1.3).

- **New tests:** three shapes the schema rejects (a label with no colour, a
  grip tag on a string, a string tag on a grip) and a stored colour; the
  close-up pixel view at both viewports. Two `tag-variant` mutation tests and
  the schema test for an unknown colour retired. The smoke check "each tag
  label has one colour" now reads the rendered tags.
- **Against v0.990:** with the five changes applied to the blob, the data
  equals v0.990's value for value and serialises to the same length.
- **Parity:** all 16 pixel views and 25 DOM scenarios pass. Without patch I,
  all 25 DOM scenarios and the new close-up fail.

## File size

| | v1.3 | v1.4 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 455,235 | 451,116 | −4.0 KB (−0.9%) |
| gzip | 103,327 | 103,328 | 0.0 KB |

The data no longer repeats a colour with each of the 182 tags.

## Still open

Unchanged from v1.3, except:

- **Closed:** grip tag colours.

Phase 2 step 4 is what remains of the plan, later and separately: re-checking
the 62 stiffness figures against named sources with dates (D1), and unifying
the rating words (D5), sample of five first.

---

# v1.3 — One stiffness scale

**Date:** 2026-11-18
**Base:** v1.2 (stiffness words in the notes)
**Status:** visible release. Phase 2 step 3, third release
(`docs/phase-2-data-model.md`, D3): every stiffness bar is drawn on one scale
for every brand, derived, no longer stored, and the brand footers say so. The
owner approved the scale on 2026-11-04 and the preview, the footer wording (A)
and hybrids at their band's midpoint on 2026-11-18. No note content changed;
`TENNIS_DB.version` stays `0.990`.

---

## The scale

- **0.55 kg/mm is drawn at 10% and 1.15 kg/mm at 100%**, linear, rounded to a
  whole percent (a half up), never below 4%: Tour Mako (0.45) sits at 4%.
  A range is drawn at its midpoint.
- **Without a figure** a bar sits at its band's midpoint, an estimate: Very Soft
  0.65, Soft 0.78, Med-Soft 0.88, Medium 0.95, Med-Firm 1.01, Firm 1.07, Very
  Firm 1.12. That covers the 10 strings without a figure and **all 10 hybrids**,
  so a hybrid's bar matches its label and the strings beside it. The
  differences set by hand within a band are gone: Stevie (68), Wasabi Pro (65)
  and K-Pop (75), all Med-Firm, are all at 79.
- `stiffnessWidth()` in `src/core/stiffness.ts` derives every bar; the data
  stores no width. Sorting by stiffness follows the scale.

Before, bars were set by hand within each brand: 1.05 kg/mm was drawn at 78,
82, 88 and 92 depending on the brand. Now it is 85 everywhere.

**68 of the 72 string bars and all 10 hybrid bars change.** Unchanged: ALU
Power Soft, Element, M2 Pro and Confidential.

| String | Brand | Stiffness | Was | Now |
|---|---|---|---:|---:|
| O-Toro Tour | Toroline | Very Firm · 1.10 | 88 | 93 |
| Caviar | Toroline | Med-Firm · 1.00 | 72 | 78 |
| Vamos | Toroline | Medium (midpoint) | 62 | 70 |
| Cash | Toroline | Med-Firm (midpoint) | 74 | 79 |
| A5 | Toroline | Med-Soft · 0.90 | 60 | 63 |
| A5 Infrared | Toroline | Med-Soft (midpoint) | 45 | 60 |
| O-Toro | Toroline | Medium · 0.95 | 58 | 70 |
| O-Toro Octa | Toroline | Very Firm · ~1.10 | 88 | 93 |
| O-Toro Spin | Toroline | Medium · ~0.95 | 58 | 70 |
| O-Toro Snap | Toroline | Medium · ~0.95 | 60 | 70 |
| Wasabi | Toroline | Medium · 0.95–1.00 | 65 | 74 |
| Toro Toro | Toroline | Medium · 0.95 | 58 | 70 |
| Enso Pro (Carbon) | Toroline | Med-Soft · 0.90 | 50 | 63 |
| Snapper | Toroline | Med-Soft · 0.85 | 42 | 55 |
| Super Toro | Toroline | Med-Soft · 0.90 | 50 | 63 |
| Truffle X | Toroline | Very Soft (midpoint) | 15 | 25 |
| O-Toro Snap Tour Flex | Toroline | Med-Firm (midpoint) | 72 | 79 |
| Tour Bite | Solinco | Very Firm · 1.12 | 95 | 96 |
| Confidential | Solinco | Med-Firm · 1.00 | 78 | 78 |
| Confidential Soft | Solinco | Medium (midpoint) | 58 | 70 |
| Hyper-G | Solinco | Very Firm · 1.10 | 88 | 93 |
| Mach-10 | Solinco | Med-Soft · 0.85 | 50 | 55 |
| Tour Bite Soft | Solinco | Med-Soft · 0.85 | 50 | 55 |
| Hyper-G Soft | Solinco | Medium · 0.95 | 62 | 70 |
| Revolution | Solinco | Med-Firm · ~1.00 | 72 | 78 |
| TB Diamond Rough | Solinco | Medium · ~0.95 | 65 | 70 |
| Hyper-G Round | Solinco | Medium · ~0.95 | 62 | 70 |
| Barb Wire | Solinco | Medium · ~0.95 | 60 | 70 |
| Outlast | Solinco | Med-Soft · ~0.90 | 55 | 63 |
| Vanquish (Multi) | Solinco | Soft (midpoint) | 30 | 45 |
| Poly Tour Spin | Yonex | Firm · 1.08 | 95 | 90 |
| Poly Tour Strike | Yonex | Medium · 0.92 | 72 | 66 |
| Poly Tour Pro | Yonex | Firm · 1.05 | 82 | 85 |
| Poly Tour Rev | Yonex | Med-Soft · 0.85–0.95 | 68 | 63 |
| Poly Tour Drive | Yonex | Med-Soft · ~0.90 | 65 | 63 |
| Poly Tour Force | Yonex | Med-Firm (midpoint) | 62 | 79 |
| Poly Tour Fire | Yonex | Soft · 0.80 | 52 | 48 |
| Poly Tour Air | Yonex | Soft · 0.72 | 40 | 36 |
| Poly Tour Tough | Yonex | Soft · 0.77 | 48 | 43 |
| Tour Super 850 (Multi) | Yonex | Soft (midpoint) | 28 | 45 |
| Vivo | ReString | Firm · 1.05 | 88 | 85 |
| Sync | ReString | Med-Soft · 0.85–0.95 | 68 | 63 |
| Zero | ReString | Firm · 1.05–1.10 | 90 | 89 |
| SLAP (Ltd. Edition) | ReString | Medium · ~0.95 | 65 | 70 |
| Tour Sniper | Grapplesnake | Firm · 1.05 | 92 | 85 |
| Soldier | Grapplesnake | Med-Firm · ~1.00 | 85 | 78 |
| Tour M8 | Grapplesnake | Medium · 0.90–0.95 | 72 | 66 |
| Alpha | Grapplesnake | Med-Soft · 0.90 | 65 | 63 |
| Aspera Triplum | Grapplesnake | Med-Soft · ~0.85 | 58 | 55 |
| Game Changer | Grapplesnake | Med-Soft · ~0.90 | 65 | 63 |
| Paradox Pro | Grapplesnake | Medium · ~0.95 | 72 | 70 |
| Tour Mako | Grapplesnake | Very Soft · 0.45 | 25 | 4 |
| Tour Mako Short Fin | Grapplesnake | Med-Firm (midpoint) | 68 | 79 |
| Irukandji | Grapplesnake | Med-Soft · ~0.85 | 58 | 55 |
| ALU Power | Luxilon | Firm · 1.05 | 78 | 85 |
| ALU Power Rough | Luxilon | Firm · 1.05 | 78 | 85 |
| ALU Power Soft | Luxilon | Med-Soft · 0.85 | 55 | 55 |
| ALU Power Spin | Luxilon | Med-Firm · 1.00 | 72 | 78 |
| ALU Power Feel | Luxilon | Medium · 0.95 | 65 | 70 |
| 4G | Luxilon | Very Firm · 1.10 | 84 | 93 |
| 4G Rough | Luxilon | Very Firm · 1.10 | 84 | 93 |
| 4G Soft | Luxilon | Medium · 0.95 | 65 | 70 |
| Element | Luxilon | Med-Soft · 0.85 | 55 | 55 |
| Adrenaline | Luxilon | Med-Firm · 1.00 | 72 | 78 |
| M2 Pro | Luxilon | Med-Soft · 0.85 | 55 | 55 |
| Eco Power | Luxilon | Med-Firm · 1.00 | 72 | 78 |
| Big Hitter Black 7 | Tourna | Med-Firm · 1.00 | 72 | 78 |
| Big Hitter Blue Rough | Tourna | Firm · 1.05 | 78 | 85 |
| Big Hitter Silver Rough | Tourna | Medium · 0.92 | 62 | 66 |
| Pro 16 | Tourna | Med-Firm · 0.98 | 70 | 75 |
| Quasi-Gut Armor | Tourna | Very Soft · 0.65 | 38 | 25 |
| Pro Tour | Tourna | Very Soft · 0.55 | 30 | 10 |
| K-Pop | hybrid | Med-Firm (midpoint) | 75 | 79 |
| K-Pop Spin | hybrid | Medium (midpoint) | 58 | 70 |
| Dreddy | hybrid | Med-Firm (midpoint) | 70 | 79 |
| Stevie | hybrid | Med-Firm (midpoint) | 68 | 79 |
| 101 | hybrid | Med-Soft (midpoint) | 48 | 60 |
| O-Snap | hybrid | Medium (midpoint) | 55 | 70 |
| Wasabi Pro | hybrid | Med-Firm (midpoint) | 65 | 79 |
| What The Hybrid | hybrid | Medium (midpoint) | 60 | 70 |
| Snapaholic | hybrid | Med-Firm (midpoint) | 68 | 79 |
| Cole | hybrid | Med-Firm (midpoint) | 70 | 79 |

Six of these are one point wider than the preview the owner saw (A5 Infrared,
Poly Tour Rev, Poly Tour Air, Sync, Pro 16, 101): their exact value ends in a
half, which the preview's floating-point arithmetic rounded down and the
release rounds up.

## Footers

In each of the 7 brand footers (5 brands, 2 with a Pro Tour 630 variant):

- **Was:** Bars are relative within the Toroline lineup.
- **Now:** Stiffness bars share one scale across every brand, 0.55 to 1.15
  kg/mm; a string without a figure is drawn at its band's midpoint. The rating
  bars are relative within the Toroline lineup.

Luxilon and Tourna have no footer, as before.

`scripts/derive-stiffness-widths.ts` (one-off) ran on a sample batch first.
Before writing, it asserts that 68 string bars and 10 hybrid bars change and
which four don't, the ends of the scale (Pro Tour at 10%, Tour Mako at 4%),
Poly Tour Force at Med-Firm's midpoint, 1.05 kg/mm at 85% in four brands, and
that each of the 7 footers holds its sentence exactly once.

**Validation.** The schema stores no stiffness width for strings or hybrids.

## Declared differences from v0.990 (added in v1.3)

| Difference | Visible? | Legacy patch |
|---|---|---|
| 78 stiffness bars on one scale | yes | H: `V0990_STIFFNESS_SCALE` sets legacy's widths from its labels after F (it throws unless exactly 78 change); the 234 bars on the page (78 × 3 racquets) are redrawn. Compare and sorting read the patched data and bars |
| The footers' sentence about bars | yes | H: the old sentence is swapped for the new in the 15 footers on the page (5 brands × 3 racquets) |

`tests/data/legacy-roundtrip.test.ts` applies the scale to the v0.990 blob
after v1.1's rule, and checks every footer against v0.990 with the declared
sentence swapped back.

---

## Data corrections

None.

## Flags left open

Unchanged since v1.2.

## Verification

`npm run check` passes: 348 Vitest tests (341 in v1.2), 60 Playwright tests.

- **New tests, 7:** five in `tests/unit/stiffness.test.ts` (the scale's
  points, a half rounding up, the 4% floor, 1.05 kg/mm at one width in every
  brand, band midpoints for strings and hybrids); two shapes the schema
  rejects (a stored width on a string and on a hybrid).
- **Against v0.990:** with v1.1's rule, v1.2's edits and this scale applied to
  the blob, the data equals v0.990's value for value and serialises to the
  same length; the footers equal v0.990's but for the declared sentence.
- **Parity:** all 15 pixel views and 25 DOM scenarios pass, sorting by
  stiffness included. Without patch H, 25 DOM scenarios and 10 pixel views
  fail.

## File size

| | v1.2 | v1.3 | Δ |
|---|---:|---:|---|
| Page (HTML + JS + CSS) | 454,870 | 455,235 | +0.4 KB (+0.1%) |
| gzip | 103,312 | 103,327 | 0.0 KB |

## Still open

Unchanged from v1.2, except:

- **Closed:** the bar scale and the footers' wording.
- The footers still say "Stiffness (kg/mm) from Racketpedia lab testing";
  every figure is marked `source: "legacy"` until the re-check (D1, step 4).

Next in Phase 2 step 3: one colour per grip tag label (D8), with screenshots
first. That is the last of step 3.

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
