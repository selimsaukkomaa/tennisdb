// One-off: download the exact Google Fonts stylesheet the v0.990 app links to, plus every
// woff2 file it references, so the app can self-host the same bytes (offline PWA, iOS).
//
// Writes:
//   src/assets/fonts/<file>.woff2      font files, named after their fonts.gstatic.com path
//   src/assets/fonts/google-fonts.css  the stylesheet as Google served it (gstatic URLs);
//                                      the parity tests serve it to the legacy page
//   src/styles/fonts.css               the same rules pointing at the local files
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONTS_DIR = join(ROOT, 'src', 'assets', 'fonts');
const legacy = readFileSync(join(ROOT, 'legacy', 'tennis_equipmentdb_v0_990.html'), 'utf8');

const href = legacy.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/)?.[1];
if (!href) throw new Error('Google Fonts link not found in legacy HTML');
const cssUrl = href.replace(/&amp;/g, '&');

// Google varies the response by user agent; a current Chrome UA gets woff2 with unicode-range
// subsets, which is what the Playwright Chromium and every evergreen browser would receive.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

/** fonts.gstatic.com/s/dmsans/v17/abc.woff2 -> dmsans-v17-abc.woff2 */
export function localName(url: string): string {
  return new URL(url).pathname.replace(/^\/s\//, '').replaceAll('/', '-');
}

async function main(): Promise<void> {
  const res = await fetch(cssUrl, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`stylesheet: HTTP ${res.status}`);
  const css = await res.text();

  const urls = [
    ...new Set(
      [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1]!),
    ),
  ];
  const faces = (css.match(/@font-face/g) ?? []).length;
  if (!urls.length || !urls.every((u) => u.endsWith('.woff2'))) {
    throw new Error('expected woff2 URLs only; got: ' + urls.join(', '));
  }

  mkdirSync(FONTS_DIR, { recursive: true });
  let bytes = 0;
  for (const url of urls) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    bytes += buf.length;
    writeFileSync(join(FONTS_DIR, localName(url)), buf);
  }

  writeFileSync(join(FONTS_DIR, 'google-fonts.css'), css, 'utf8');
  const local =
    '/* Self-hosted copy of the Google Fonts stylesheet v0.990 linked to (scripts/vendor-fonts.ts). */\n' +
    css.replace(
      /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g,
      (_, u: string) => `url('../assets/fonts/${localName(u)}')`,
    );
  writeFileSync(join(ROOT, 'src', 'styles', 'fonts.css'), local, 'utf8');

  console.log(
    `${faces} @font-face rules, ${urls.length} woff2 files, ${(bytes / 1024).toFixed(0)} KB`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
