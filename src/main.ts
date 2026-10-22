import './styles/index.css';
import { assembleDb, copy } from './core/db';
import { initCompare } from './ui/compare';
import { initFilterPanel } from './ui/filter-panel';
import { initFilters } from './ui/filters';
import { initNav, showCategory, showRacquet } from './ui/nav';
import { renderShell } from './ui/shell';

const db = assembleDb();
renderShell(db, copy);
// Modules subscribe to nav events before initNav applies the start state.
initFilters();
initNav(db);
initFilterPanel();
initCompare(db);

// Globals the v0.990 smoke suite drives; removed once the suite is ported (step 4).
Object.assign(window, { TENNIS_DB: db, showRacquet, showCategory });

document.documentElement.dataset.ready = '1';
