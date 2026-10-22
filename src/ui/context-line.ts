// The "Strung" slot in each racquet's context line, ported from v0.990's ux988 layer: what the
// stringing log says is currently in the frame. ux988 re-rendered it after every click; here
// it follows log changes.
import { currentFor } from '../core/log/model';
import { formatTension } from '../core/log/tension';
import type { TennisDb } from '../core/types';
import { html, raw } from './html';
import { getLogDoc } from './log';
import { on } from './state';

function renderStrung(db: TennisDb): void {
  const doc = getLogDoc();
  for (const r of db.racquets) {
    const slot = document.querySelector(`.context-line[data-racquet="${r.id}"] [data-ctx-strung]`);
    if (!slot) continue;
    const current = currentFor(doc, r.id);
    const tension = current ? formatTension(current.tension) : '';
    slot.innerHTML = current
      ? html`<span class="ctx-strung-label">Strung</span><span class="ctx-strung-name">${current.string.name}</span>${tension ? html`<span class="ctx-strung-meta">@ ${tension} kg</span>` : ''}`
          .value
      : raw('<span class="ctx-strung-empty">nothing logged yet</span>').value;
  }
}

export function initContextLine(db: TennisDb): void {
  on('log', () => renderStrung(db));
  renderStrung(db);
}
