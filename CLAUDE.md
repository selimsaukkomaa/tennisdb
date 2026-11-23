# Strung

Strung (this repo is `tennisdb`) is a tennis equipment database: how strings, hybrids, gut
pairings and grips play in three rackets, so a racket + string combination can be judged
without searching around. The racket + string choice is the centre of the app. It ships as a
PWA on GitHub Pages (`https://selimsaukkomaa.github.io/tennisdb/`) and as an iOS app
(Capacitor). It was called EquipDB until v0.993, and was a personal tool with a stringing log
until v1.6; the owner removed the log in v1.7 (it may come back).

v0.991 was a parity port of the single-file v0.990 app in `legacy/`: same behaviour, same
look, same data. v0.992 fixed three v0.990 bugs; v0.993 renamed the app. v0.999 was the last
number of that scheme; v1.0 came next. Release history is in `CHANGELOG.md`;
v0.989 and v0.990 are in `legacy/`.

## Conventions

These are the owner's rules. Follow them exactly.

### Content (notes)

- A note describes how a string behaves in a given frame, in this order:
  1. what its construction and stiffness do;
  2. interaction with the frame's RA, pattern and head size;
  3. what to expect: feedback, dwell, launch, spin mechanism, tension hold;
  4. tension band and gauge lever;
  5. typical deployment: full bed, mains or crosses.
- About 50 words. No second person, no verdicts, no ranking, no stroke-specific ranking.
- Never change note content without asking. For any content rewrite, show a sample batch of
  about five first.
- "Racket", never "racquet", in anything the app shows: UI words, notes, copy (the owner's
  call, v1.8; the `racket` rule and a smoke test hold it). Code names keep the old spelling
  (`racquets.json`, `racquetId`, `data-racquet`): nobody reads them.

### Data changes

- Data corrections are never silent. The corrected note carries a one-line parenthetical
  pointing to the old error, and the changelog lists it.
- Unresolved source conflicts are stated as flags in the changelog and kept in the data
  (`stiffness.disputed` for a stiffness figure), not in the note text: the owner's call
  (2026-11-18), a disclaimer is irrelevant to the reader.
- Every bulk transform asserts its expected match count. Run a small sample batch and show it
  before running the full set.
- Data changes go through the validators (`npm run validate`). A rule that a change breaks is
  discussed, not loosened.

### Files and code

- UTF-8 everywhere. Never ASCII-escape `×`, `–` or `·` in data files. In Python, use
  `io.open(..., encoding='utf-8')` and `json.dumps(..., ensure_ascii=False)`.
- Straight ASCII quotes and apostrophes in code and markup, never smart quotes. Prettier turns
  unicode escapes for quote characters into the literal characters, so code that needs a
  curly quote builds it from its code point (`String.fromCharCode`, as in
  `src/ui/filter-panel.ts`).
- Filter visibility uses the `filter-hidden` / `gfilter-hidden` classes, never `style.display`.
- Feel filters use token matching (split on commas), never substring matching.
- Metric units: kg, mm, kg/mm.

### Releases

Each release updates `CHANGELOG.md` in the existing style: scope, data corrections, flags left
open, verification counts, file size and Still open.

## Working agreement

- Commit only when asked. Never push without an explicit go-ahead, and push branches only:
  `main` changes only by the owner's decision.
- Never ask for or accept a GitHub token or password in chat. Git over HTTPS uses a token in
  the macOS Keychain.
- Decisions go to the owner as 2–4 options with a recommendation; wait for the pick.
- Stop after each step with a short summary, plus screenshots when the UI is involved.

## Layout

```
data/              TENNIS_DB, one JSON file per collection (meta, racquets, brandsStrings,
                   strings, hybrids, pairings, grips, gutStrings, gutHybrids). 2-space, UTF-8.
                   pairings.json: how each string and hybrid is strung in each racquet.
content/copy.json  UI copy that lived in v0.990's markup and JS (HTML strings, verbatim)
src/core/          no DOM: data schemas (schema.ts; types.ts infers the types from them), db
                   assembly, chips, filter predicates, compare, gut, search index and scoring,
                   pairings, stiffness, ratings, tags, validators
src/ui/            DOM layer: shell, tables, nav, picker (the racket menu, card and compare),
                   prefs (the remembered racket and strings), filters, filter panel, compare,
                   gut, search, palette, placeholders (short ones on phones); html`` / raw()
                   escaping helpers
src/platform/      native check (the service worker registers only on the web)
src/styles/        v0.990 CSS split verbatim, imported in cascade order; additions.css last
schemas/          JSON Schema exported from the Zod schemas (generated: npm run schemas)
scripts/           validate-data, export-schemas, make-icons, vendor-fonts; one-offs kept for
                   provenance (extract-legacy, migrate-pairings, link-hybrid-sides,
                   migrate-racquets, migrate-stiffness, migrate-ratings, migrate-specs,
                   derive-stiffness-bands, stiffness-words, derive-stiffness-widths,
                   derive-tag-colours, recheck-stiffness, derive-rating-words,
                   racket-spelling, regna-ra) are not meant to run again
tests/             data/, unit/, smoke/ (Vitest); visual/ (Playwright, with baselines/)
ios/               Capacitor project (SPM)
legacy/            v0.990 HTML, build_990.py, smoke_v990.js, v0.989/v0.990 changelogs (reference)
```

## Commands

```bash
npm run dev          # Vite dev server
npm run check        # everything below, in CI order
npm run validate     # data validators (also run by every vite build)
npm run schemas      # regenerate schemas/ after changing a Zod schema
npm run typecheck
npm run lint
npm test             # Vitest: data, unit, smoke
npm run test:visual  # Playwright: pixel and DOM baselines, offline
npm run build        # dist/ (BASE_PATH=/tennisdb/ for Pages; default '/')
npm run build:ios    # build + cap sync ios; then npm run ios:open or run from Xcode
```

## Architecture rules

- `src/core` has no DOM access; ESLint's `no-restricted-globals` enforces it. Keep data and
  logic there so a native SwiftUI app can reuse the model later.
- `src/ui` renders with the `html` tagged template, which escapes interpolations; `raw()` is
  only for trusted HTML from `content/`. Everything in `data/` is plain text since v1.0 (the
  `plain-text` rule). Events go through delegation on `data-*` hooks.
- Modules talk through `state.ts` (active category, racquet and strings) and its event bus
  (`category`, `racquet`, `page`, `pick`, `filtered`), not window globals.
- One card (`#selector`) sits at the top of the Strings page for every racket. A racket's page
  (`[data-racquet-page]`: its tables and gut view) is built the first time it is shown and
  kept (`page` fires), so code that acts on pages covers the ones built so far, and a page
  built later must pick up the current strings choice, filters and compare ticks.
- Racquets are data-driven. A new frame needs a `racquets.json` entry, a pairing (tension
  and note) in `pairings.json` for every string and hybrid, and optionally gut pairings;
  `tests/unit/ten-rackets.test.ts` proves the UI follows for ten (seven placeholders). The
  menu orders brands A–Z, then models A–Z (`racquetGroups`); the first in `racquets.json` is
  where a first visit opens. Brand colours are per brand in CSS and need nothing. Views read
  pairings through `src/core/pairings.ts`, never directly.

## Visual baselines

Until v1.6 every view was compared with the v0.990 page; that comparison was retired with the
redesign in v1.7. The app is now checked against its own approved baselines
(`tests/visual/baselines`):

- pixel baselines (`tests/visual/views.spec.ts`): 17 views at 1440×900 and 390×844, the first
  screen or a close-up, threshold 0.1, at most 0.1% of pixels differing. Made on macOS and run
  only there: CI runs Linux, which renders text differently. Run `npm run check` on the Mac
  before every release.
- DOM baselines (`tests/visual/dom.spec.ts`): 25 scenarios, the rendered DOM normalised to
  text (`tests/visual/dom.ts`; elements that don't render are left out). Run everywhere, CI
  included. Steps click, type, pick an option, press a key or reload (which keeps what the page
  stored); each test starts with empty storage.
- a visible change is shown to the owner with screenshots first; once approved, the baselines
  are updated on purpose (`npx playwright test --update-snapshots`) in the same commit, and the
  changelog says so.

A close-up (`element`, `hover`) makes a small change more than 0.1% of the screenshot. A colour
change must also exceed the per-pixel threshold: the pale amber and red tags (`.tag-crisp`,
`.tag-firm`) are within 0.1 of each other, so only the DOM baselines tell them apart.
`--update-snapshots` rewrites only the views that fail, so an approved change under 0.1% stays
out of its baseline (v1.9's palette hint, 277 pixels of the phone palette view): after it, run
`--update-snapshots=all` and restore the views whose new image differs from the old only below
the per-pixel threshold (anti-aliasing), so they don't churn. After each
click the view tests pause 150 ms: panels focus their fields 10 ms after opening, and a later
click must not race that timer.

Fonts are vendored in `src/assets/fonts`, and the tests block every request that isn't local.
They also pin `navigator.platform` to a Mac (`tests/visual/support.ts`): the palette's shortcut
hint reads "⌘K" there and "Ctrl K" elsewhere, and the DOM baselines must read the same on CI.

The data is still compared with v0.990's (`tests/data/legacy-roundtrip.test.ts`): converted back
to the v0.990 shape, with every declared data change applied to the v0.990 blob
(`tests/data/v0990-changes.ts`), it must equal v0.990's value for value.

## Data validation

The Zod schemas in `src/core/schema.ts` run first and own the data's shape: fields, types,
formats, no unknown keys, the chip token lists, rating scores from 0 to 100. Keep every
schema constraint expressible in
JSON Schema (no `.refine`), so the export in `schemas/` stays complete. Then
`src/core/validate.ts` holds the content and cross-record rules from build_990.py and more:
neutral text, notes present for every racquet, Crisp chip ⇔ Crisp tag, every feel chip used,
grip type ⇔ chip, CSS for every tag colour, a filter-header colour for every grip brand,
bar-backed claims (Mega Tac, Tourna Grip Original), hybrid side labels that name their
string's band, id and reference integrity, no "Connected" vocabulary, no "racquet" in any
text of `data/` or `content/`, no tag or entity anywhere in `data/`. Some of v0.990's rules hold by construction instead: the stiffness band
comes from the figure, Firm/Soft from the band (`src/core/stiffness.ts`), a tag's colour from
its label (`src/core/tags.ts`), and a rating's word from its score (`src/core/ratings.ts`).
`scripts/validate-data.ts` adds file checks: UTF-8 literals in data, no smart quotes in
source, `index.html`, these two docs or `docs/`. Every rule and each kind of schema check has
a mutation test in `tests/data/validate.test.ts`; `tests/data/schemas.test.ts` checks that
`schemas/` is current and that a standard JSON Schema validator agrees with Zod.

## iOS

- App id `com.selimsaukkomaa.tennisdb`, display name Strung, iOS 15+. The display name can
  change freely; the app id stays, so installed copies update in place.
- `BridgeViewController` (`ios/App/App/SceneDelegate.swift`) adds a #f0efeb strip behind the
  status bar; `contentInset: 'automatic'` keeps the page below it.
- The service worker registers only on the web (`!isNative()`).
- Icons and splash come from `npm run icons` (`scripts/make-icons.ts`): "strung" in heavy DM Sans,
  white on `#1f4fff`. The icon never uses Space Mono (the owner's call); the topbar wordmark
  matches it (`additions.css`).

## Deploy

`.github/workflows/deploy.yml` runs the full check on every push and pull request and builds
for Pages each time; it deploys only from `main`. The cutover from the v0.990 single file
needs the repo's Pages source set to "GitHub Actions".

## Tooling notes

- TypeScript is pinned to ~6.0 until typescript-eslint supports 7.
- Prettier runs with `embeddedLanguageFormatting: "off"` so it leaves `html` templates alone.
- `build.cssMinify` is off: Lightning CSS drops the unprefixed `backdrop-filter` when the
  `-webkit-` form is present, which removes the blur in Chromium.
