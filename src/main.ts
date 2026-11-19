import './styles/index.css';
import { assembleDb, copy } from './core/db';
import { registerSW } from 'virtual:pwa-register';
import { isNative } from './platform/native';
import { initCompare } from './ui/compare';
import { initFilterPanel } from './ui/filter-panel';
import { initFilters } from './ui/filters';
import { initGut } from './ui/gut';
import { initNav } from './ui/nav';
import { initPalette } from './ui/palette';
import { initPickers } from './ui/picker';
import { initPlaceholders } from './ui/placeholders';
import { initSearch } from './ui/search';
import { renderShell } from './ui/shell';

/** The assembled database (v0.990 exposed it as window.TENNIS_DB). */
export const db = assembleDb();

renderShell(db, copy);
// Modules subscribe to nav events before initNav applies the start state and builds the start
// racquet's page.
initFilters();
initPickers();
initGut(db, copy);
initCompare(db);
initNav(db, copy);
initFilterPanel();
// Search before the palette: a result click navigates first, then the palette closes.
initSearch(db);
initPalette();
initPlaceholders();

document.documentElement.dataset.ready = '1';

// Offline support and installability on the web; the iOS app bundles its files already.
if (!isNative() && 'serviceWorker' in navigator) registerSW({ immediate: true });
