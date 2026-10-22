// Command palette around the search bar, ported from v0.990's ux988 layer: the topbar Search
// button, Cmd/Ctrl+K and '/' open it; Escape, the backdrop and choosing a result close it.

const byId = (id: string): HTMLElement => document.getElementById(id)!;

const isOpen = (): boolean => byId('palette').classList.contains('palette-open');

export function openPalette(): void {
  const palette = byId('palette');
  palette.classList.add('palette-open');
  palette.setAttribute('aria-hidden', 'false');
  byId('btn-palette').classList.add('is-on');
  const input = byId('search-input') as HTMLInputElement;
  setTimeout(() => {
    input.focus();
    input.select();
  }, 10);
}

export function closePalette(): void {
  const palette = byId('palette');
  palette.classList.remove('palette-open');
  palette.setAttribute('aria-hidden', 'true');
  byId('btn-palette').classList.remove('is-on');
  byId('search-results').classList.remove('search-results-visible');
  byId('search-input').blur();
}

const toggle = (): void => (isOpen() ? closePalette() : openPalette());

/** True when the key press belongs to a text field and must not open the palette. */
function typingIn(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  const tag = el?.tagName?.toLowerCase() ?? '';
  return tag === 'input' || tag === 'textarea' || tag === 'select' || !!el?.isContentEditable;
}

export function initPalette(): void {
  byId('btn-palette').addEventListener('click', (e) => {
    // Kept from v0.990: the click must not reach the search's outside-click handler.
    e.stopPropagation();
    toggle();
  });
  byId('palette-backdrop').addEventListener('click', closePalette);
  // Choosing a result navigates (search module) and then closes the overlay behind it.
  byId('search-results').addEventListener('click', (e) => {
    if ((e.target as Element).closest('.search-result')) setTimeout(closePalette, 0);
  });
  byId('search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setTimeout(closePalette, 0);
  });

  // Macs show the Cmd glyph from the markup; everyone else gets Ctrl K.
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');
  if (!isMac) byId('palette-kbd').textContent = 'Ctrl K';

  document.addEventListener('keydown', (e) => {
    if ((isMac ? e.metaKey : e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      toggle();
    } else if (e.key === 'Escape' && isOpen()) {
      e.preventDefault();
      closePalette();
    } else if (e.key === '/' && !isOpen() && !typingIn(e.target)) {
      e.preventDefault();
      openPalette();
    }
  });
}
