import './styles/index.css';
import { assembleDb, copy } from './core/db';
import { createLogStore } from './platform/storage';
import { initCompare } from './ui/compare';
import { initContextLine } from './ui/context-line';
import { initFilterPanel } from './ui/filter-panel';
import { initFilters } from './ui/filters';
import { initGut } from './ui/gut';
import { initLog, logSearchEntries } from './ui/log';
import { initNav } from './ui/nav';
import { initPalette } from './ui/palette';
import { initSearch, setLogSearchSource } from './ui/search';
import { renderShell } from './ui/shell';

/** The assembled database (v0.990 exposed it as window.TENNIS_DB). */
export const db = assembleDb();

renderShell(db, copy);
// Modules subscribe to nav events before initNav applies the start state.
initFilters();
initNav(db);
initFilterPanel();
initCompare(db);
initGut(db, copy);
// Search before the palette: a result click navigates first, then the palette closes.
initSearch(db);
initPalette();
setLogSearchSource(logSearchEntries);
initContextLine(db);
await initLog(db, createLogStore());

document.documentElement.dataset.ready = '1';
