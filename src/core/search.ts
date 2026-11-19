// Global search, ported from v0.990's tennis-search: an index over the racquets, strings and
// hybrids, grips and gut pairings, and the v0.990 scoring. Since v1.10 the index is built for
// the racquet on screen: each string once, with that racquet's tension and note, and its gut
// pairings only. v0.990 listed every string once per racquet, which ten racquets would swamp.
import { gripBrandLabel, racquetLabel, racquetSpec } from './labels';
import { perRacquet, tensionLabel } from './pairings';
import { GRIP_TYPES, type BrandId, type GripType, type RacquetId, type TennisDb } from './types';

export type SearchType = 'racquet' | 'string' | 'hybrid' | 'guthybrid' | 'grip';

export interface SearchItem {
  type: SearchType;
  icon: string;
  id: string;
  label: string;
  sublabel: string;
  racquet?: RacquetId;
  brand?: BrandId;
  /** Grip section, for navigating to a grip row. */
  section?: GripType;
  /** Everything the query is matched against, joined with spaces. */
  sourceText: string;
}

/** Group order and headings in the results panel. */
export const SEARCH_GROUPS: readonly { type: SearchType; label: string }[] = [
  { type: 'racquet', label: 'Rackets' },
  { type: 'string', label: 'Strings' },
  { type: 'hybrid', label: 'Hybrid sets' },
  { type: 'guthybrid', label: 'Natural gut hybrids' },
  { type: 'grip', label: 'Grips' },
];

/** Joins like v0.990's Array.join: null and undefined become empty strings. */
const joinText = (parts: readonly (string | null | undefined)[]): string =>
  parts.map((p) => p ?? '').join(' ');

const GRIP_SECTION_LABELS: Record<GripType, string> = {
  wet: 'Wet Overgrip',
  dry: 'Dry Overgrip',
  replacement: 'Replacement Grip',
};

/**
 * A racquet result's icon: a strung head and a handle, as no emoji draws a tennis racquet. The
 * string bed keeps it from reading as a magnifying glass next to the search field.
 */
export const RACQUET_ICON =
  '<svg class="search-racquet-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><g transform="rotate(40 8 8)" fill="none" stroke="currentColor"><path d="M6.2 1.3v8.4M8 .7v9.6M9.8 1.3v8.4M4.6 3.5h6.8M4.2 5.5h7.6M4.6 7.5h6.8" stroke-width=".6"/><ellipse cx="8" cy="5.5" rx="3.8" ry="4.8" stroke-width="1.4"/><path d="M8 10.4v4.9" stroke-width="1.9" stroke-linecap="round"/></g></svg>';

/** The index for one racquet: the racquet on screen, which is where every result opens. */
export function buildSearchIndex(db: TennisDb, racquet: RacquetId): SearchItem[] {
  const items: SearchItem[] = [];
  const model = (rid: RacquetId): string => db.racquets.find((r) => r.id === rid)?.model ?? rid;
  const brandLabel = (brand: BrandId): string => db.brandsStrings[brand]?.name || brand;

  for (const r of db.racquets) {
    items.push({
      type: 'racquet',
      icon: RACQUET_ICON,
      id: r.id,
      label: r.model,
      sublabel: `${r.brand} · ${racquetSpec(r)}`,
      racquet: r.id,
      sourceText: joinText([racquetLabel(r), racquetSpec(r)]),
    });
  }

  for (const s of db.strings) {
    const per = perRacquet(db, s.id, racquet);
    items.push({
      type: 'string',
      icon: '🎾',
      id: s.id,
      label: s.name,
      sublabel: `${brandLabel(s.brand)} · ${model(racquet)}`,
      racquet,
      brand: s.brand,
      sourceText: joinText([
        s.name,
        brandLabel(s.brand),
        s.shape,
        s.feelTags.join(' '),
        s.feelSummary,
        s.feelExpand,
        per?.note,
        per?.tension,
      ]),
    });
  }

  for (const h of db.hybrids) {
    const per = perRacquet(db, h.id, racquet);
    items.push({
      type: 'hybrid',
      icon: '🧬',
      id: h.id,
      label: `${h.name} (hybrid)`,
      sublabel: `${brandLabel(h.brand)} · ${model(racquet)}`,
      racquet,
      brand: h.brand,
      sourceText: joinText([
        h.name,
        brandLabel(h.brand),
        h.mains?.string,
        h.crosses?.string,
        h.feelTags.join(' '),
        h.feelSummary,
        h.feelExpand,
        per?.note,
        per?.tension,
      ]),
    });
  }

  for (const brand of Object.keys(db.grips)) {
    for (const section of GRIP_TYPES) {
      for (const g of db.grips[brand]?.[section] ?? []) {
        const sectionLabel = GRIP_SECTION_LABELS[section];
        items.push({
          type: 'grip',
          icon: section === 'replacement' ? '🪢' : '🎯',
          id: g.id,
          label: g.name,
          sublabel: `${gripBrandLabel(brand)} · ${sectionLabel}`,
          brand,
          section,
          sourceText: joinText([
            g.name,
            gripBrandLabel(brand),
            g.model || '',
            (g.modelVariants ?? []).join(' '),
            (g.specs ?? []).map((s) => s.text).join(' '),
            g.feelTags.join(' '),
            g.feelSummary,
            g.feelExpand,
            g.colors,
            g.notes,
            g.material || '',
            sectionLabel,
          ]),
        });
      }
    }
  }

  for (const p of db.gutHybrids.filter((g) => g.racquetId === racquet)) {
    const rid = p.racquetId;
    const configLabel = p.config === 'gut-mains' ? '⬆ Gut Mains' : '⬇ Gut Crosses';
    items.push({
      type: 'guthybrid',
      icon: '🎻',
      id: p.id,
      label: `${p.mains.string} / ${p.crosses.string}`,
      sublabel: `${configLabel} · ${model(rid)}`,
      racquet: rid,
      sourceText: joinText([
        p.mains.string,
        p.crosses.string,
        p.feelLabel,
        p.notes,
        tensionLabel(p.tension),
        configLabel,
      ]),
    });
  }

  return items;
}

/**
 * Matches a query (2+ characters) against the index, best first: exact label, label prefix,
 * label word start, label substring, then source-text word start and substring.
 */
export function searchIndex(query: string, items: readonly SearchItem[]): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of items) {
    const label = item.label.toLowerCase();
    const source = item.sourceText.toLowerCase();
    let score: number;
    if (label === q) score = 100;
    else if (label.startsWith(q)) score = 80;
    else if (label.includes(' ' + q)) score = 60;
    else if (label.includes(q)) score = 50;
    else if (source.includes(' ' + q)) score = 30;
    else if (source.includes(q)) score = 20;
    else continue;
    scored.push({ item, score });
  }
  // Array.prototype.sort is stable, so equal scores keep index order, as in v0.990.
  return scored.sort((a, b) => b.score - a.score).map((s) => s.item);
}

/** The key a rendered result carries to find its item again. */
export const resultKey = (item: SearchItem): string =>
  `${item.type}:${item.id}:${item.racquet || ''}`;
