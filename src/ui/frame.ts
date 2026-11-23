// The card's Frame section (since v1.12): the racket's frame profile (core/frame.ts). One row
// gives each trait's word; a Details button opens the rest under it: the edition and summary,
// the measured specs, the basis for each word and the construction. The sources stay in the
// data, where the validators hold every line to them, and are not shown (the owner's call,
// 2026-11-23: clutter the reader doesn't need). The button is a disclosure (aria-expanded); the
// section starts closed on each visit and stays open or closed across racket switches. A racket
// without a profile (only test frames) shows no Frame section.
import { TRAITS, TRAIT_LABELS, specsLine, type Profile } from '../core/frame';
import type { Racquet } from '../core/types';
import { html, type SafeHtml } from './html';

const OPEN = 'frame-open';
const DETAILS_ID = 'frame-details';

function details(p: Profile): SafeHtml {
  const specs = specsLine(p.specs);
  const traits = TRAITS.flatMap((t) => {
    const trait = p.traits[t];
    return trait
      ? [
          html`<div class="frame-basis"><dt><span class="frame-basis-label">${TRAIT_LABELS[t]}</span> <span class="frame-basis-word">${trait.word}</span></dt><dd>${trait.basis}</dd></div>`,
        ]
      : [];
  });
  return html`<div class="frame-details" id="${DETAILS_ID}">
<p class="frame-edition">${p.edition}</p>
<p class="frame-summary">${p.summary}</p>
${specs ? html`<p class="frame-specs">${specs}</p>` : ''}
<h3 class="frame-head">Character</h3>
<dl class="frame-basis-list">${traits}</dl>
<h3 class="frame-head">Construction</h3>
<ul class="frame-construction">${p.construction.map(
    (c) => html`<li><span class="frame-part">${c.name}</span> ${c.text}</li>`,
  )}</ul>
</div>`;
}

/** The section's markup for a racket, closed or `open`; empty for a racket without a profile. */
export function frameHtml(r: Racquet, open = false): SafeHtml {
  const p = r.profile;
  if (!p) return html``;
  const words = TRAITS.flatMap((t) => {
    const trait = p.traits[t];
    return trait
      ? [
          html`<li class="frame-trait"><span class="frame-trait-label">${TRAIT_LABELS[t]}</span> <span class="frame-trait-word">${trait.word}</span></li>`,
        ]
      : [];
  });
  return html`<div class="sel-row frame-row"><span class="sel-label">Frame</span><ul class="frame-traits" aria-label="Frame character">${words}</ul><button type="button" class="frame-toggle" data-frame-toggle aria-expanded="${open ? 'true' : 'false'}" aria-controls="${DETAILS_ID}">Details<span class="frame-caret" aria-hidden="true">▾</span></button></div>
${details(p)}`;
}

const sectionOf = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-frame]');

/** Shows a racket's profile in the card, keeping the section open or closed as it was. */
export function renderFrame(r: Racquet): void {
  const section = sectionOf();
  if (!section) return;
  const open = section.classList.contains(OPEN);
  section.innerHTML = frameHtml(r, open).value;
  section.classList.toggle('frame-none', !r.profile);
}

function setOpen(section: HTMLElement, open: boolean): void {
  section.classList.toggle(OPEN, open);
  section.querySelector('[data-frame-toggle]')?.setAttribute('aria-expanded', String(open));
}

/** Opens and closes the details from the button. */
export function initFrame(): void {
  document.addEventListener('click', (e) => {
    const toggle = (e.target as Element).closest('[data-frame-toggle]');
    const section = sectionOf();
    if (toggle && section) setOpen(section, !section.classList.contains(OPEN));
  });
}
