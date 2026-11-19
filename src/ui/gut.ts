// Natural gut / poly hybrids, ported from v0.990's tennis-gut. Since v1.8 "Natural gut" is the
// last choice in each racquet's strings row; its view holds the gut intro (blurb from
// content/copy.json, one card per gut string) and a table of pairings, gut-mains configs first.
import { brandOfStringId, orderedPairings } from '../core/gut';
import { tensionLabel } from '../core/pairings';
import { ratingBar } from '../core/ratings';
import type { Bar, Copy, GutPairing, GutSide, RacquetId, TennisDb } from '../core/types';
import { html, join, raw, type SafeHtml } from './html';

let db: TennisDb;
let copy: Copy;

const DASH = raw('<span class="gut-dash">—</span>');

function bar(cls: string, b: Bar | null | undefined): SafeHtml {
  if (!b) return DASH;
  return html`<div class="gut-bar-wrap"><span class="gut-bar-label">${b.label}</span><div class="bar"><div class="bar-fill ${cls}" style="width:${b.width ?? 0}%"></div></div></div>`;
}

function stringPill(side: GutSide | undefined): SafeHtml {
  if (!side?.string) return DASH;
  const brand = brandOfStringId(db, side.stringId);
  return html`<div class="gut-string-pill"${brand ? html` data-brand="${brand}"` : ''}><span class="gut-string-name">${side.string}</span>${side.gauge ? html`<span class="gut-string-gauge">${side.gauge}</span>` : ''}</div>`;
}

function intro(): SafeHtml {
  const cards = db.gutStrings.map(
    (g) =>
      html`<div class="gut-intro-card" data-brand="gut"><div class="gut-intro-title">${g.name}</div><div class="gut-intro-gauges">${join(g.gauges, raw(' · '))}</div><div class="gut-intro-desc">${g.description}</div><div class="gut-intro-price">${g.priceNote}</div></div>`,
  );
  return html`<div class="gut-intro"><div class="gut-intro-blurb">${raw(copy.gutIntro)}</div><div class="gut-intro-cards">${cards}</div></div>`;
}

function row(p: GutPairing): SafeHtml {
  const mains = p.config === 'gut-mains';
  return html`<tr data-config="${p.config}" data-id="${p.id}"><td class="gut-config-cell ${mains ? 'gut-config-mains' : 'gut-config-crosses'}"><span class="gut-config-icon">${mains ? '⬆' : '⬇'}</span><span class="gut-config-label">${mains ? 'Gut Mains' : 'Gut Crosses'}</span></td><td class="gut-string-cell">${stringPill(p.mains)}</td><td class="gut-string-cell">${stringPill(p.crosses)}</td><td class="gut-feel-cell">${p.feelLabel || ''}</td><td>${bar('power', ratingBar('power', p.power))}</td><td>${bar('spin', ratingBar('spin', p.spin))}</td><td>${bar('comfort', ratingBar('comfort', p.comfort))}</td><td>${bar('gut-protection', ratingBar('gutProtection', p.gutProtection))}</td><td class="gut-tension-cell">${tensionLabel(p.tension)}</td><td class="gut-notes-cell">${p.notes}</td></tr>`;
}

function table(racquet: RacquetId): SafeHtml {
  const pairings = orderedPairings(db, racquet);
  if (pairings.length === 0) {
    return raw('<div class="gut-empty">No gut hybrid pairings configured for this racket.</div>');
  }
  return html`<div class="gut-table-wrap"><table class="gut-table"><thead><tr><th>Config</th><th>Mains</th><th>Crosses</th><th>Feel</th><th>Power</th><th>Spin</th><th>Comfort</th><th title="How well the cross protects gut mains; only applies to gut-mains config">Gut Protection</th><th>Tension (M/X)</th><th>Notes</th></tr></thead><tbody>${pairings.map(row)}</tbody></table></div>`;
}

/** Fills a racquet's gut view: the intro, then the pairings table. Shown when "Natural gut" is picked. */
function renderView(racquet: RacquetId): void {
  const view = document.querySelector(`.gut-view[data-racquet="${racquet}"]`);
  if (view) view.innerHTML = intro().value + table(racquet).value;
}

export function initGut(data: TennisDb, content: Copy): void {
  db = data;
  copy = content;
  for (const r of db.racquets) renderView(r.id);
}
