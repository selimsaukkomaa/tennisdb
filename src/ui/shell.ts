// Builds the page body from data: the racquet + strings card, the racquet pages (one section
// per string brand and the natural gut view) and the grips category. v0.990 had this markup
// written out three times with per-racquet ids; here a fourth racquet needs only data.
//
// Since v1.10 the card is shared by every racquet and a racquet's page is built the first time
// it is shown (nav.ts), so ten racquets don't put ten pages of tables in the DOM at load.
//
// Markup mirrors v0.990 line for line: elements sit on their own lines (the whitespace between
// them matters wherever they render inline) and attribute values are the legacy ones.
import {
  FEEL_CHIPS,
  GRIP_FEEL_CHIPS,
  GRIP_TYPE_CHIPS,
  SHAPE_CHIPS,
  type Chip,
} from '../core/chips';
import {
  GRIP_TYPES,
  type BrandId,
  type Copy,
  type GripType,
  type Racquet,
  type RacquetId,
  type TennisDb,
} from '../core/types';
import { gripBrandLabel, racquetSpec } from '../core/labels';
import { perRacquet } from '../core/pairings';
import { APP_VERSION } from '../version';
import { html, raw, type SafeHtml } from './html';
import { frameHtml } from './frame';
import { pickerHtml } from './picker';
import {
  HYBRID_HEAD,
  OVERGRIP_HEAD,
  REPLACEMENT_HEAD,
  STRING_HEAD,
  hybridRow,
  overgripRow,
  replacementRow,
  stringRow,
} from './tables';

// ---------------------------------------------------------------- ids

export const racquetContentId = (rid: RacquetId): string => `${rid}-content`;
export const brandSectionId = (rid: RacquetId, brand: BrandId): string => `${rid}-${brand}-section`;
/** The card's strings choices, shared by every racquet since v1.10. */
export const brandButtonId = (brand: BrandId): string => `btn-${brand}`;
const brandHeaderId = (rid: RacquetId, brand: BrandId): string => `fh-${rid}-${brand}-section`;
export const gripSectionId = (brand: BrandId): string => `grip-${brand}-section`;

/** The natural gut hybrids are one more choice in the strings row (since v1.8). */
export const GUT = 'gut';

// ---------------------------------------------------------------- the racquet + strings card

/**
 * The card above the racquet pages: "Regna 100 × Toroline", the racquet's spec, then the racquet
 * menu (picker.ts, since v1.10), the strings to choose from and the frame profile (frame.ts,
 * since v1.12). It is written for the first racquet and brand; nav.ts keeps the title, spec,
 * choices and profile current.
 */
function selector(db: TennisDb): SafeHtml {
  const r = db.racquets[0]!;
  const brands = Object.keys(db.brandsStrings);
  return html`<div class="selector" id="selector">
<div class="sel-title"><span class="sel-racquet" data-sel-racquet>${r.model}</span><span class="sel-x">×</span><span class="sel-strings" data-sel-strings>${db.brandsStrings[brands[0]!]!.name}</span></div>
<div class="sel-spec"><span class="sel-spec-text" data-sel-spec>${r.brand} · ${racquetSpec(r)}</span><span class="filter-all-badge" id="filter-badge">— showing all</span></div>
<div class="sel-row"><span class="sel-label">Racket</span>${pickerHtml(db, 'card', r.id)}</div>
<div class="sel-row"><span class="sel-label">Strings</span><div class="switcher" id="strings-switcher">
${brands.map((b) => html`<button id="${brandButtonId(b)}" data-nav-brand="${b}">${db.brandsStrings[b]!.name}</button>\n`)}<button class="gut-choice" id="${brandButtonId(GUT)}" data-nav-brand="${GUT}">Natural gut</button>
</div></div>
<div class="sel-frame${r.profile ? '' : ' frame-none'}" data-frame>${frameHtml(r)}</div>
</div>`;
}

// ---------------------------------------------------------------- filter bars

function chipGroup(
  label: string,
  chips: readonly Chip[],
  group: string,
  prefix: 'filter' | 'gfilter',
): SafeHtml {
  return html`<div class="filter-group">
<span class="filter-group-label">${label}</span>
${chips.map((c) => html`<button class="filter-chip" data-${prefix}-group="${group}" data-${prefix}-value="${c.value}">${c.label}</button>\n`)}</div>`;
}

function stringFilterBar(): SafeHtml {
  return html`<div class="filter-summary" id="filter-summary"></div>
<div class="filter-bar filter-visible" id="filter-bar">
<div class="filter-search-row">
<input class="filter-search" id="filter-search" data-short-placeholder="Search by name, shape, notes…" placeholder="Search strings by name, shape, notes..." type="text"/>
<button class="filter-clear-btn" id="filter-clear">Clear filters</button>
<div class="filter-status" id="filter-status"></div>
</div>
<div class="filter-groups">
${chipGroup('Shape', SHAPE_CHIPS, 'shape', 'filter')}
<div class="filter-divider"></div>
${chipGroup('Feel', FEEL_CHIPS, 'feel', 'filter')}
</div>
</div>`;
}

function gripFilterBar(): SafeHtml {
  return html`<div class="filter-summary" id="grip-filter-summary"></div>
<div class="filter-bar grip-filter-bar" id="grip-filter-bar">
<div class="filter-search-row">
<input class="filter-search" id="grip-filter-search" data-short-placeholder="Search by name, model, notes…" placeholder="Search grips by name, model, notes..." type="text"/>
<button class="filter-clear-btn" id="grip-filter-clear">Clear filters</button>
<div class="filter-status" id="grip-filter-status"></div>
</div>
<div class="filter-groups">
${chipGroup('Type', GRIP_TYPE_CHIPS, 'type', 'gfilter')}
<div class="filter-divider"></div>
${chipGroup('Feel', GRIP_FEEL_CHIPS, 'feel', 'gfilter')}
</div>
</div>`;
}

// ---------------------------------------------------------------- strings category

function legend(items: Copy['legends']['strings']): SafeHtml {
  return html`<div class="legend">
${items.map((l) => html`<div class="legend-item"><div class="legend-swatch" style="background:${l.swatch}"></div> ${l.label}</div>\n`)}</div>`;
}

function brandSection(db: TennisDb, copy: Copy, r: Racquet, brand: BrandId): SafeHtml {
  const name = db.brandsStrings[brand]!.name;
  const strings = db.strings.filter((s) => s.brand === brand);
  const hybrids = db.hybrids.filter((h) => h.brand === brand);
  const card = copy.hybridCards[brand];
  const footer = copy.brandFooters[brand];
  const hybridCard =
    hybrids.length && card
      ? html`
<div class="card" style="margin-top:1rem;">
<h3 style="color:#7dd3fc; margin-bottom:0.5rem;">${raw(card.heading)}</h3>
<p style="font-size:0.85rem; color:#94a3b8; margin-bottom:0.75rem;">${raw(card.intro)}</p>
<table class="hybrid-table" data-brand="${brand}" data-racquet="${r.id}" data-render="hybrid">
${HYBRID_HEAD}
<tbody>${hybrids.map((h) => hybridRow(h, perRacquet(db, h.id, r.id)))}</tbody>
</table>
</div>`
      : '';
  const footerHtml = footer
    ? html`
<div class="footer">
${raw(footer.byRacquet?.[r.id] ?? footer.default)}
</div>`
    : '';
  return html`<div class="filter-brand-header" id="${brandHeaderId(r.id, brand)}">${name}</div>
<div class="brand-section ${brand}-view" id="${brandSectionId(r.id, brand)}">
<div class="table-wrap">
<table data-brand="${brand}" data-racquet="${r.id}" data-render="strings">
${STRING_HEAD}
<tbody>${strings.map((s) => stringRow(s, perRacquet(db, s.id, r.id)))}</tbody>
</table>
</div>${hybridCard}${footerHtml}
</div>
`;
}

/** A racquet's page: a section per string brand and the natural gut view (filled by gut.ts). */
export function racquetPage(db: TennisDb, copy: Copy, r: Racquet): SafeHtml {
  const brands = Object.keys(db.brandsStrings);
  return html`<div id="${racquetContentId(r.id)}" data-racquet-page="${r.id}">
${brands.map((b) => brandSection(db, copy, r, b))}<div class="gut-view" id="${brandSectionId(r.id, GUT)}" data-racquet="${r.id}"></div>
</div>
`;
}

/** The racquet pages go here as they are built. */
export const RACQUET_PAGES_ID = 'racquet-pages';

function stringsCategory(db: TennisDb, copy: Copy): SafeHtml {
  return html`<div class="category-content cat-visible" id="strings-content">
${stringFilterBar()}
${selector(db)}
<div id="${RACQUET_PAGES_ID}"></div>
${legend(copy.legends.strings)}
<div class="version-tag">v${APP_VERSION}</div>
</div>
`;
}

// ---------------------------------------------------------------- grips category

const GRIP_HEADINGS: Record<GripType, string> = {
  wet: 'Overgrips (Wet)',
  dry: 'Overgrips (Dry)',
  replacement: 'Replacement Grips',
};

const SUBHEADING_FONT = "font-family:'Space Mono',monospace; font-size:0.9rem; font-weight:700;";
const SUBHEADING_TAIL = 'color:#111; letter-spacing:-0.3px;';
/** Spacing above each grip subheading: none for the first, 20px after. */
const SUBHEADING_MARGIN = { first: 'margin-bottom:12px;', rest: 'margin:20px 0 12px 0;' };
/** v0.990 quirk kept for parity: Tourna's later subheadings sit 32px below the table above. */
const SUBHEADING_MARGIN_BY_BRAND: Record<BrandId, string> = {
  tourna: 'margin-bottom:12px; margin-top:32px;',
};

function gripTable(brand: BrandId, type: GripType, db: TennisDb): SafeHtml {
  const grips = db.grips[brand]?.[type] ?? [];
  const replacement = type === 'replacement';
  return html`<div class="table-wrap">
<table${replacement ? raw(' class="grip-replacement-table"') : ''} data-grip-brand="${brand}" data-grip-section="${type}" data-grip-table="${replacement ? 'replacement' : 'overgrip'}" data-render="grips">
${replacement ? REPLACEMENT_HEAD : OVERGRIP_HEAD}
<tbody>${grips.map((g) => (replacement ? replacementRow(g) : overgripRow(g)))}</tbody>
</table>
</div>`;
}

function gripBrandSection(db: TennisDb, copy: Copy, brand: BrandId): SafeHtml {
  const types = GRIP_TYPES.filter((t) => db.grips[brand]?.[t]);
  // Shown above the section while a grip filter spans every brand. v0.990 had none for Tourna.
  const header = html`<div class="gfilter-brand-header gfilter-header-${brand}" id="gfh-${brand}">${gripBrandLabel(brand)}</div>\n`;
  const about = copy.gripAbout[brand];
  return html`${header}<div class="brand-section" id="${gripSectionId(brand)}" style="display:none;">
${about ? html`<div class="rec-box">\n${raw(about)}\n</div>\n` : ''}${types.map((t, i) => {
    const margin =
      i === 0
        ? SUBHEADING_MARGIN.first
        : (SUBHEADING_MARGIN_BY_BRAND[brand] ?? SUBHEADING_MARGIN.rest);
    return html`<h3 class="grip-subheading" style="${SUBHEADING_FONT} ${margin} ${SUBHEADING_TAIL}">${GRIP_HEADINGS[t]}</h3>
${gripTable(brand, t, db)}
`;
  })}</div>
`;
}

function gripsCategory(db: TennisDb, copy: Copy): SafeHtml {
  const brands = Object.keys(db.grips);
  return html`<div class="category-content" id="grips-content">
<div class="context-line" data-grips><span class="ctx-name">Grips</span><span class="ctx-spec">Overgrips · replacement grips · ${brands.length} brands</span><span class="gfilter-all-badge" id="grip-filter-badge">— showing all</span></div>
<div class="switcher" id="grip-switcher">
${brands.map((b) => html`<button id="btn-grip-${b}" data-nav-grip-brand="${b}">${gripBrandLabel(b)}</button>\n`)}</div>
${gripFilterBar()}
${brands.map((b) => gripBrandSection(db, copy, b))}${legend(copy.legends.grips)}
</div>
`;
}

// ---------------------------------------------------------------- mount

export function renderShell(db: TennisDb, copy: Copy): void {
  document.querySelector('.container')!.innerHTML =
    '\n' + stringsCategory(db, copy).value + gripsCategory(db, copy).value;
}
