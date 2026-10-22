// Table markup and row builders, ported from v0.990's tennis-renderer. Rows are built without
// whitespace between cells, exactly as the legacy string concatenation produced them.
import type {
  Bar,
  Colors,
  FeelTag,
  Grip,
  Hybrid,
  HybridSide,
  RacquetId,
  StringRec,
} from '../core/types';
import { html, join, raw, type SafeHtml } from './html';

const BR = raw('<br>');

// ---------------------------------------------------------------- cells

export function barCell(klass: string, bar: Bar | undefined): SafeHtml {
  if (!bar) return raw('<td class="bar-cell"></td>');
  return html`<td class="bar-cell"><span class="bar-label">${bar.label}</span><div class="bar"><div class="bar-fill ${klass}" style="width:${bar.width ?? 0}%"></div></div></td>`;
}

function colorsCell(colors: Colors | undefined): SafeHtml {
  if (!colors?.dots?.length) return raw('<td></td>');
  const dots = colors.dots.map(
    (c) => html`<span class="color-dot" style="background:${c.hex};" title="${c.name}"></span>`,
  );
  return html`<td><div class="colors">${dots}</div><span class="color-label">${colors.label || ''}</span></td>`;
}

export function feelTagsHtml(tags: readonly FeelTag[], sep = ''): SafeHtml {
  return join(
    (tags ?? []).map((t) => html`<span class="tag tag-${t.variant}">${t.label}</span>`),
    raw(sep),
  );
}

function feelCell(tags: readonly FeelTag[], summary: string, expand: string): SafeHtml {
  const text =
    summary || expand
      ? html`<br>${summary || ''}${expand ? html`<span class="feel-expand"> ${expand}</span>` : ''}`
      : '';
  return html`<td>${feelTagsHtml(tags)}${text}</td>`;
}

/** Name cell; strings and hybrids get a compare checkbox, grips don't. */
function nameCell(name: string, compareId?: string): SafeHtml {
  const cb = compareId
    ? html`<input type="checkbox" class="compare-check" data-compare-id="${compareId}" aria-label="Add to compare">`
    : '';
  return html`<td class="string-name">${cb}${name}</td>`;
}

function tensionCell(tension: string): SafeHtml {
  return html`<td style="white-space:nowrap; font-family:'Space Mono', monospace; font-size:0.78rem; color:#555;">${tension}</td>`;
}

/** v0.990 notes were extracted as innerHTML and are rendered as HTML. */
function notesCell(note: string | undefined): SafeHtml {
  return html`<td class="notes">${raw(note)}</td>`;
}

function hybridSideCell(side: HybridSide | undefined): SafeHtml {
  if (!side) return raw('<td></td>');
  const sub = side.shapeFeelLabel
    ? html`<br><span style="color:#94a3b8;font-size:0.8rem;">${side.shapeFeelLabel}</span>`
    : '';
  return html`<td>${side.string}${side.gauge ? ' ' + side.gauge : ''}${sub}</td>`;
}

// ---------------------------------------------------------------- rows

export function stringRow(s: StringRec, racquet: RacquetId): SafeHtml {
  const per = s.perRacquet?.[racquet];
  return html`<tr data-shape="${s.shapeAttr}" data-feel="${s.feelAttr}" data-type="string" data-id="${s.id}">${[
    nameCell(s.name, s.id),
    html`<td>${s.shape}</td>`,
    html`<td>${join(s.gauges ?? [], BR)}</td>`,
    colorsCell(s.colors),
    barCell('stiff', s.stiffness),
    barCell('power', s.power),
    feelCell(s.feelTags, s.feelSummary, s.feelExpand),
    barCell('spin', s.spin),
    barCell('control', s.control),
    barCell('comfort', s.comfort),
    tensionCell(per?.tension ?? ''),
    notesCell(per?.note),
  ]}</tr>`;
}

export function hybridRow(h: Hybrid, racquet: RacquetId): SafeHtml {
  const per = h.perRacquet?.[racquet];
  return html`<tr data-shape="${h.shapeAttr}" data-feel="${h.feelAttr}" data-type="hybrid" data-id="${h.id}">${[
    nameCell(h.name, h.id),
    hybridSideCell(h.mains),
    hybridSideCell(h.crosses),
    barCell('stiff', h.stiffness),
    barCell('power', h.power),
    barCell('spin', h.spin),
    feelCell(h.feelTags, h.feelSummary, h.feelExpand),
    tensionCell(per?.tension ?? ''),
    notesCell(per?.note),
  ]}</tr>`;
}

/** Grip specs may carry inline HTML (one <em> today), rendered as-is like v0.990. */
function specsCell(specs: readonly string[] | undefined): SafeHtml {
  if (!specs?.length) return raw('<td></td>');
  return html`<td><span style="font-family:'Space Mono',monospace;font-size:0.72rem;">${raw(specs.join('<br>'))}</span></td>`;
}

function colorsPlainCell(colors: string | undefined): SafeHtml {
  return html`<td><span style="font-size:0.72rem;color:#888;">${colors || ''}</span></td>`;
}

function gripRowOpen(g: Grip): SafeHtml {
  return html`<tr data-grip-type="${g.gripType}" data-grip-feel="${g.gripFeelAttr || ''}" data-id="${g.id}">`;
}

export function overgripRow(g: Grip): SafeHtml {
  const variants = g.modelVariants?.length
    ? html`<br><span style="color:#94a3b8;font-size:0.75rem;">${join(g.modelVariants, BR)}</span>`
    : '';
  return html`${gripRowOpen(g)}${[
    nameCell(g.name),
    html`<td>${g.model}${variants}</td>`,
    specsCell(g.specs),
    barCell('tackiness', g.tackiness),
    barCell('absorption', g.absorption),
    barCell('durability', g.durability),
    feelCell(g.feelTags, g.feelSummary, g.feelExpand),
    colorsPlainCell(g.colors),
    html`<td>${g.packSizes || ''}</td>`,
    notesCell(g.notes),
  ]}</tr>`;
}

export function replacementRow(g: Grip): SafeHtml {
  const material = g.material
    ? html`<td><span class="grip-type-tag${g.materialVariant ? ' grip-' + g.materialVariant : ''}">${g.material}</span></td>`
    : raw('<td></td>');
  return html`${gripRowOpen(g)}${[
    nameCell(g.name),
    html`<td>${g.model}</td>`,
    material,
    specsCell(g.specs),
    feelCell(g.feelTags, g.feelSummary, g.feelExpand),
    colorsPlainCell(g.colors),
    notesCell(g.notes),
  ]}</tr>`;
}

// ---------------------------------------------------------------- table heads
// Header cells sit on their own lines, as in the v0.990 markup.

interface Col {
  label: string;
  /** data-col value for sortable columns. */
  sort?: string;
}

function thead(cols: readonly Col[]): SafeHtml {
  const ths = cols.map((c) =>
    c.sort
      ? html`<th class="sortable" data-col="${c.sort}">${c.label}</th>\n`
      : html`<th>${c.label}</th>\n`,
  );
  return html`<thead>\n<tr>\n${ths}</tr>\n</thead>`;
}

export const STRING_HEAD = thead([
  { label: 'String', sort: 'string' },
  { label: 'Shape' },
  { label: 'Gauge' },
  { label: 'Colors' },
  { label: 'Stiffness', sort: 'stiffness' },
  { label: 'Power', sort: 'power' },
  { label: 'Feel' },
  { label: 'Spin', sort: 'spin' },
  { label: 'Control', sort: 'control' },
  { label: 'Comfort', sort: 'comfort' },
  { label: 'Tension (kg)' },
  { label: 'Notes for Your Setup' },
]);

export const HYBRID_HEAD = thead([
  { label: 'Hybrid Name', sort: 'string' },
  { label: 'Mains' },
  { label: 'Crosses' },
  { label: 'Stiffness', sort: 'stiffness' },
  { label: 'Power', sort: 'power' },
  { label: 'Spin', sort: 'spin' },
  { label: 'Character' },
  { label: 'Tension (kg)' },
  { label: 'Notes for Your Setup' },
]);

export const OVERGRIP_HEAD = thead([
  { label: 'Grip', sort: 'string' },
  { label: 'Model' },
  { label: 'Specs' },
  { label: 'Tackiness', sort: 'tackiness' },
  { label: 'Absorption', sort: 'absorption' },
  { label: 'Durability', sort: 'durability' },
  { label: 'Feel' },
  { label: 'Colors' },
  { label: 'Pack Sizes' },
  { label: 'Notes' },
]);

export const REPLACEMENT_HEAD = thead([
  { label: 'Grip', sort: 'string' },
  { label: 'Model' },
  { label: 'Material' },
  { label: 'Specs' },
  { label: 'Feel' },
  { label: 'Colors' },
  { label: 'Notes' },
]);
