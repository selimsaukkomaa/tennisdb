# -*- coding: utf-8 -*-
"""
v0.990 build — polish only, no new features.

  1. Filter bugs
     a. shapeAttr "square-textured" -> "square" (TB Diamond Rough, Aspera Triplum)
     b. String/hybrid feel chips recomputed from documented rules
     c. Feel tags made consistent with the chips (contradictions, "Connected", colours)
     d. Grip feel attributes fixed (Tourna dry/leather, Ana Spa Twin, tacky wet grips)
     e. Grip feel filter switched from substring to token matching
  2. Grip-note cleanup — second person and verdict wording removed
  3. Dead code — top-pick machinery, summary-section CSS, string rec-box handling

Input : tennis_equipmentdb_v0_989.html
Output: tennis_equipmentdb_v0_990.html
"""
import io, re, json, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'tennis_equipmentdb_v0_989.html')
DST = os.path.join(HERE, '..', 'tennis_equipmentdb_v0_990.html')

html = io.open(SRC, encoding='utf-8').read()
m = re.search(r'(<script id="tennis-data" type="application/json">)(.*?)(</script>)', html, re.S)
assert m
db = json.loads(m.group(2))
log = collections.defaultdict(list)

def by_id(rows):
    return {r['id']: r for r in rows}
S = by_id(db['strings']); H = by_id(db['hybrids'])
GRIPS = {}
for brand, groups in db['grips'].items():
    for gtype, items in groups.items():
        for g in items:
            GRIPS[g['name']] = g

# ============================================================ 1a. shape attr
for sid in ('solinco-tb-diamond-rough', 'grapplesnake-aspera-triplum'):
    assert S[sid]['shapeAttr'] == 'square-textured'
    S[sid]['shapeAttr'] = 'square'
    log['shape'].append(S[sid]['name'])
assert not any(s['shapeAttr'] == 'square-textured' for s in db['strings'])

# ============================================================ 1c. tag edits (before feel recompute)
def set_tags(row, labels):
    old = [t['label'] for t in row['feelTags']]
    row['feelTags'] = [{'label': l, 'variant': 'crisp'} for l in labels]  # variants normalised below
    log['tags'].append('%s: %s -> %s' % (row['name'], old, labels))

# Crisp tag removed where the same row calls the string muted/damped
set_tags(S['grapplesnake-tour-sniper'],        ['Muted', 'Firm'])   # summary "Muted, precise"
set_tags(S['yonex-poly-tour-rev'],             ['Muted'])           # tags said Crisp + Muted
set_tags(S['yonex-poly-tour-fire'],            ['Lively'])          # expand: "adds power and dampening"
set_tags(S['toroline-o-toro-snap-tour-flex'],  ['Firm'])            # expand: "muted, efficient response"
# "Connected" was the retired preference vocabulary
set_tags(S['luxilon-alu-power-soft'],          ['Softer'])
set_tags(H['toroline-cole'],                   ['Precise', 'Crisp'])  # keeps its existing crisp chip

# one label -> one colour, everywhere
VARIANT = {
    'Crisp': 'crisp',
    'Firm': 'firm', 'Precise': 'firm', 'Controlled': 'firm', 'Aggressive': 'firm',
    'Soft': 'soft', 'Softer': 'soft', 'Very Soft': 'soft', 'Moderate': 'soft', 'Muted': 'soft',
    'Smooth': 'round', 'Bite': 'round',
    'Lively': 'lively', 'Elastic': 'lively', 'Explosive': 'lively', 'Responsive': 'lively',
    'Plush': 'plush', 'Pocketing': 'plush', 'Comfortable': 'plush',
}
for row in db['strings'] + db['hybrids']:
    for t in row['feelTags']:
        assert t['label'] in VARIANT, 'no variant mapping for tag ' + t['label']
        if t['variant'] != VARIANT[t['label']]:
            log['variant'].append('%s: %s %s->%s' % (row['name'], t['label'], t['variant'], VARIANT[t['label']]))
            t['variant'] = VARIANT[t['label']]

# ============================================================ 1b. feel chips from rules
FIRM_BANDS = {'Very Firm', 'Firm', 'Med-Firm'}
SOFT_BANDS = {'Med', 'Medium', 'Med-Soft', 'Soft', 'Very Soft'}

def stiff_num(label):
    mm = re.search(r'(\d\.\d+)(?:\s*[–-]\s*(\d\.\d+))?', label)
    if not mm: return None
    a = float(mm.group(1)); b = float(mm.group(2)) if mm.group(2) else a
    return (a + b) / 2

def row_text(r):
    return ' '.join([t['label'] for t in r['feelTags']] + [r['feelSummary'], r['feelExpand']]).lower()

def feel_for(r, kind):
    band = r['stiffness']['label'].split(' · ')[0].strip()
    assert band in FIRM_BANDS | SOFT_BANDS, band
    tx = row_text(r)
    tags = [t['label'].lower() for t in r['feelTags']]
    old = set(x for x in r['feelAttr'].split(',') if x)
    muted = bool(re.search(r'muted|damp', tx))
    out = []
    # Crisp: row shows a Crisp tag (or says crisp in its summary) and doesn't call itself muted/damped
    if ('crisp' in tags or re.search(r'\bcrisp\b', r['feelSummary'].lower())) and not muted:
        out.append('crisp')
    # Firm / Soft: split the Stiffness column — Med-Firm and firmer vs Medium and softer
    out.append('firm' if band in FIRM_BANDS else 'soft')
    # Plush: row text says plush, or the measurable soft/comfort extreme
    if kind == 'string':
        n = stiff_num(r['stiffness']['label'])
        plush = ('plush' in tx or r['comfort']['label'] in ('Very High', 'Elite', 'Excellent')
                 or band == 'Very Soft' or (n is not None and n <= 0.72))
    else:
        plush = 'plush' in old or 'plush' in tx
    if plush: out.append('plush')
    # Lively: row text says lively or elastic
    if re.search(r'lively|elastic', tx) or (kind == 'hybrid' and 'lively' in old):
        out.append('lively')
    return out

for kind, rows in (('string', db['strings']), ('hybrid', db['hybrids'])):
    for r in rows:
        new = feel_for(r, kind)
        old = [x for x in r['feelAttr'].split(',') if x]
        if sorted(new) != sorted(old):
            log['feel'].append('%s %s: %s -> %s' % (kind[0], r['name'], ','.join(old) or '(none)', ','.join(new)))
        r['feelAttr'] = ','.join(new)

# invariants
for r in db['strings'] + db['hybrids']:
    f = r['feelAttr'].split(',')
    assert ('firm' in f) != ('soft' in f), 'firm/soft must be exactly one: ' + r['name']
    tags = [t['label'] for t in r['feelTags']]
    assert ('crisp' in f) == ('Crisp' in tags or 'crisp' in r['feelSummary'].lower()), 'crisp/tag mismatch: ' + r['name']
cnt = collections.Counter(a for r in db['strings'] for a in r['feelAttr'].split(','))
for chip in ('crisp', 'firm', 'soft', 'plush', 'lively'):
    assert cnt[chip] > 0, 'feel chip matches no string: ' + chip

# ============================================================ gut labels (retired vocabulary)
GUT = {p['id']: p for ps in db['gutHybrids'].values() for p in ps}
for gid, old, new in (('gh-percept-1', 'Plush · Connected', 'Plush · Round'),
                      ('gh-percept-5', 'Firm · Connected', 'Firm · Shaped')):
    assert GUT[gid]['feelLabel'] == old, GUT[gid]['feelLabel']
    GUT[gid]['feelLabel'] = new
    log['gut'].append('%s: %s -> %s' % (gid, old, new))

# ============================================================ 1d. grip feel attributes
GRIP_FEEL = {
    'Ana Spa Twin':         ('',                  'cushioned,tacky'),
    'Wave Grap':            ('cushioned,ribbed',  'tacky,cushioned,ribbed'),
    'Forte':                ('firm,durable',      'tacky,firm,durable'),
    'Tourna Grip Original': ('classic,absorbent', 'dry,absorbent'),
    'Tourna Grip XL':       ('classic,absorbent', 'dry,absorbent'),
    'Tourna Grip Pro Thin': ('classic,absorbent,thin', 'dry,absorbent,thin'),
    'Pro Tour Leather':     ('classic,firm',      'leather,firm'),
    'Synthetic Pro':        ('cushioned',         'synthetic,cushioned'),
}
for name, (old, new) in GRIP_FEEL.items():
    g = GRIPS[name]
    assert (g.get('gripFeelAttr') or '') == old, (name, g.get('gripFeelAttr'))
    g['gripFeelAttr'] = new
    log['gripfeel'].append('%s: %s -> %s' % (name, old or '(none)', new))
# every grip type matches its own chip
for g in GRIPS.values():
    feel = (g['gripFeelAttr'] or '').split(',')
    assert feel != [''], 'untagged grip: ' + g['name']
    if g['gripType'] == 'dry': assert 'dry' in feel, g['name']
    if g['gripType'] == 'wet': assert 'tacky' in feel, g['name']
    if g['gripType'] == 'replacement' and 'eather' in (g.get('material') or g['name']):
        assert 'leather' in feel, g['name']

# ============================================================ 2. grip-note cleanup
tack = {n: (GRIPS[n].get('tackiness') or {}).get('width') for n in GRIPS}
absb = {n: (GRIPS[n].get('absorption') or {}).get('width') for n in GRIPS}
tourna_names = [g['name'] for gs in db['grips']['tourna'].values() for g in gs]
assert max(tourna_names, key=lambda n: tack[n] or 0) == 'Mega Tac', 'Mega Tac is not the tackiest Tourna grip'
assert tack['Mega Tac'] < max(v or 0 for v in tack.values()), 'Mega Tac is now the tackiest overall - revisit note'
assert absb['Tourna Grip Original'] == max(v or 0 for v in absb.values()), 'Tourna Original is not (joint) most absorbent'

def rep(name, field, old, new):
    g = GRIPS[name]
    assert g.get(field, '').count(old) == 1, (name, field, old)
    g[field] = g[field].replace(old, new)
    log['grips'].append('%s.%s' % (name, field))

rep('Hi-Soft EX Ultra-Thin', 'notes',
    'Ideal if you play at the top of your grip size range or prefer maximum bevel feel.',
    'Useful at the top of a grip-size range, and passes the most bevel definition through of the Hi-Soft family.')
rep('Hi-Soft EX Ultra-Thin', 'feelExpand',
    'ideal for players at the top of their grip size range.',
    'useful at the top of a grip-size range.')
rep('Punch (Perforated)', 'notes',
    'Best choice for heavy sweaters who still want a wet/tacky feel. Slightly less tacky than non-perforated but superior moisture management.',
    'Aimed at heavy sweat with a wet/tacky surface. Slightly less tacky than non-perforated, with better moisture management.')
rep('Legend Rocky', 'notes',
    "Best for players who want maximum grip security and don't mind a pronounced texture under the hand.",
    'The added grip security comes with a pronounced texture under the hand.')
rep('Forte', 'notes',
    'Best for players who prefer a harder, more substantial grip feel rather than the soft, ultra-tacky Hi-Soft sensation.',
    'Harder and more substantial under the hand than the soft, ultra-tacky Hi-Soft.')
rep('Neo-Dry', 'notes',
    'Best for heavy sweaters who dislike sticky grips.',
    'Designed for heavy sweat without a sticky surface.')
rep('Last Dry', 'notes',
    'The name means both "Lasting" and "Last dry grip you\'ll need."',
    'The name plays on "lasting" and on being the last dry grip a player needs.')
rep('Dry Spiral', 'notes',
    'Best for players who want the benefits of the spiral sponge ridge while preferring dry sweat management.',
    'Brings the spiral sponge ridge to a dry-type surface.')
rep('Fairway Leather', 'notes',
    'The legendary Fairway Leather Grip. Thin profile, amazing feel, proud history and impeccable quality – considered the gold standard of leather grips. Maximum ball feedback improves control. Direct bevel feel for precise grip changes.',
    'Long regarded as the reference leather replacement grip. Thin profile; leather transmits more frame feedback than synthetic, and the bevels are sharply defined for grip changes.')
rep('Fairway Leather', 'feelSummary', 'Gold standard leather', 'Reference leather grip')
rep('Wave Grap', 'notes',
    'Best for players who want extra cushioning and a contoured feel.',
    'Adds cushioning and a contoured feel.')
rep('Clean Grap', 'notes',
    'Ideal for players who play frequently and want hygiene benefits without sacrificing grip quality.',
    'Aimed at frequent play, with the hygiene benefit and an unchanged Super Grap feel.')
rep('Dry Grap', 'notes',
    'Best for heavy sweaters who dislike tacky grips.',
    'Designed for heavy sweat without a tacky surface.')
rep('Dry Super Grap', 'notes',
    'The best Yonex option for heavy sweaters who still want some grip security.',
    'The Yonex dry grip that keeps the most tack under heavy sweat.')
rep('Ultimum Leather', 'notes',
    'The ideal base grip for players who want maximum connection and control. Pairs perfectly with the Super Grap overgrip for the ultimate combination of feel and performance.',
    'A thin, firm leather base that transmits frame feedback directly; commonly used under an overgrip such as Super Grap.')
rep('Tac', 'notes',
    "Conventional wet/tacky overgrip. If you've been using Yonex Hi-Soft EX or Kimony Punch and like them, no specific reason to switch — this is competitive but not category-defining like the original Tourna Grip is for dry.",
    "Conventional wet/tacky overgrip in the same class as Kimony Hi-Soft EX / Punch and Yonex Wet Super Grap. Tourna's reputation rests on its dry grip; Tac is the brand's tacky option.")
rep('Tac', 'feelSummary', 'Sticky alternative', 'Wet/tacky overgrip')
rep('Tac', 'feelExpand',
    "Tourna's answer for players who want a tacky/wet grip but trust the Tourna brand. Similar profile to Yonex Hi-Soft EX or Kimony Punch.",
    "Tourna's wet/tacky overgrip, similar in profile to Kimony Hi-Soft EX and Punch.")
rep('Mega Tac', 'notes',
    'Niche pick. Most players find this too tacky — uncomfortable to make grip changes mid-point. But if your hands are very dry and you actively want maximum stick, this delivers more than any wet grip in the database.',
    "Tourna's highest-tack grip, with low absorption. The level of stick makes mid-point grip changes noticeably harder; it is aimed at very dry hands. (Earlier notes said it out-grips every wet grip here - the tackiness data puts Kimony Hi-Soft EX and Yonex Super Grap JP higher.)")
rep('Mega Tac', 'feelExpand',
    'Tourna pushed the tackiness scale to its limit with this one. If you want a grip that genuinely glues to your palm, this is among the tackiest on the market.',
    "Tourna's highest-tack grip, at the cost of easy grip changes.")
rep('Tourna Grip Original', 'notes',
    'The reference dry overgrip. If your hands sweat heavily, this is the gold standard — nothing absorbs more.',
    'The reference dry overgrip, with the highest absorption rating in the database.')
rep('Tourna Grip Original', 'feelSummary', 'World-famous', 'Reference dry grip')
rep('Tourna Grip Original', 'feelExpand', 'Best raw absorption in the category', 'Highest raw absorption in the category')
rep('Tourna Grip XL', 'notes',
    'Use case: longer handles (16″ extended length racquets) or if you want extra wraps for cushion.',
    'For longer handles (16″ extended-length racquets), or for extra overlap and cushion when wrapping.')
rep('Tourna Grip Pro Thin', 'notes',
    'Pick this if you have a fresh leather grip and want to feel the bevels through the overgrip.',
    'Passes more bevel definition through from the base grip — most noticeable over a fresh leather grip.')
rep('Tourna Grip Pro Thin', 'feelExpand',
    'For players who want maximum bevel feel from the underlying grip while still using',
    'Passes more bevel feel through from the underlying grip while keeping')
rep('Pro Tour Leather', 'notes',
    'Strong alternative to Fairway Leather (Kimony\'s flagship leather grip). Slightly more textured surface; bevels feel a touch sharper. If you can find it, worth trying side-by-side with Fairway.',
    'An alternative to Kimony\'s Fairway Leather: slightly more textured surface, bevels a touch sharper. Less widely stocked than Fairway.')

GRIP_NEUTRAL = re.compile(r"\byour?\b|\byou\b|you'll|you've|\bprefer|\bBest for\b|\bBest choice\b|\bideal\b|\bNiche pick\b|gold standard|legendary|\bperfectly\b|\bultimate\b|\bamazing\b|\bconnection\b|\bconnected\b", re.I)
bad = [g['name'] for g in GRIPS.values()
       if GRIP_NEUTRAL.search(' '.join([g.get('notes', ''), g.get('feelSummary', ''), g.get('feelExpand', '')]))]
assert not bad, 'grip text still not neutral: %r' % bad

db['version'] = '0.990'
new_json = json.dumps(db, ensure_ascii=False, separators=(',', ':'))
assert not re.search(r'[Cc]onnected|topPick|square-textured', new_json)
html = html[:m.start(2)] + new_json + html[m.end(2):]

# ============================================================ chrome + code
def sub_n(pattern, repl, s, expected, flags=0, label=''):
    out, n = re.subn(pattern, repl, s, flags=flags)
    assert n == expected, '%s: expected %d, got %d' % (label or pattern[:50], expected, n)
    log['code'].append('%s (%d)' % (label, n))
    return out

def rep_n(old, new, s, expected, label=''):
    n = s.count(old)
    assert n == expected, '%s: expected %d, got %d' % (label or old[:50], expected, n)
    log['code'].append('%s (%d)' % (label, n))
    return s.replace(old, new)

# --- grip About box: last verdict word
html = rep_n('<span class="pick">Pro Tour Leather</span> is a strong replacement-grip option,',
             '<span class="pick">Pro Tour Leather</span> is the leather replacement grip,', html, 1, 'tourna about')

# --- CSS: tag colours (tag-top removed; lively + plush variants previously had no class)
html = rep_n('  .tag-top { background: #dcfce7; color: #166534; border: 1px solid #86efac; }\n',
             '  .tag-lively { background: #dcfce7; color: #166534; }\n  .tag-plush { background: #fae8ff; color: #86198f; }\n',
             html, 1, 'css tag-top -> tag-lively/plush')
# --- CSS: highlight rows (top-pick only)
html = rep_n('  tbody tr.highlight { background: #f7f9ff; }\n  tbody tr.highlight:hover { background: #eef2ff; }\n', '', html, 1, 'css tr.highlight')
html = sub_n(r'    #strings-content tbody tr\.highlight,\n    #grips-content tbody tr\.highlight \{\n      border-left-color: #fbbf24;\n    \}\n', '', html, 1, 0, 'css mobile tr.highlight')
# --- CSS: brand-view .pick colours (string rec-boxes gone; grip sections carry no brand-view class)
html = sub_n(r'  \.(toroline|solinco|yonex|restring|grapplesnake|tourna|luxilon)-view \.rec-box \.pick \{[^}]*\}\n', '', html, 7, 0, 'css brand .pick')
# --- CSS: summary sections
i = html.find('  /* Summary comparison */\n'); j = html.find('  /* Legend */', i)
assert i > 0 and j > i
seg = html[i:j]
sels = [x.strip() for x in re.findall(r'([^{}]+)\{', seg)]
assert sels and all('summary' in x for x in sels), [x for x in sels if 'summary' not in x]
html = html[:i] + html[j:]
log['code'].append('css summary block (%d rules)' % len(sels))
# --- CSS: top-pick chip
html = sub_n(r'  \.filter-chip-top \{.*?\n  \.filter-chip-top\.chip-active \{[^}]*\}\n', '', html, 1, re.S, 'css filter-chip-top base')
html = rep_n('.filter-chip, .filter-chip-top { font-size', '.filter-chip { font-size', html, 1, 'css mobile chip')
html = sub_n(r'\.filter-chip-top \{[^}]*\}\n\.filter-chip-top:hover \{[^}]*\}\n\.filter-chip-top\.chip-active \{[^}]*\}\n', '', html, 1, 0, 'css filter-chip-top restyle')
# --- CSS: string rec-box filter hide (grip gfilter-hide-rec stays)
html = rep_n('  .rec-box.filter-hide-rec { display: none; }\n', '', html, 1, 'css rec-box filter-hide-rec')
# --- CSS: gut top-pick row + badge
html = sub_n(r'\.gut-table tbody tr\.gut-row-top \{[^}]*\}\n\.gut-table tbody tr\.gut-row-top td:first-child \{[^}]*\}\n', '', html, 1, 0, 'css gut-row-top')
html = sub_n(r'\.gut-toppick-badge \{[^}]*\}\n', '', html, 1, 0, 'css gut-toppick-badge')

# --- JS renderer
html = sub_n(r"  function topPickTag\(\) \{\n[^\n]*\n  \}\n\n", '', html, 1, 0, 'js topPickTag')
html = rep_n('function nameCell(name, topPick, compareId) {', 'function nameCell(name, compareId) {', html, 1, 'js nameCell sig')
html = rep_n(" + esc(name) + (topPick ? topPickTag() : '') + '</td>'", " + esc(name) + '</td>'", html, 1, 'js nameCell body')
html = sub_n(r"    var cls = (per|g)\.topPick \? ' class=\"highlight\"' : '';\n", '', html, 4, 0, 'js row highlight')
html = sub_n(r"              \+ ' data-(grip-)?toppick=\"' \+ \((per|g)\.topPick \? '1' : '0'\) \+ '\"'\n", '', html, 4, 0, 'js data-toppick')
html = rep_n("return '<tr' + attrs + cls + '>'", "return '<tr' + attrs + '>'", html, 4, 'js tr cls')
html = rep_n('nameCell(s.name, per.topPick, s.id)', 'nameCell(s.name, s.id)', html, 1, 'js nameCell string')
html = rep_n('nameCell(h.name, per.topPick, h.id)', 'nameCell(h.name, h.id)', html, 1, 'js nameCell hybrid')
html = rep_n('nameCell(g.name, g.topPick)', 'nameCell(g.name)', html, 2, 'js nameCell grip')
html = sub_n(r"      // Stable sort: top picks for this racquet come first, preserving\n      // the original declared order within each group\.\n      rows = rows\n.*?\.map\(function\(x\) \{ return x\.h; \}\);\n", '', html, 1, re.S, 'js hybrid top-pick sort')
# --- JS gut strip
html = rep_n("    var rowClass = p.topPick ? ' class=\"gut-row-top\"' : '';\n\n", '', html, 1, 'js gut rowClass')
html = rep_n("return '<tr' + rowClass + ' data-config=", "return '<tr data-config=", html, 1, 'js gut tr')
html = rep_n("      +   (p.topPick ? '<span class=\"gut-toppick-badge\">★</span>' : '')\n", '', html, 1, 'js gut badge')
html = rep_n("""    // Sort: top picks first; then gut-mains before gut-crosses; then original order
    pairings = pairings.slice().map(function(p, i) {
      return { p: p, idx: i, tp: p.topPick ? 0 : 1, c: p.config === 'gut-mains' ? 0 : 1 };
    }).sort(function(a, b) {
      return a.tp - b.tp || a.c - b.c || a.idx - b.idx;
    })""", """    // Sort: gut-mains before gut-crosses; then original order
    pairings = pairings.slice().map(function(p, i) {
      return { p: p, idx: i, c: p.config === 'gut-mains' ? 0 : 1 };
    }).sort(function(a, b) {
      return a.c - b.c || a.idx - b.idx;
    })""", html, 1, 'js gut sort')
html = rep_n("    var topPicks = pairings.filter(function(p) { return p.topPick; }).length;\n", '', html, 1, 'js gut topPicks var')
# --- JS search
html = sub_n(r" \+ \((per|g|p)\.topPick \? ' · ★ Top Pick' : ''\)", '', html, 4, 0, 'js search sublabels')
html = rep_n("      // Bonus for top picks\n      if (item.sublabel.indexOf('★') !== -1) score += 5;\n", '', html, 1, 'js search bonus')
# --- JS table sort (stripped the ★ Top Pick tag from name cells)
html = rep_n("cellA.textContent.replace(/★.*/, '').trim()", 'cellA.textContent.trim()', html, 1, 'js sort A')
html = rep_n("cellB.textContent.replace(/★.*/, '').trim()", 'cellB.textContent.trim()', html, 1, 'js sort B')
# --- JS filter state
html = rep_n("  feel: [],\n  toppick: false\n};", "  feel: []\n};", html, 2, 'js filter state')
html = sub_n(r"( +)(filterState|gripFilterState)\.feel\.length > 0 \|\|\n +\2\.toppick;", r"\1\2.feel.length > 0;", html, 2, 0, 'js isActive')
for st, fn in (('filterState', 'applyFilters'), ('gripFilterState', 'applyGripFilters')):
    html = sub_n(r"  if \(group === 'toppick'\) \{\n    " + st + r"\.toppick = !" + st + r"\.toppick;\n    btn\.classList\.toggle\('chip-active', " + st + r"\.toppick\);\n  \} else \{\n    var arr = " + st + r"\[group\];\n    var idx = arr\.indexOf\(value\);\n    if \(idx >= 0\) \{\n      arr\.splice\(idx, 1\);\n      btn\.classList\.remove\('chip-active'\);\n    \} else \{\n      arr\.push\(value\);\n      btn\.classList\.add\('chip-active'\);\n    \}\n  \}\n",
                 "  var arr = " + st + "[group];\n  var idx = arr.indexOf(value);\n  if (idx >= 0) {\n    arr.splice(idx, 1);\n    btn.classList.remove('chip-active');\n  } else {\n    arr.push(value);\n    btn.classList.add('chip-active');\n  }\n",
                 html, 1, 0, 'js toggle ' + st)
    html = rep_n('  %s.toppick = false;\n' % st, '', html, 1, 'js clear ' + st)
html = rep_n("'.filter-chip.chip-active, .filter-chip-top.chip-active'", "'.filter-chip.chip-active'", html, 1, 'js clear selector')
html = rep_n("'#grip-filter-bar .filter-chip.chip-active, #grip-filter-bar .filter-chip-top.chip-active'", "'#grip-filter-bar .filter-chip.chip-active'", html, 1, 'js clear grip selector')
html = sub_n(r"\n[ \t]*// Top pick\n[ \t]*if \(filterState\.toppick\) \{\n[^\n]*\n[ \t]*\}\n", "\n", html, 1, 0, 'js apply toppick')
html = sub_n(r"\n[ \t]*// Top pick\n[ \t]*if \(gripFilterState\.toppick\) \{\n[^\n]*\n[ \t]*\}\n", "\n", html, 1, 0, 'js grip apply toppick')
# --- JS string rec-box handling (no string rec-boxes since v0.989)
html = rep_n("    // Reset table-wrap and rec-box visibility\n", "    // Reset table-wrap visibility\n", html, 1, 'js comment')
html = sub_n(r"    document\.querySelectorAll\('\.rec-box\.filter-hide-rec'\)\.forEach\(function\(rb\) \{\n      rb\.classList\.remove\('filter-hide-rec'\);\n    \}\);\n", '', html, 1, 0, 'js rec-box reset')
html = rep_n("""  // Filters active: force all brand sections visible, hide rec-boxes
  sections.forEach(function(s) {
    s.classList.add('filter-force-show');
    // Hide recommendation boxes during filtering
    var recBox = s.querySelector('.rec-box');
    if (recBox) recBox.classList.add('filter-hide-rec');
  });""", """  // Filters active: force all brand sections visible
  sections.forEach(function(s) {
    s.classList.add('filter-force-show');
  });""", html, 1, 'js rec-box hide')
# --- 1e. grip feel filter: token match (was substring)
html = rep_n("      var rowFeel = row.dataset.gripFeel || '';\n", "      var rowFeel = (row.dataset.gripFeel || '').split(',');\n", html, 1, 'js grip feel token match')

# --- version
nv = html.count('v0.989')
html = html.replace('v0.989', 'v0.990')
log['code'].append('version tags (%d)' % nv)

# ============================================================ residual audit
m2 = re.search(r'<script id="tennis-data" type="application/json">(.*?)</script>', html, re.S)
outside = html[:m2.start()] + html[m2.end():]
for needle in ['topPick', 'toppick', 'tag-top', 'filter-chip-top', 'gut-row-top', 'gut-toppick', 'Top Pick',
               'summary-section', 'summary-card', 'summary-pick', 'tr.highlight', 'class="highlight"', 'v0.989']:
    assert needle not in outside, 'residual: ' + needle
assert not re.search(r'(?<!g)filter-hide-rec', outside), 'residual string filter-hide-rec'
assert 'gfilter-hide-rec' in outside, 'grip rec-box hiding must survive'
assert '.filter-summary.summary-on' in outside, 'live filter-summary CSS must survive'
for v in set(VARIANT.values()):
    assert ('.tag-%s {' % v) in outside, 'no CSS for tag variant ' + v

io.open(DST, 'w', encoding='utf-8').write(html)
print('written', DST, len(html.encode('utf-8')), 'bytes')
for k, v in log.items():
    print('\n[%s] %d' % (k, len(v)))
    for line in v: print('   ', line)
print('\nstring feel counts:', dict(collections.Counter(a for r in db['strings'] for a in r['feelAttr'].split(','))))
