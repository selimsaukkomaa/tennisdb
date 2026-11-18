// Table markup and row builders, ported from v0.990's tennis-renderer. Rows are built without
// whitespace between cells, exactly as the legacy string concatenation produced them.
import type { Bar, Colors, Grip, GripSpec, Hybrid, HybridSide, StringRec } from '../core/types';
import type { PerRacquet } from '../core/pairings';
import { ratingBar } from '../core/ratings';
import { GRIP_TAG_COLOURS, STRING_TAG_COLOURS } from '../core/tags';
import { feelTokens, stiffnessBar } from '../core/stiffness';
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

/** Feel tags, each in its table's colour: strings and hybrids by default, grips by GRIP_TAG_COLOURS. */
export function feelTagsHtml(
  tags: readonly string[],
  sep = '',
  colours: Readonly<Record<string, string>> = STRING_TAG_COLOURS,
): SafeHtml {
  return join(
    (tags ?? []).map((t) => html`<span class="tag tag-${colours[t]}">${t}</span>`),
    raw(sep),
  );
}

function feelCell(
  tags: readonly string[],
  summary: string,
  expand: string,
  colours: Readonly<Record<string, string>> = STRING_TAG_COLOURS,
): SafeHtml {
  const text =
    summary || expand
      ? html`<br>${summary || ''}${expand ? html`<span class="feel-expand"> ${expand}</span>` : ''}`
      : '';
  return html`<td>${feelTagsHtml(tags, '', colours)}${text}</td>`;
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

/** Notes are plain text since v1.0 (v0.990 injected them as HTML; none held markup). */
function notesCell(note: string | undefined): SafeHtml {
  return html`<td class="notes">${note}</td>`;
}

function hybridSideCell(side: HybridSide | undefined): SafeHtml {
  if (!side) return raw('<td></td>');
  const sub = side.shapeFeelLabel
    ? html`<br><span style="color:#94a3b8;font-size:0.8rem;">${side.shapeFeelLabel}</span>`
    : '';
  return html`<td>${side.string}${side.gauge ? ' ' + side.gauge : ''}${sub}</td>`;
}

// ---------------------------------------------------------------- rows

/** `per` is the string in this racquet (core/pairings: perRacquet). */
export function stringRow(s: StringRec, per: PerRacquet | undefined): SafeHtml {
  return html`<tr data-shape="${s.shapeAttr}" data-feel="${feelTokens(s)}" data-type="string" data-id="${s.id}">${[
    nameCell(s.name, s.id),
    html`<td>${s.shape}</td>`,
    html`<td>${join(s.gauges ?? [], BR)}</td>`,
    colorsCell(s.colors),
    barCell('stiff', stiffnessBar(s.stiffness)),
    barCell('power', ratingBar('power', s.power)),
    feelCell(s.feelTags, s.feelSummary, s.feelExpand),
    barCell('spin', ratingBar('spin', s.spin)),
    barCell('control', ratingBar('control', s.control)),
    barCell('comfort', ratingBar('comfort', s.comfort)),
    tensionCell(per?.tension ?? ''),
    notesCell(per?.note),
  ]}</tr>`;
}

export function hybridRow(h: Hybrid, per: PerRacquet | undefined): SafeHtml {
  return html`<tr data-shape="${h.shapeAttr}" data-feel="${feelTokens(h)}" data-type="hybrid" data-id="${h.id}">${[
    nameCell(h.name, h.id),
    hybridSideCell(h.mains),
    hybridSideCell(h.crosses),
    barCell('stiff', stiffnessBar(h.stiffness)),
    barCell('power', ratingBar('power', h.power)),
    barCell('spin', ratingBar('spin', h.spin)),
    feelCell(h.feelTags, h.feelSummary, h.feelExpand),
    tensionCell(per?.tension ?? ''),
    notesCell(per?.note),
  ]}</tr>`;
}

/** A grip spec line; an emphasised one is amber, the markup v0.990 stored in the data. */
export function specHtml(spec: GripSpec): SafeHtml {
  return spec.emphasis ? html`<em style="color:#d97706;">${spec.text}</em>` : html`${spec.text}`;
}

function specsCell(specs: readonly GripSpec[] | undefined): SafeHtml {
  if (!specs?.length) return raw('<td></td>');
  return html`<td><span style="font-family:'Space Mono',monospace;font-size:0.72rem;">${join(specs.map(specHtml), BR)}</span></td>`;
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
    barCell('tackiness', ratingBar('tackiness', g.tackiness)),
    barCell('absorption', ratingBar('absorption', g.absorption)),
    barCell('durability', ratingBar('durability', g.durability)),
    feelCell(g.feelTags, g.feelSummary, g.feelExpand, GRIP_TAG_COLOURS),
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
    feelCell(g.feelTags, g.feelSummary, g.feelExpand, GRIP_TAG_COLOURS),
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
  { label: 'Notes' },
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
  { label: 'Notes' },
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
