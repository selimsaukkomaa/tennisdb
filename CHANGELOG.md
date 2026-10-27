# Tennis Equipment Database — Changelog

Releases up to v0.990 shipped as a single HTML file. Their changelogs are in
`legacy/` (`tennis_equipmentdb_changelog_v0_989.md`, `…_v0_990.md`).

---

# v0.992 — Three v0.990 bugs fixed

**Date:** 2026-10-27
**Base:** v0.991 (repository port)
**Status:** bug-fix release — the three v0.990 bugs v0.991 kept for parity
are fixed. No data or content changes; `TENNIS_DB.version` stays `0.990`.

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
