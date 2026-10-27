// Data invariants, from v0.990's build_990.py and smoke suite. Pure: they take the assembled
// data (plus the stylesheet text, for tag colours) and return the problems found. Run by the
// Vitest suite, `npm run validate`, and a Vite plugin on every dev start and build.
import { FEEL_CHIPS, SHAPE_CHIPS, tokens } from './chips';
import type { Copy, Grip, Hybrid, StringRec, TennisDb } from './types';
import { GRIP_TYPES } from './types';

export interface Issue {
  rule: string;
  where: string;
  message: string;
}

/** v0.989 neutrality audit: preference, second-person and verdict language in notes. */
export const PREFERENCE_LANGUAGE =
  /\byour\b|\byou\b|\byou're\b|OHBH|one-handed|Selim|\bAvoid\b|\bSkip\b|\bPerfect for\b|\bIdeal for\b|\bdead\b|\bdeadened\b|\bpreference\b/i;

/** v0.990 grip-text audit (build_990.py's pattern, with the smoke suite's broader "connection"). */
export const GRIP_VERDICT_LANGUAGE =
  /\byour?\b|\byou\b|you'll|you've|\bprefer|\bBest for\b|\bBest choice\b|\bideal\b|\bNiche pick\b|gold standard|legendary|\bperfectly\b|\bultimate\b|\bamazing\b|connection|\bconnected\b/i;

/** Grip About boxes (v0.990 smoke suite). */
export const ABOUT_VERDICT_LANGUAGE = /\byour?\b|\bstrong\b|prefer/i;

/** Stiffness bands: Med-Firm and firmer is Firm, Medium and softer is Soft (v0.990 rule). */
export const FIRM_BANDS = new Set(['Very Firm', 'Firm', 'Med-Firm']);
export const SOFT_BANDS = new Set(['Med', 'Medium', 'Med-Soft', 'Soft', 'Very Soft']);

/** One tag label, one colour: v0.990's label -> variant table for strings and hybrids. */
export const TAG_VARIANTS: Record<string, string> = {
  Crisp: 'crisp',
  Firm: 'firm',
  Precise: 'firm',
  Controlled: 'firm',
  Aggressive: 'firm',
  Soft: 'soft',
  Softer: 'soft',
  'Very Soft': 'soft',
  Moderate: 'soft',
  Muted: 'soft',
  Smooth: 'round',
  Bite: 'round',
  Lively: 'lively',
  Elastic: 'lively',
  Explosive: 'lively',
  Responsive: 'lively',
  Plush: 'plush',
  Pocketing: 'plush',
  Comfortable: 'plush',
};

const MIN_NOTE_CHARS = 40;

export const stiffnessBand = (row: StringRec | Hybrid): string =>
  row.stiffness.label.split(' · ')[0]!.trim();

export function allGrips(db: TennisDb): (Grip & { brand: string })[] {
  return Object.entries(db.grips).flatMap(([brand, byType]) =>
    GRIP_TYPES.flatMap((t) => (byType[t] ?? []).map((g) => ({ ...g, brand }))),
  );
}

/** Notes that state a fact the grip bars must back up; checked whenever the text is present. */
interface BarClaim {
  grip: string;
  text: string;
  holds: (db: TennisDb) => boolean;
}

const tack = (g: Grip): number => g.tackiness?.width ?? 0;
const absorb = (g: Grip): number => g.absorption?.width ?? 0;

export const BAR_CLAIMS: readonly BarClaim[] = [
  {
    grip: 'Mega Tac',
    text: "Tourna's highest-tack grip",
    holds: (db) => {
      const tourna = allGrips(db).filter((g) => g.brand === 'tourna');
      return tourna.every((g) => tack(g) <= tack(tourna.find((x) => x.name === 'Mega Tac')!));
    },
  },
  {
    grip: 'Mega Tac',
    text: 'the tackiness data puts Kimony Hi-Soft EX and Yonex Super Grap JP higher',
    holds: (db) => {
      const by = (n: string): Grip | undefined => allGrips(db).find((g) => g.name === n);
      const mega = tack(by('Mega Tac')!);
      // The note's "Yonex Super Grap JP" is the record named "Wet Super Grap (JP)".
      return tack(by('Hi-Soft EX')!) > mega && tack(by('Wet Super Grap (JP)')!) > mega;
    },
  },
  {
    grip: 'Tourna Grip Original',
    text: 'the highest absorption rating in the database',
    holds: (db) => {
      const grips = allGrips(db);
      const original = grips.find((g) => g.name === 'Tourna Grip Original')!;
      return grips.every((g) => absorb(g) <= absorb(original));
    },
  },
];

export function validateData(db: TennisDb, copy: Copy, css: string): Issue[] {
  const issues: Issue[] = [];
  const fail = (rule: string, where: string, message: string): void => {
    issues.push({ rule, where, message });
  };
  const racquetIds = db.racquets.map((r) => r.id);
  const rows: (StringRec | Hybrid)[] = [...db.strings, ...db.hybrids];
  const grips = allGrips(db);
  const pairings = Object.values(db.gutHybrids).flat();

  // ---- neutrality
  for (const r of rows) {
    for (const rid of racquetIds) {
      if (PREFERENCE_LANGUAGE.test(r.perRacquet[rid]?.note ?? '')) {
        fail('neutral-text', `${r.id}/${rid}`, 'preference or verdict language in note');
      }
    }
    if (PREFERENCE_LANGUAGE.test(r.feelSummary))
      fail('neutral-text', `${r.id}/summary`, 'preference or verdict language');
    if (PREFERENCE_LANGUAGE.test(r.feelExpand))
      fail('neutral-text', `${r.id}/expand`, 'preference or verdict language');
  }
  for (const p of pairings) {
    if (PREFERENCE_LANGUAGE.test(p.notes))
      fail('neutral-text', p.id, 'preference or verdict language in note');
  }
  for (const g of grips) {
    if (GRIP_VERDICT_LANGUAGE.test([g.notes, g.feelSummary, g.feelExpand].join(' '))) {
      fail('neutral-grip-text', g.id, 'second-person or verdict language');
    }
  }
  for (const [brand, about] of Object.entries(copy.gripAbout)) {
    if (ABOUT_VERDICT_LANGUAGE.test(about.replace(/<[^>]+>/g, ''))) {
      fail('neutral-grip-text', `about/${brand}`, 'verdict language in About box');
    }
  }

  // ---- notes present for every racquet
  for (const r of rows) {
    for (const rid of racquetIds) {
      const note = r.perRacquet[rid]?.note ?? '';
      if (note.trim().length < MIN_NOTE_CHARS)
        fail('notes-present', `${r.id}/${rid}`, 'note missing or shorter than 40 characters');
    }
  }
  for (const p of pairings) {
    if ((p.notes ?? '').trim().length < MIN_NOTE_CHARS)
      fail('notes-present', p.id, 'gut pairing note missing or short');
  }

  // ---- feel chips
  for (const r of rows) {
    const feel = tokens(r.feelAttr);
    const band = stiffnessBand(r);
    if (!FIRM_BANDS.has(band) && !SOFT_BANDS.has(band))
      fail('stiffness-band', r.id, `unknown stiffness band "${band}"`);
    if (feel.includes('firm') === feel.includes('soft'))
      fail('firm-xor-soft', r.id, 'needs exactly one of firm / soft');
    else if (feel.includes('firm') !== FIRM_BANDS.has(band))
      fail('firm-soft-band', r.id, `firm/soft contradicts stiffness band "${band}"`);
    const crispTag = r.feelTags.some((t) => t.label === 'Crisp') || /crisp/i.test(r.feelSummary);
    if (feel.includes('crisp') !== crispTag)
      fail('crisp-tag', r.id, 'Crisp chip and Crisp tag/summary disagree');
    for (const t of feel) {
      if (!FEEL_CHIPS.some((c) => c.value === t))
        fail('feel-tokens', r.id, `feel value "${t}" matches no chip`);
    }
    for (const t of tokens(r.shapeAttr)) {
      if (!SHAPE_CHIPS.some((c) => c.value === t))
        fail('shape-tokens', r.id, `shape value "${t}" matches no chip`);
    }
  }
  for (const chip of FEEL_CHIPS) {
    if (!db.strings.some((s) => tokens(s.feelAttr).includes(chip.value))) {
      fail('feel-chip-coverage', chip.value, 'feel chip matches no single string');
    }
  }

  // ---- grips: every type matches its chip, nothing untagged
  for (const g of grips) {
    const feel = tokens(g.gripFeelAttr);
    if (!g.gripFeelAttr) fail('grip-tags', g.id, 'untagged grip');
    if (g.gripType === 'dry' && !feel.includes('dry'))
      fail('grip-tags', g.id, 'dry grip does not match the Dry chip');
    if (g.gripType === 'wet' && !feel.includes('tacky'))
      fail('grip-tags', g.id, 'wet grip does not match the Tacky chip');
    if (
      g.gripType === 'replacement' &&
      (g.material ?? g.name).includes('eather') &&
      !feel.includes('leather')
    ) {
      fail('grip-tags', g.id, 'leather replacement grip does not match the Leather chip');
    }
  }

  // ---- tag colours
  const seen = new Map<string, string>();
  for (const r of rows) {
    for (const t of r.feelTags) {
      const expected = TAG_VARIANTS[t.label];
      if (!expected) fail('tag-variant', r.id, `tag "${t.label}" has no entry in the colour table`);
      else if (t.variant !== expected)
        fail('tag-variant', r.id, `tag "${t.label}" is ${t.variant}, expected ${expected}`);
      if (seen.has(t.label) && seen.get(t.label) !== t.variant)
        fail('tag-variant', r.id, `tag "${t.label}" coloured two ways`);
      seen.set(t.label, t.variant);
    }
  }
  const variants = new Set([...rows, ...grips].flatMap((r) => r.feelTags.map((t) => t.variant)));
  for (const v of variants) {
    if (!new RegExp(String.raw`\.tag-${v}\s*\{`).test(css))
      fail('tag-css', v, `no CSS rule for .tag-${v}`);
  }
  // Every grip brand gets a coloured header while a grip filter spans all brands.
  for (const brand of Object.keys(db.grips)) {
    if (!new RegExp(String.raw`\.gfilter-header-${brand}\s*\{`).test(css))
      fail('grip-header-css', brand, `no CSS rule for .gfilter-header-${brand}`);
  }

  // ---- claims in notes that rest on bar values
  for (const claim of BAR_CLAIMS) {
    const g = grips.find((x) => x.name === claim.grip);
    if (!g) {
      fail('bar-claims', claim.grip, 'grip named by a claim is missing');
      continue;
    }
    const text = [g.notes, g.feelSummary, g.feelExpand].join(' ');
    if (text.includes(claim.text) && !claim.holds(db)) {
      fail('bar-claims', g.id, `"${claim.text}" is not backed by the bars`);
    }
  }

  // ---- integrity
  const duplicates = (ids: string[]): string[] => ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const id of duplicates([...rows.map((r) => r.id), ...grips.map((g) => g.id)]))
    fail('ids-unique', id, 'duplicate id');
  for (const id of duplicates([...pairings.map((p) => p.id), ...db.gutStrings.map((g) => g.id)]))
    fail('ids-unique', id, 'duplicate id');
  for (const id of duplicates(racquetIds)) fail('ids-unique', id, 'duplicate racquet id');
  for (const r of rows) {
    if (!db.brandsStrings[r.brand]) fail('brand-refs', r.id, `unknown brand "${r.brand}"`);
    const keys = Object.keys(r.perRacquet).sort().join(',');
    if (keys !== [...racquetIds].sort().join(','))
      fail(
        'per-racquet-keys',
        r.id,
        `perRacquet has ${keys}, racquets are ${racquetIds.join(',')}`,
      );
  }
  for (const rid of Object.keys(db.gutHybrids)) {
    if (!racquetIds.includes(rid)) fail('gut-racquets', rid, 'gut pairings for an unknown racquet');
  }
  const stringIds = new Set([...db.strings, ...db.hybrids].map((s) => s.id));
  const gutIds = new Set(db.gutStrings.map((g) => g.id));
  for (const p of pairings) {
    for (const side of [p.mains, p.crosses]) {
      const ok = side.stringId.startsWith('gut-')
        ? gutIds.has(side.stringId)
        : stringIds.has(side.stringId);
      if (!ok) fail('gut-string-refs', p.id, `unknown stringId "${side.stringId}"`);
    }
  }
  for (const [brand, footer] of Object.entries(copy.brandFooters)) {
    if (!db.brandsStrings[brand])
      fail('copy-refs', `footer/${brand}`, 'footer for an unknown brand');
    for (const rid of Object.keys(footer.byRacquet ?? {})) {
      if (!racquetIds.includes(rid))
        fail('copy-refs', `footer/${brand}/${rid}`, 'override for an unknown racquet');
    }
  }
  for (const brand of Object.keys(copy.hybridCards)) {
    if (!db.brandsStrings[brand])
      fail('copy-refs', `hybrid-card/${brand}`, 'card for an unknown brand');
  }
  for (const brand of Object.keys(copy.gripAbout)) {
    if (!db.grips[brand])
      fail('copy-refs', `about/${brand}`, 'About box for an unknown grip brand');
  }

  // ---- retired in v0.989 / v0.990
  const json = JSON.stringify(db);
  if (json.includes('topPick')) fail('retired', 'data', 'topPick key present');
  if (/[Cc]onnected/.test(json)) fail('retired', 'data', '"Connected" vocabulary present');
  for (const s of db.strings) {
    if (s.shapeAttr === 'square-textured')
      fail('retired', s.id, 'shapeAttr "square-textured" (no chip emits it)');
  }

  return issues;
}
