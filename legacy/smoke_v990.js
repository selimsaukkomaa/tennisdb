// smoke_v989.js — jsdom smoke test for tennis_equipmentdb_v0_990.html
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const file = path.join(__dirname, '..', 'tennis_equipmentdb_v0_990.html');
const html = fs.readFileSync(file, 'utf8');

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL: ' + name + (extra ? '  [' + extra + ']' : '')); }
}

const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://localhost/' });
const { window } = dom;
const { document } = window;

// ---------------------------------------------------------------- data
const DB = window.TENNIS_DB;
t('TENNIS_DB present', !!DB);
t('version 0.990', DB.version === '0.990', DB.version);
t('72 strings', DB.strings.length === 72, DB.strings.length);
t('10 hybrids', DB.hybrids.length === 10, DB.hybrids.length);
const gripCount = Object.values(DB.grips).reduce((n, g) => n + Object.values(g).reduce((m, a) => m + a.length, 0), 0);
t('35 grips', gripCount === 35, gripCount);
const gutCount = Object.values(DB.gutHybrids).reduce((n, a) => n + a.length, 0);
t('21 gut pairings', gutCount === 21, gutCount);
t('7 string brands', Object.keys(DB.brandsStrings).length === 7);
t('PT630 98 sq in', DB.racquets.find(r => r.id === 'headpt630').headSize === '98 sq in');

// no topPick anywhere in data
t('no topPick keys in data', !JSON.stringify(DB).includes('topPick'));

// every string / hybrid has a non-empty note per racquet
const R = ['regna', 'percept', 'headpt630'];
let noteOK = true, emptyNotes = [];
DB.strings.concat(DB.hybrids).forEach(s => R.forEach(r => {
  const n = s.perRacquet && s.perRacquet[r] && s.perRacquet[r].note;
  if (!n || n.trim().length < 40) { noteOK = false; emptyNotes.push(s.id + '/' + r); }
}));
t('all string+hybrid notes present (≥40 chars)', noteOK, emptyNotes.join(','));
let gutOK = true;
Object.values(DB.gutHybrids).forEach(a => a.forEach(p => { if (!p.notes || p.notes.length < 40) gutOK = false; }));
t('all gut notes present', gutOK);

// neutrality audit — no second-person, OHBH, verdict words in string/hybrid/gut text
const pref = /\byour\b|\byou\b|\byou're\b|OHBH|one-handed|Selim|\bAvoid\b|\bSkip\b|\bPerfect for\b|\bIdeal for\b|\bdead\b|\bdeadened\b|\bpreference\b/i;
let prefHits = [];
DB.strings.concat(DB.hybrids).forEach(s => {
  R.forEach(r => { if (pref.test(s.perRacquet[r].note)) prefHits.push(s.id + '/' + r); });
  if (pref.test(s.feelSummary)) prefHits.push(s.id + '/summary');
  if (pref.test(s.feelExpand)) prefHits.push(s.id + '/expand');
});
Object.values(DB.gutHybrids).forEach(a => a.forEach(p => { if (pref.test(p.notes)) prefHits.push(p.id); }));
t('neutrality audit: no preference/verdict language in notes', prefHits.length === 0, prefHits.join(','));

// tension bands preserved vs v0.989
const prev = fs.readFileSync(path.join(__dirname, '..', 'tennis_equipmentdb_v0_989.html'), 'utf8');
const prevJSON = JSON.parse(prev.match(/<script id="tennis-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
let tensionSame = true, tdiff = [];
prevJSON.strings.forEach(ps => {
  const s = DB.strings.find(x => x.id === ps.id);
  R.forEach(r => { if (s.perRacquet[r].tension !== ps.perRacquet[r].tension) { tensionSame = false; tdiff.push(ps.id + '/' + r); } });
});
prevJSON.hybrids.forEach(ph => {
  const h = DB.hybrids.find(x => x.id === ph.id);
  R.forEach(r => { if (h.perRacquet[r].tension !== ph.perRacquet[r].tension) { tensionSame = false; tdiff.push(ph.id + '/' + r); } });
});
t('tension bands unchanged from v0.989', tensionSame, tdiff.join(','));
// bars, gauges, shapes unchanged
let specSame = true, sdiff = [];
prevJSON.strings.forEach(ps => {
  const s = DB.strings.find(x => x.id === ps.id);
  ['shape', 'gauges', 'stiffness', 'power', 'spin', 'control', 'comfort', 'colors'].forEach(k => {
    if (JSON.stringify(s[k]) !== JSON.stringify(ps[k])) { specSame = false; sdiff.push(ps.id + '/' + k); }
  });
});
t('spec fields (shape label, bars, gauges, colours) unchanged', specSame, sdiff.join(','));
// string / hybrid / gut notes untouched in a polish release
let changed = 0;
prevJSON.strings.concat(prevJSON.hybrids).forEach(ps => { const s = DB.strings.concat(DB.hybrids).find(x => x.id === ps.id); R.forEach(r => { if (s.perRacquet[r].note !== ps.perRacquet[r].note) changed++; }); });
t('string + hybrid notes unchanged from v0.989', changed === 0, changed);

// ---------------------------------------------------------------- chrome removals
t('no rec-box in string sections', document.querySelectorAll('#strings-content .rec-box, #regna-content .rec-box, #percept-content .rec-box, #headpt630-content .rec-box').length === 0);
t('grip About boxes kept (3)', document.querySelectorAll('#grips-content .rec-box').length === 3);
t('no summary-section', document.querySelectorAll('.summary-section').length === 0);
t('no summary-card', document.querySelectorAll('.summary-card').length === 0);
t('no ★ Top Pick legend item', !Array.from(document.querySelectorAll('.legend-item')).some(el => /Top Pick/.test(el.textContent)));
t('legends still present (4)', document.querySelectorAll('.legend').length === 4, document.querySelectorAll('.legend').length);
t('no toppick filter chip', document.querySelectorAll('[data-filter-group="toppick"], [data-gfilter-group="toppick"]').length === 0);
t('no filter-chip-top elements', document.querySelectorAll('.filter-chip-top').length === 0);
t('shape/feel chips intact (7 + 5)', document.querySelectorAll('[data-filter-group="shape"]').length === 7 && document.querySelectorAll('[data-filter-group="feel"]').length === 5);
const mark = document.querySelector('.topbar-mark');
t('topbar wordmark present', !!mark);
t('topbar has no title tooltip', mark && !mark.hasAttribute('title'));
t('no "Prefers crisp" anywhere', !html.includes('Prefers crisp'));
t('no "For your crisp" anywhere', !html.includes('For your crisp'));
t('no "your profile" anywhere', !html.includes('your profile'));
t('placeholder updated', /try 'caviar', 'gut', 'hex'/.test(html));
t('version tags say v0.990', document.querySelectorAll('.version-tag').length === 3 && Array.from(document.querySelectorAll('.version-tag')).every(v => v.textContent.trim() === 'v0.990'));
t('no v0.989 residue', !html.includes('v0.989'));

// ---------------------------------------------------------------- rendering
const rows = document.querySelectorAll('tr[data-id]');
t('281 rendered rows', rows.length === 281, rows.length);
t('no ★ Top Pick tags rendered', document.querySelectorAll('.tag-top').length === 0, document.querySelectorAll('.tag-top').length);
t('no highlight rows', document.querySelectorAll('tr.highlight').length === 0);
t('no data-toppick="1"', document.querySelectorAll('[data-toppick="1"], [data-grip-toppick="1"]').length === 0);
// a rewritten note actually reaches the DOM
t('Hyper-G Regna note rendered', html.indexOf('markedly more vibration damping') >= 0 && document.body.textContent.indexOf('markedly more vibration damping') >= 0);
t('context line present', document.querySelectorAll('.context-line').length >= 1);

// gut strip count text
const gutStatus = document.querySelector('.gut-status-count');
t('gut status count has no "top picks"', gutStatus && !/top pick/i.test(gutStatus.textContent), gutStatus && gutStatus.textContent);
t('no gut-toppick badges', document.querySelectorAll('.gut-toppick-badge').length === 0);

// ---------------------------------------------------------------- behaviour
function visible(tr) { return !tr.classList.contains('filter-hidden'); }
// shape filter still works
const hexChip = document.querySelector('[data-filter-group="shape"][data-filter-value="hexagonal"]');
hexChip.click();
const regnaRows = Array.from(document.querySelectorAll('#regna-content tr[data-type="string"]'));
const vis = regnaRows.filter(visible);
t('hex filter narrows rows', vis.length > 0 && vis.length < regnaRows.length, vis.length + '/' + regnaRows.length);
t('hex filter shows only hex', vis.every(tr => (tr.dataset.shape || '').includes('hexagonal')));
hexChip.click();
t('hex filter clears', regnaRows.filter(visible).length === regnaRows.length);

// racquet switching
window.showRacquet('headpt630');
t('PT630 view active', document.getElementById('headpt630-content') && window.getComputedStyle(document.getElementById('headpt630-content')).display !== 'none');
window.showRacquet('regna');

// palette
const palette = document.getElementById('palette');
t('palette exists', !!palette);
const openBtn = document.querySelector('#topbar [data-palette-open], #topbar .topbar-search, #topbar button[aria-label*="earch"]');
if (openBtn) { openBtn.click(); t('palette opens', palette.classList.contains('open') || palette.getAttribute('aria-hidden') === 'false' || window.getComputedStyle(palette).display !== 'none'); }
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

// search index has no ★ sublabels
if (window.GLOBAL_SEARCH_API && window.GLOBAL_SEARCH_API.index) {
  t('search index has no ★ Top Pick sublabels', !window.GLOBAL_SEARCH_API.index.some(i => /Top Pick/.test(i.sublabel || '')));
}

// category switch to grips + back
window.showCategory('grips');
t('grips view renders rows', document.querySelectorAll('#grips-content tr[data-id]').length === 35, document.querySelectorAll('#grips-content tr[data-id]').length);
window.showCategory('strings');

// compare bar untouched
t('compare checkboxes present', document.querySelectorAll('input.compare-check, input[class*="compare"]').length > 0);


// ================================================================ v0.990 polish checks
console.log('--- v0.990 ---');
const outside = html.replace(/<script id="tennis-data"[\s\S]*?<\/script>/, '');
['topPick', 'toppick', 'tag-top', 'filter-chip-top', 'gut-row-top', 'gut-toppick', 'Top Pick', 'summary-section', 'summary-card', 'tr.highlight', 'class="highlight"']
  .forEach(n => t('dead code gone: ' + n, !outside.includes(n)));
t('string rec-box filter code gone', !/(?<!g)filter-hide-rec/.test(outside));
t('grip rec-box filter code kept', outside.includes('gfilter-hide-rec'));
t('no "Connected" anywhere', !/Connected/.test(html));

// shape bug
t('no square-textured shapeAttr', !DB.strings.some(s => s.shapeAttr === 'square-textured'));
window.showRacquet('regna');
function visibleIn(containerSel, attr) { return Array.from(document.querySelectorAll(containerSel + ' tr[' + attr + ']')).filter(tr => !tr.classList.contains('filter-hidden')); }
const sq = document.querySelector('[data-filter-group="shape"][data-filter-value="square"]');
sq.click();
const sqNames = visibleIn('#regna-content', 'data-shape').map(tr => tr.dataset.id);
t('Square chip shows TB Diamond Rough', sqNames.includes('solinco-tb-diamond-rough'));
t('Square chip shows Aspera Triplum', sqNames.includes('grapplesnake-aspera-triplum'));
sq.click();

// feel chips: every chip matches single strings; every string has firm xor soft
const strRows = () => Array.from(document.querySelectorAll('#regna-content tr[data-type="string"]'));
t('every string row has a feel value', strRows().every(tr => (tr.dataset.feel || '').length > 0));
t('every string is exactly one of firm/soft', DB.strings.every(s => { const f = s.feelAttr.split(','); return f.includes('firm') !== f.includes('soft'); }));
const expectMin = { crisp: 20, firm: 20, soft: 20, plush: 7, lively: 7 };
Object.keys(expectMin).forEach(v => {
  const chip = document.querySelector('[data-filter-group="feel"][data-filter-value="' + v + '"]');
  chip.click();
  const vis = strRows().filter(tr => !tr.classList.contains('filter-hidden'));
  t('feel chip "' + v + '" shows >= ' + expectMin[v] + ' strings', vis.length >= expectMin[v], vis.length);
  t('feel chip "' + v + '" rows all carry it', vis.every(tr => tr.dataset.feel.split(',').includes(v)));
  chip.click();
});
const feelOf = id => DB.strings.find(s => s.id === id).feelAttr.split(',');
t('Hyper-G no longer Soft', !feelOf('solinco-hyper-g').includes('soft') && feelOf('solinco-hyper-g').includes('firm'));
t('Zero no longer Soft', !feelOf('restring-zero').includes('soft'));
t('Confidential Soft is Soft', feelOf('solinco-confidential-soft').includes('soft'));
t('Truffle X is Plush', feelOf('toroline-truffle-x').includes('plush'));
t('Tour Sniper not Crisp', !feelOf('grapplesnake-tour-sniper').includes('crisp'));
t('Tour Bite Lively', feelOf('solinco-tour-bite').includes('lively'));
// crisp chip == Crisp tag
t('crisp chip matches Crisp tag everywhere', DB.strings.concat(DB.hybrids).every(r => r.feelAttr.split(',').includes('crisp') === (r.feelTags.some(x => x.label === 'Crisp') || /crisp/i.test(r.feelSummary))));
// tag colours: every variant has CSS, one label one colour
const variants = new Set(DB.strings.concat(DB.hybrids).flatMap(r => r.feelTags.map(x => x.variant)));
variants.forEach(v => t('CSS exists for .tag-' + v, outside.includes('.tag-' + v + ' {')));
const lv = {}; let oneColour = true;
DB.strings.concat(DB.hybrids).forEach(r => r.feelTags.forEach(x => { if (lv[x.label] && lv[x.label] !== x.variant) oneColour = false; lv[x.label] = x.variant; }));
t('each tag label has one colour', oneColour);

// hybrid order now = declared order (top-pick sort removed)
const hybOrder = Array.from(document.querySelectorAll('#regna-content tr[data-type="hybrid"]')).map(tr => tr.dataset.id);
t('hybrid rows in declared order', JSON.stringify(hybOrder) === JSON.stringify(DB.hybrids.map(h => h.id)), hybOrder.join(','));
// gut: mains before crosses
const gutBtn = document.querySelector('[data-gut-toggle="regna"]'); if (gutBtn) gutBtn.click();
const gutCfg = Array.from(document.querySelectorAll('.gut-section[data-racquet="regna"] tr[data-config]')).map(tr => tr.dataset.config);
t('gut rows: mains before crosses', gutCfg.length === 7 && gutCfg.join(',') === gutCfg.slice().sort((a, b) => (a === 'gut-mains' ? 0 : 1) - (b === 'gut-mains' ? 0 : 1)).join(','), gutCfg.join(','));

// name sort still works without the star strip
const th = document.querySelector('#regna-content th.sortable[data-col="string"]');
if (th) {
  const tbody = th.closest('table').querySelector('tbody');
  th.click();
  const names = Array.from(tbody.querySelectorAll('tr')).map(tr => tr.querySelector('.string-name').textContent.trim().toLowerCase());
  t('name sort ascending', JSON.stringify(names) === JSON.stringify(names.slice().sort((a, b) => a.localeCompare(b))), names.join('|'));
}

// search: no ★ sublabels
if (window.GLOBAL_SEARCH && window.GLOBAL_SEARCH.search) {
  const res = window.GLOBAL_SEARCH.search('caviar');
  t('search still returns results', res.length > 0, res.length);
  t('search sublabels have no ★', res.every(r => !/★/.test(r.sublabel || '')));
}

// grips: filters, tags, neutral text
window.showCategory('grips');
const gripRows = () => Array.from(document.querySelectorAll('#grips-content tr[data-grip-type]'));
t('every grip row has a feel value', gripRows().every(tr => (tr.dataset.gripFeel || '').length > 0));
function gripChip(group, value) { return document.querySelector('[data-gfilter-group="' + group + '"][data-gfilter-value="' + value + '"]'); }
function gripVisibleNames() { return gripRows().filter(tr => !tr.classList.contains('gfilter-hidden')).map(tr => tr.querySelector('.string-name').textContent.trim()); }
// show all grip brands so Tourna rows are counted even if hidden by brand tab: filtering forces all sections visible
gripChip('feel', 'dry').click();
let gvis = gripVisibleNames();
t('Dry chip shows Tourna Grip Original', gvis.includes('Tourna Grip Original'), gvis.join('|'));
t('Dry chip shows Tourna Grip XL + Pro Thin', gvis.includes('Tourna Grip XL') && gvis.includes('Tourna Grip Pro Thin'));
t('every dry-type grip matches Dry chip', gripRows().filter(tr => tr.dataset.gripType === 'dry').every(tr => !tr.classList.contains('gfilter-hidden')));
gripChip('feel', 'dry').click();
gripChip('feel', 'leather').click();
gvis = gripVisibleNames();
t('Leather chip shows Pro Tour Leather', gvis.includes('Pro Tour Leather'), gvis.join('|'));
gripChip('feel', 'leather').click();
gripChip('feel', 'tacky').click();
t('every wet-type grip matches Tacky chip', gripRows().filter(tr => tr.dataset.gripType === 'wet').every(tr => !tr.classList.contains('gfilter-hidden')));
gripChip('feel', 'tacky').click();
t('grip feel filter is token-based', /var rowFeel = \(row\.dataset\.gripFeel \|\| ''\)\.split\(','\);/.test(outside));
const gripNeutral = /\byour?\b|\byou\b|you'll|you've|\bprefer|\bBest for\b|\bBest choice\b|\bideal\b|Niche pick|gold standard|legendary|\bperfectly\b|\bultimate\b|\bamazing\b|connection/i;
let gripBad = [];
Object.values(DB.grips).forEach(b => Object.values(b).forEach(a => a.forEach(g => { if (gripNeutral.test([g.notes, g.feelSummary, g.feelExpand].join(' '))) gripBad.push(g.name); })));
t('grip text neutral', gripBad.length === 0, gripBad.join(','));
t('Tac no longer calls Hi-Soft EX a Yonex grip', !/Yonex Hi-Soft/.test(JSON.stringify(DB.grips)));
const aboutText = Array.from(document.querySelectorAll('#grips-content .rec-box')).map(b => b.textContent).join(' ');
t('grip About boxes neutral', !/\byour?\b|\bstrong\b|prefer/i.test(aboutText));
window.showCategory('strings');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
