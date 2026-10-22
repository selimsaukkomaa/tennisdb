// Global search, ported from v0.990's tennis-search: an index over strings and hybrids (one
// entry per racquet), grips, gut pairings and stringing-log entries, and the v0.990 scoring.
import { gripBrandLabel } from './labels';
import { GRIP_TYPES, type BrandId, type GripType, type RacquetId, type TennisDb } from './types';

export type SearchType = 'string' | 'hybrid' | 'guthybrid' | 'grip' | 'log';

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

/** What the index needs from a stringing-log entry. */
export interface LogSearchEntry {
  id: string;
  racquet: RacquetId;
  date: string;
  stringName: string;
  tension: string;
  note: string;
}

/** Group order and headings in the results panel. */
export const SEARCH_GROUPS: readonly { type: SearchType; label: string }[] = [
  { type: 'string', label: 'Strings' },
  { type: 'hybrid', label: 'Hybrid sets' },
  { type: 'guthybrid', label: 'Natural gut hybrids' },
  { type: 'grip', label: 'Grips' },
  { type: 'log', label: 'Stringing log' },
];

/** Joins like v0.990's Array.join: null and undefined become empty strings. */
const joinText = (parts: readonly (string | null | undefined)[]): string =>
  parts.map((p) => p ?? '').join(' ');

const GRIP_SECTION_LABELS: Record<GripType, string> = {
  wet: 'Wet Overgrip',
  dry: 'Dry Overgrip',
  replacement: 'Replacement Grip',
};

export function buildSearchIndex(db: TennisDb, log: readonly LogSearchEntry[] = []): SearchItem[] {
  const items: SearchItem[] = [];
  const racquetLabel = (rid: RacquetId): string =>
    db.racquets.find((r) => r.id === rid)?.model ?? rid;
  const brandLabel = (brand: BrandId): string => db.brandsStrings[brand]?.name || brand;

  for (const s of db.strings) {
    for (const r of db.racquets) {
      const per = s.perRacquet?.[r.id];
      items.push({
        type: 'string',
        icon: '🎾',
        id: s.id,
        label: s.name,
        sublabel: `${brandLabel(s.brand)} · ${racquetLabel(r.id)}`,
        racquet: r.id,
        brand: s.brand,
        sourceText: joinText([
          s.name,
          brandLabel(s.brand),
          s.shape,
          (s.feelTags ?? []).map((t) => t.label).join(' '),
          s.feelSummary,
          s.feelExpand,
          per?.note,
          per?.tension,
        ]),
      });
    }
  }

  for (const h of db.hybrids) {
    for (const r of db.racquets) {
      const per = h.perRacquet?.[r.id];
      items.push({
        type: 'hybrid',
        icon: '🧬',
        id: h.id,
        label: `${h.name} (hybrid)`,
        sublabel: `${brandLabel(h.brand)} · ${racquetLabel(r.id)}`,
        racquet: r.id,
        brand: h.brand,
        sourceText: joinText([
          h.name,
          brandLabel(h.brand),
          h.mains?.string,
          h.crosses?.string,
          (h.feelTags ?? []).map((t) => t.label).join(' '),
          h.feelSummary,
          h.feelExpand,
          per?.note,
          per?.tension,
        ]),
      });
    }
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
            (g.specs ?? []).join(' '),
            (g.feelTags ?? []).map((t) => t.label).join(' '),
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

  for (const rid of Object.keys(db.gutHybrids)) {
    for (const p of db.gutHybrids[rid] ?? []) {
      const configLabel = p.config === 'gut-mains' ? '⬆ Gut Mains' : '⬇ Gut Crosses';
      items.push({
        type: 'guthybrid',
        icon: '🎻',
        id: p.id,
        label: `${p.mains.string} / ${p.crosses.string}`,
        sublabel: `${configLabel} · ${racquetLabel(rid)}`,
        racquet: rid,
        sourceText: joinText([
          p.mains.string,
          p.crosses.string,
          p.feelLabel,
          p.notes,
          p.tension,
          configLabel,
        ]),
      });
    }
  }

  for (const e of log) {
    items.push({
      type: 'log',
      icon: '📋',
      id: `log-${e.id}`,
      label: e.stringName,
      sublabel: `Logged on ${e.date} · ${racquetLabel(e.racquet)}${e.tension ? ` @ ${e.tension}` : ''}`,
      racquet: e.racquet,
      sourceText: joinText([e.stringName, e.tension, e.note, e.date]),
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
