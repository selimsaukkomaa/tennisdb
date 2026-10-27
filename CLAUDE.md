# TennisDB

Personal tennis equipment database: strings, hybrids, gut pairings and grips for three
racquets, plus a stringing log. It ships as a PWA on GitHub Pages
(`https://selimsaukkomaa.github.io/tennisdb/`) and as an iOS app (Capacitor, "EquipDB").

v0.991 is a parity port of the single-file v0.990 app in `legacy/`: same behaviour, same
look, same data. Release history is in `CHANGELOG.md`; v0.989 and v0.990 are in `legacy/`.

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

### Data changes

- Data corrections are never silent. The corrected note carries a one-line parenthetical
  pointing to the old error, and the changelog lists it.
- Unresolved source conflicts are stated as flags in the note and in the changelog.
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
                   strings, hybrids, grips, gutStrings, gutHybrids). 2-space, UTF-8, key order kept.
content/copy.json  UI copy that lived in v0.990's markup and JS (HTML strings, verbatim)
src/core/          no DOM: types, db assembly, chips, filter predicates, compare, gut, search
                   index and scoring, validators, log/ (schema, model, merge, store, tension)
src/ui/            DOM layer: shell, tables, nav, filters, filter panel, compare, gut, search,
                   palette, log, context line; html`` / raw() escaping helpers
src/platform/      native check, storage backends, file save/pick (share sheet on iOS)
src/styles/        v0.990 CSS split verbatim, imported in cascade order; additions.css last
scripts/           validate-data, make-icons, vendor-fonts, extract-legacy (one-off, provenance)
tests/             data/, unit/, smoke/ (Vitest); visual/ (Playwright); fixtures/
ios/               Capacitor project (SPM)
legacy/            v0.990 HTML, build_990.py, smoke_v990.js, v0.989/v0.990 changelogs (reference)
```

## Commands

```bash
npm run dev          # Vite dev server
npm run check        # everything below, in CI order
npm run validate     # data validators (also run by every vite build)
npm run typecheck
npm run lint
npm test             # Vitest: data, unit, smoke
npm run test:visual  # Playwright: pixel and DOM parity with legacy, backups, offline
npm run build        # dist/ (BASE_PATH=/tennisdb/ for Pages; default '/')
npm run build:ios    # build + cap sync ios; then npm run ios:open or run from Xcode
```

## Architecture rules

- `src/core` has no DOM access; ESLint's `no-restricted-globals` enforces it. Keep data and
  logic there so a native SwiftUI app can reuse the model later.
- `src/ui` renders with the `html` tagged template, which escapes interpolations; `raw()` is
  only for trusted HTML from `data/` and `content/`. Events go through delegation on `data-*`
  hooks.
- Modules talk through `state.ts` (active category and racquet) and its event bus
  (`category`, `racquet`, `filtered`, `log`), not window globals.
- Racquets are data-driven. A fourth frame needs a `racquets.json` entry, a `perRacquet` note
  for every string and hybrid, and optionally gut pairings; `tests/unit/fourth-racquet.test.ts`
  proves the UI follows. Brand colours are per brand in CSS and need nothing.

## Parity

v0.991 must render like v0.990. No visual or DOM change without a declared difference:

- pixel parity (`tests/visual/parity.spec.ts`): 13 views at 1440×900 and 390×844, threshold
  0.1, at most 0.1% of pixels differing. A declared difference is a mask plus a reason.
- DOM parity (`tests/visual/dom-parity.spec.ts`): 24 scenarios compared node for node after
  `eraseDeclaredDifferences` in `tests/visual/dom.ts`.
- every declared difference is listed in `CHANGELOG.md`.

Three v0.990 bugs are kept on purpose until v0.992 (see the changelog): grip filters skip
Tourna (`LEGACY_GRIP_FILTER_BRANDS`), stale filter state on the racquet switched away from,
and the search clear button that never shows. Don't fix them as a side effect.

Fonts are vendored in `src/assets/fonts`; the tests route legacy's Google Fonts requests to
the same files, so both sides render identical glyphs offline.

## Data validation

`src/core/validate.ts` holds the build_990.py invariants and more: neutral text, notes present
for every racquet, firm-xor-soft against the stiffness band, Crisp chip ⇔ Crisp tag, feel and
shape tokens are chip values, grip type ⇔ chip, one colour per tag label with CSS for every
variant, bar-backed claims (Mega Tac, Tourna Grip Original), id and reference integrity, no
retired vocabulary. `scripts/validate-data.ts` adds file checks: UTF-8 literals in data, no
smart quotes in source, `index.html` or these two docs. Each rule has a mutation test in `tests/data/validate.test.ts`.

## Stringing log

- Schema v2 (`src/core/log/schema.ts`, Zod): UUID ids, `createdAt`/`updatedAt`, `deletedAt`
  tombstones, `pins: { racquetId: entryId }`, tension `{ mainsKg, crossesKg | null }`.
- `LogStore` over a key-value backend: localStorage on the web, Capacitor Preferences on iOS.
  Key `tennis_log_v2`. Unreadable data is moved aside to `tennis_log_v2.unreadable-<ts>`,
  never overwritten.
- Import merges by id: newer `updatedAt` wins, tombstones are respected, the local pin wins.

## iOS

- App id `com.selimsaukkomaa.tennisdb`, display name EquipDB, iOS 15+. The display name can
  change freely; the app id is fixed once the app is on a device or in the store.
- `BridgeViewController` (`ios/App/App/SceneDelegate.swift`) adds a #f0efeb strip behind the
  status bar; `contentInset: 'automatic'` keeps the page below it.
- The service worker registers only on the web (`!isNative()`).
- Icons and splash come from `npm run icons` (`scripts/make-icons.ts`).

## Deploy

`.github/workflows/deploy.yml` runs the full check on every push and pull request and builds
for Pages each time; it deploys only from `main`. The cutover from the v0.990 single file
needs the repo's Pages source set to "GitHub Actions".

## Tooling notes

- TypeScript is pinned to ~6.0 until typescript-eslint supports 7.
- Prettier runs with `embeddedLanguageFormatting: "off"` so it leaves `html` templates alone.
- `build.cssMinify` is off: Lightning CSS drops the unprefixed `backdrop-filter` when the
  `-webkit-` form is present, which removes the blur in Chromium.
