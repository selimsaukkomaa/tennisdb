# Tennis Equipment Database — Changelog v0.990

**Date:** 2026-09-22
**Base:** v0.989 (neutral descriptions)
**Status:** polish release — filter fixes, grip-note cleanup, dead-code removal. No new features, no new chips, no changes to string, hybrid or gut notes.

---

## 1. Filter fixes

### Shape: `square-textured` → `square`

TB Diamond Rough and Aspera Triplum carried `shapeAttr: "square-textured"`,
which no chip emits, so the Square chip hid them. Both now file as `square`.
This matches every other textured string: ALU Power Rough, 4G Rough, both Big
Hitter Roughs, Paradox Pro and Tour Mako all file under their base shape
(`round`), with the texture kept in the visible shape label.

### Feel chips (strings and hybrids)

The feel attributes had drifted from the rows they sat on:

| Problem in v0.989 | Example |
|---|---|
| Plush and Lively matched **no single string** | only four Toroline hybrids each carried those values |
| 6 strings had **no feel value**, so they vanished under any feel chip | O-Toro Snap, Enso Pro Carbon, Hyper-G Round, Outlast, Poly Tour Tough, Irukandji |
| `soft` was used to mean "muted" | Hyper-G and Zero (1.10 and 1.05–1.10 kg/mm) matched **Soft** |
| attributes contradicted the tags | Confidential Soft (tag "Softer") matched only **Firm**; Poly Tour Rev showed both Crisp and Muted tags |

The five chips (Crisp, Firm, Soft, Plush, Lively) are unchanged. Assignment
now follows written rules, applied to every string and hybrid:

- **Firm / Soft** split the Stiffness column in two. Med-Firm and firmer is
  Firm; Medium and softer is Soft. Every row carries exactly one. A three-way
  split would need a Medium chip, which is a new feature, so it is deferred.
- **Crisp** matches a row that shows a Crisp tag (or says crisp in its
  summary), unless the same row calls the string muted or damped.
- **Plush** matches when the row's text says plush, or at the measurable
  extreme: comfort Very High / Excellent / Elite, or stiffness ≤ 0.72 kg/mm /
  Very Soft. Hybrids keep their existing plush judgements.
- **Lively** matches when the row's text says lively or elastic.

Result (single strings):

| Chip | v0.989 | v0.990 |
|---|---:|---:|
| Crisp | 33 | 30 |
| Firm | 22 | 35 |
| Soft | 33 | 37 |
| Plush | **0** | 11 |
| Lively | **0** | 11 |
| no value | **6** | 0 |

Plush is now A5 Infrared, Truffle X, Vanquish, Poly Tour Air, Tour Super 850,
Alpha, Tour Mako, Element, M2 Pro, Quasi-Gut Armor and Pro Tour. Lively is now
O-Toro, Tour Bite, Hyper-G Soft, Hyper-G Round, Poly Tour Fire, SLAP, Aspera
Triplum, Tour Mako, Irukandji, ALU Power Feel and M2 Pro.

54 of 82 rows changed chip membership. The full diff is printed by
`build_990.py`. Rows worth checking:

- **Poly Tour Pro** moves Soft → Firm. That follows its Med-Firm / 1.05 label,
  which is still the unresolved conflict flagged in v0.989 (every source
  describes Pro as softer than Strike at 0.92).
- **Big Hitter Silver Rough** matches Firm only, although its tag reads
  "Softer". The tag is relative to Blue Rough; the label is Med-Firm · 0.92.
- **O-Toro Snap Tour Flex** loses Crisp. Its own expand line describes a
  "muted, efficient response", which contradicted the Crisp tag. The rule
  sides with the description. This is reversible if the description is the
  wrong half.

### Feel tags brought in line with the chips

- The Crisp tag was removed where the row calls itself muted or damped: Tour
  Sniper (now Muted · Firm), Poly Tour Rev (Muted), Poly Tour Fire (Lively),
  O-Toro Snap Tour Flex (Firm).
- "Connected", the retired preference vocabulary, is gone. ALU Power Soft →
  Softer. Cole → Precise · Crisp, which keeps its existing Crisp chip. Gut
  pairings gh-percept-1 → "Plush · Round" and gh-percept-5 → "Firm · Shaped".
- One label, one colour. Tags like Softer, Precise, Bite, Elastic and Lively
  had been coloured inconsistently row to row; 26 variants were normalised.
- The `lively` and `plush` tag variants had **no CSS class**, so those tags
  rendered uncoloured. They now use `.tag-lively` (green, the colour freed
  from `.tag-top`) and `.tag-plush` (fuchsia).

### Grip filters

| Problem | Fix |
|---|---|
| **Dry** chip missed all three Tourna dry grips, which were tagged `classic,absorbent` | now `dry,absorbent` (+ `thin` on Pro Thin) |
| **Leather** chip missed Tourna Pro Tour Leather (`classic,firm`) | now `leather,firm` |
| Ana Spa Twin untagged since v0.981 | `cushioned,tacky` |
| **Tacky** chip missed two wet grips: Wave Grap (Super Grap base) and Forte ("moderate tackiness") | `tacky` added |
| Synthetic Pro lacked `synthetic` (consistency with the other synthetics) | `synthetic,cushioned` |
| Grip feel filter used **substring** matching (`indexOf` on the raw string); the string filter uses token matching | now splits on commas, same as strings |

Every dry-type grip now matches Dry, every wet-type grip matches Tacky, every
leather replacement grip matches Leather, and no grip is untagged. The build
enforces all four.

---

## 2. Grip-note cleanup

This applies the v0.989 standard to grips: no second person, no verdicts.
Attributed reputation ("long regarded as the reference leather grip") and
factual superlatives backed by the data are kept.

27 fields across 19 grips. Examples:

- **Mega Tac** — "Niche pick. Most players find this too tacky… if your hands
  are very dry…" → "Tourna's highest-tack grip, with low absorption. The level
  of stick makes mid-point grip changes noticeably harder; it is aimed at very
  dry hands."
- **Tourna Grip Original** — "If your hands sweat heavily, this is the gold
  standard" → "The reference dry overgrip, with the highest absorption rating
  in the database." Summary "World-famous" → "Reference dry grip".
- **Fairway Leather** — "legendary… amazing feel… gold standard" → "Long
  regarded as the reference leather replacement grip…" Summary → "Reference
  leather grip".
- **Ultimum Leather** — "The ideal base grip for players who want maximum
  connection… Pairs perfectly…" → "A thin, firm leather base that transmits
  frame feedback directly; commonly used under an overgrip such as Super Grap."
- "Best for heavy sweaters who dislike…" (Neo-Dry, Dry Grap) → "Designed for
  heavy sweat without a sticky/tacky surface."
- Tourna **About** box: "Pro Tour Leather is a strong replacement-grip option"
  → "…is the leather replacement grip".

### Data corrections found during the pass

| Record | Was | Now |
|---|---|---|
| Tourna Tac (note + expand) | "Yonex Hi-Soft EX" | Kimony Hi-Soft EX (it's a Kimony grip) |
| Tourna Mega Tac | "delivers more than any wet grip in the database" | tackiness data disagrees: Hi-Soft EX 97, Ultra-Thin 95, Super Grap JP 93, Mega Tac 92. The note now says Tourna's highest-tack grip and carries a one-line pointer to the old claim. |

The build asserts both claims against the tackiness and absorption bars, so
they can't drift again silently.

---

## 3. Dead-code removal

The top-pick machinery, kept in v0.989 for possible reuse, is excised:

- **Renderer:** `topPickTag()`; the `topPick` parameter of `nameCell()`; the
  `class="highlight"` and `data-toppick` / `data-grip-toppick` attributes on
  all four row builders; the per-racquet top-pick sort on hybrid tables.
- **Gut strip:** `gut-row-top` class, ★ badge, top-pick sort key, unused
  `topPicks` counter.
- **Search:** "★ Top Pick" sublabels and the +5 score bonus.
- **Filters:** `toppick` in both filter states, both `isActive` checks, both
  toggle branches, both clear routines and both apply loops.
- **Table sort:** the name-column sort no longer strips a ★ suffix.
- **String rec-box handling** in the filter code. String rec-boxes have been
  gone since v0.989; the grip About-box hiding (`gfilter-hide-rec`) stays.
- **CSS:** `.tag-top`, `tr.highlight` (desktop + mobile), `.filter-chip-top`
  (base, mobile and restyle), the 28-rule summary-section block, the seven
  brand-view `.rec-box .pick` colours, `.rec-box.filter-hide-rec`,
  `.gut-row-top`, `.gut-toppick-badge`.

No visible change from the removals themselves. Hybrid and gut tables were
already rendering in declared order in v0.989, since no row carried the flag.

---

## Verification

`smoke_v990.js` (jsdom): **106/106 pass.** It is the full v0.989 suite plus 58
new checks:

- **Dead code:** none of `topPick`, `toppick`, `tag-top`, `filter-chip-top`,
  `gut-row-top`, `gut-toppick`, `Top Pick`, `summary-section`,
  `summary-card`, `tr.highlight`, `class="highlight"` remain. Grip
  `gfilter-hide-rec` is kept. No "Connected" anywhere.
- **Shape:** the Square chip shows TB Diamond Rough and Aspera Triplum.
- **Feel:**
  - every string row has a feel value and exactly one of Firm/Soft;
  - each chip shows at least its expected count, and every visible row carries the value;
  - spot checks: Hyper-G and Zero not Soft; Confidential Soft is Soft; Truffle X is Plush; Tour Sniper not Crisp; Tour Bite Lively;
  - the Crisp chip equals the Crisp tag everywhere;
  - every tag variant has CSS, and each tag label has one colour.
- **Order:** hybrid rows in declared order; gut rows mains before crosses
  (after expanding the lazily rendered strip); name sort ascending works.
- **Search:** returns results, no ★ sublabels.
- **Grips:**
  - every grip row has a feel value;
  - Dry shows all three Tourna dry grips and every dry-type grip;
  - Leather shows Pro Tour Leather; Tacky shows every wet-type grip;
  - the feel filter is token-based;
  - grip text and About boxes are neutral; no "Yonex Hi-Soft".
- **Regression vs v0.989:** tension bands, string and hybrid notes, shape
  labels, bars, gauges and colours are byte-identical.

The build asserts every regex replacement count, the firm-xor-soft and
crisp-equals-tag invariants, that each chip matches at least one string, the
grip type/chip invariants, grip-text neutrality, and CSS coverage for every tag
variant.

## File size

| File | v0.989 | v0.990 | Δ |
|------|-------:|-------:|---|
| HTML | 418,703 | 411,239 | −7.3 KB (−1.8%) |

## Still open

- **Feel taxonomy:** a Medium band and a damping axis (Transmitting / Damped),
  and possibly a Bite / Snapback spin-mechanism chip. These need new chips, so
  they were out of scope here. A full audit of what Crisp means under the
  neutral model belongs with that work.
- **Poly Tour Pro and Eco Power stiffness conflicts:** still flagged, not
  resolved.
- **Stiffness labels vs numbers are not consistent across brands.** O-Toro
  0.95 is Med-Soft, Toro Toro 0.95 is Medium, Sync 0.85–0.95 is Med-Firm. The
  Firm/Soft chips follow the labels, so any fix belongs in the labels.
- **Grip Thin chip:** Tourna Original (0.45 mm) isn't tagged thin while Dry
  Super Grap (0.45 mm) is. Left for the taxonomy pass, as it's a definition
  question, not a miss.
