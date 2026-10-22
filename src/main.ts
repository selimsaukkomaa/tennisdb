import './styles/index.css';
import { assembleDb, copy } from './core/db';
import { initCompare } from './ui/compare';
import { initFilterPanel } from './ui/filter-panel';
import { initFilters } from './ui/filters';
import { initGut } from './ui/gut';
import { initNav, showCategory, showRacquet } from './ui/nav';
import { initPalette } from './ui/palette';
import { currentIndex, initSearch, rebuildIndex, searchNow } from './ui/search';
import { renderShell } from './ui/shell';

const db = assembleDb();
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

// Globals the v0.990 smoke suite drives; removed once the suite is ported (step 4).
Object.assign(window, {
  TENNIS_DB: db,
  showRacquet,
  showCategory,
  GLOBAL_SEARCH: { rebuildIndex, search: searchNow },
  // Never defined in v0.990, which left its smoke check skipped; defined here so it runs.
  GLOBAL_SEARCH_API: {
    get index() {
      return currentIndex();
    },
  },
});

document.documentElement.dataset.ready = '1';
