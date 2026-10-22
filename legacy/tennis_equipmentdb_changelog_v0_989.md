# Tennis Equipment Database — Changelog v0.989

**Date:** 2026-09-07
**Base:** v0.988 (chrome restructure)
**Status:** data + chrome release — every string, hybrid and gut note rewritten; top-pick concept retired

---

## v0.989 — Neutral descriptions

The app's descriptive layer was written against a fixed player preference
("crisp, connected feel, one-handed backhand") and ranked every string
against it. This version removes that layer. Notes now describe **how the
string behaves in the given frame** — stiffness × RA, profile × pattern,
launch, dwell, spin mechanism, tension hold, typical deployment — and stop
there. No verdicts, no second person, no stroke-specific ranking.

The content model used for every per-racquet note:

1. what the string's construction and stiffness do
2. how that interacts with *this* frame's RA, pattern and hoop size
3. what to expect — feedback level, dwell, launch, spin mechanism, tension hold
4. tension band and the gauge lever
5. typical deployment (full bed / mains / crosses), with provenance flags

All factual content from v0.988 is carried over: Racketpedia numbers, source
conflicts, reviewer attributions, pro usage, knot-tension ceilings, break-in
behaviour. Only the ranking layer is gone.

### Scope

| Text | Count | Action |
|------|------:|--------|
| String `perRacquet.note` | 216 | rewritten |
| Hybrid `perRacquet.note` | 30 | rewritten |
| Gut pairing `notes` | 21 | rewritten |
| `feelSummary` | 24 | reworded where the old line was a verdict ("Dampened, dead", "Connected, not dead", "Deadened, precise", "Vicious RPMs, comfortable"…) |
| `feelExpand` | 33 | reworded where second-person or marketing ("places the ball exactly where you aim", "elite snapback") |
| `topPick` flags | 302 | removed (216 string, 30 hybrid, 21 gut, 35 grip) |

Length: string notes average **52 words** (median 52, range 29–73), down
from ~55 in v0.988 despite carrying more mechanism. Hybrid notes average 49,
gut notes 46.

The Percept notes were rebalanced. v0.988 leaned on "the shaft flexes more
than 66 RA suggests" as the frame's identity; v0.989 anchors on the 18×19's
spin tax and launch control, the extra crosses raising effective bed
stiffness, low power, and how quickly a dense pattern shows tension loss.
The shaft-flex trait now appears in 7 of 72 Percept notes — only where a
soft string makes it relevant.

### Top picks retired

The ★ Top Pick concept was defined in the legend as "Best match for your
profile" — a preference judgement frozen into the data. Retired end to end:

- `topPick` keys deleted from every string, hybrid, gut pairing and grip
- **★ Top Picks Only** filter chip removed (strings and grips), with its divider
- legend line "★ Top Pick = Best match for your profile" removed (×4)
- **"Top Pick from Each Brand — At a Glance"** summary sections removed (×3)
- **"Grips – At a Glance"** summary section removed — it was structured as
  pick / runner-up per category, so it is the same concept
- gut strip no longer counts top picks ("7 pairings" instead of "7 pairings · 2 top picks")
- search placeholder example changed from `'top pick'` to `'hex'`

The renderer's `topPickTag()`, `data-toppick` attributes, `tr.highlight`,
`.gut-toppick-badge` and the search-index `★` bonus are all still in the
code but never fire, since no record carries the flag. Left in place rather
than excised — a future user-driven shortlist (a star toggle stored next to
the stringing log) could reuse the same rendering path. That would be the
right way to reintroduce picks: as runtime input, not baked data.

### Rec-boxes dropped

The 21 per-brand × per-racquet `.rec-box` blocks ("Top picks: … For your
crisp, connected preference with a one-handed backhand…") are gone. The
per-racquet context line introduced in v0.988 carries frame orientation.

The three grip **About** boxes are kept — they are brand background, and
grips have no context line — with their closing preference sentences
neutralised ("Hi-Soft EX is the flagship wet grip; Last Dry is the flagship
dry grip").

### Profile line removed

The topbar wordmark no longer carries the `title` tooltip ("Selim S. ·
Intermediate · One-handed backhand · Prefers crisp, connected feel"). This
closes the v0.988 open question about where the profile line should live:
nowhere. `<title>` still reads "Tennis equipment database — Selim S."

---

## Data corrections made during the rewrite

Writing every note against the data fields surfaced places where the old
notes contradicted the record or each other. Corrected to match the data:

| Record | v0.988 note said | Corrected to |
|--------|------------------|--------------|
| Solinco Revolution | "5-sided" | hexagonal — confirmed against Tennis Warehouse; matches the `shape` field |
| Yonex Poly Tour Drive (PT630) | "round, power-oriented, used by Fonseca" | pentagonal budget shaped string (matches `shape` and the Regna/Percept notes); the round/power/Fonseca description belongs to Poly Tour Force |
| Yonex Poly Tour Rev (PT630) | "round shape doesn't address the spin deficit" | octagonal |
| ReString Zero (PT630) | "square shape" | hexagonal |
| Grapplesnake Aspera Triplum (PT630) | "triangular shape" | square + textured — "Triplum" refers to the triple spin approach |
| Grapplesnake Irukandji (PT630) | "0.45 kg/mm, softest in the lineup" | ~0.85 per the `stiffness` field; 0.45 is Tour Mako's figure |
| Toroline O-Toro Snap | summary "Firm, direct" / "no-nonsense stiff response" | "Round, slick, medium" — the record is Medium ~0.95 and the hybrid labels call it Round · Soft |
| Hybrid Dreddy (PT630) | described a Caviar / O-Toro pairing | O-Toro Tour / O-Toro Snap (the actual recipe; Caviar/O-Toro is Cole) |
| Hybrid 101 (PT630) | described Toro Toro mains | O-Toro mains |
| Hybrid Wasabi Pro (PT630) | described Wasabi / Caviar | Wasabi / Wasabi X (Wasabi/Caviar is K-Pop) |
| Hybrid What The Hybrid (PT630, `feelExpand`) | described Snapper / O-Toro; expand said "Caviar crosses" | Wasabi / Toro Toro |
| Hybrid Snapaholic (PT630) | described O-Toro Tour / O-Toro Snap | Snapper / O-Toro Snap TF |
| Gut gh-regna-5 | "O-Toro Tour's round-pentagonal shape" | hexagonal |

The five hybrid PT630 notes were an off-by-one from an earlier batch — each
described the recipe one row above or below. Each corrected note carries a
one-line parenthetical pointing at the old error so the history is visible
in-app.

## Flags left in the notes (unresolved, stated as such)

- **Poly Tour Pro** — record says 1.05 kg/mm, above Strike's 0.92, yet every
  source describes Pro as the softer, more pocketing string. Flagged in the
  Regna note; not resolved.
- **Eco Power** — Luxilon positions it near ALU Power Soft; the 1.00 kg/mm
  figure in the record sits nearer standard ALU Power. Flagged.
- **No lab stiffness:** Cash (Med-Firm inferred from review comparisons),
  Vamos (A5 base 0.90 vs Toroline's own ranking — sources conflict), Poly
  Tour Force (Med-Firm inferred from positioning). All stated in-note.
- **Mach-10** — the "slightly muted" summary is inferred from stiffness, not
  from reviews. Stated in the Regna note.
- **Fonseca** — attributed to Poly Tour Force only. v0.988 had him on both
  Force and Drive; Drive's description was Force's, so the attribution went
  with it. Not independently verified.

## Not touched

- **Grip notes** — 10 entries still use second-person conditionals ("if your
  hands sweat heavily", "pick this if you have a fresh leather grip"). These
  are conditional on the reader's circumstance rather than assertions about a
  fixed preference, and grips were outside the brief. One phrase changed:
  Pro Tour Leather's "(the existing Kimony top pick)" → "(Kimony's flagship
  leather grip)". Worth a pass if the neutral standard should apply to grips.
- **Feel tags and filter chips** — Crisp / Firm / Soft / Plush / Lively are
  descriptive attributes, kept as-is. Same for the comfort bar.
- **`shapeAttr: "square-textured"` filter bug** — still pending the
  normalise-vs-new-chip decision (affects TB Diamond Rough and Aspera Triplum).
- Renderer, compare, log, gut, search, filter and UX modules — unmodified
  except the one gut-status string.

---

## Verification

`smoke_v989.js` (jsdom): **48/48 pass.**

- Data: 72 strings, 10 hybrids, 35 grips, 21 gut pairings, 7 brands, 281
  rendered rows; PT630 at 98 sq in; no `topPick` key anywhere; every
  string/hybrid/gut note present; all 216 string notes differ from v0.988;
  tension bands, shape, gauge, bar and tag fields byte-identical to v0.988.
- **Neutrality audit** (also enforced at build time): no note, summary or
  expand line matches `your | you | OHBH | one-handed | Selim | Avoid | Skip |
  Perfect for | Ideal for | dead | deadened | preference`.
- Chrome: no string rec-boxes; 3 grip About boxes; no summary sections or
  cards; no ★ legend items; no toppick chips; 7 shape + 5 feel chips intact;
  topbar has no title; no `Prefers crisp` / `For your crisp` / `your profile`
  text; version tags v0.989 ×3; no v0.988 residue.
- Rendering: no `.tag-top`, no `tr.highlight`, no `data-toppick="1"`, no gut
  ★ badges; rewritten notes reach the DOM; gut strip count has no "top picks".
- Behaviour: hex chip narrows and clears; racquet switch; palette
  open/Escape; grips category renders 35 rows; compare checkboxes present.

Build: `build_989.py` over the v0.988 file, notes as Python dicts in
`notes_*.py`, `io.open(..., encoding='utf-8')` throughout, JSON re-serialised
with `ensure_ascii=False`. Every chrome regex asserts its expected match count.

## File size

| File | v0.988 | v0.989 | Δ |
|------|-------:|-------:|---|
| HTML | 447,627 | 418,703 | −29 KB (−6.5%) |

Removed rec-boxes and summary sections outweigh the slightly longer JSON.
