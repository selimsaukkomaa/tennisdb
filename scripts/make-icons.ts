// Renders the app icon from the topbar wordmark (Space Mono, the app's own colours) with
// Playwright's Chromium, at every size the PWA and the iOS app need.
//
//   tsx scripts/make-icons.ts <variant>            writes public/icons/*, the iOS AppIcon and
//                                                  the iOS launch screen
//   tsx scripts/make-icons.ts --preview <out.png>  renders all variants side by side
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium, type Browser } from '@playwright/test';
import { PNG } from 'pngjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONTS = pathToFileURL(join(ROOT, 'src', 'styles', 'fonts.css')).href;
/** The page background (body in base.css); the launch screen uses it so loading is seamless. */
const APP_BACKGROUND = '#f0efeb';

interface Variant {
  bg: string;
  top: string;
  bottom: string;
}

export const VARIANTS: Record<string, Variant> = {
  light: { bg: '#f0efeb', top: '#111111', bottom: '#b3afa4' },
  dark: { bg: '#111111', top: '#f0efeb', bottom: '#fbbf24' },
  blue: { bg: '#2563eb', top: '#ffffff', bottom: '#bfdbfe' },
};

/** `inset` is the share of the side kept clear around the wordmark (maskable icons need more). */
function iconHtml(v: Variant, inset: number): string {
  const size = 1024;
  const font = Math.round((size * (1 - 2 * inset)) / 3.2);
  return `<!doctype html><html><head><link rel="stylesheet" href="${FONTS}">
<style>
  html, body { margin: 0; width: ${size}px; height: ${size}px; background: ${v.bg}; }
  body { display: flex; flex-direction: column; align-items: center; justify-content: center;
         font-family: 'Space Mono', monospace; font-weight: 700; line-height: 0.95;
         letter-spacing: -0.02em; font-size: ${font}px; }
  .top { color: ${v.top}; } .bottom { color: ${v.bottom}; }
</style></head><body><div class="top">EQUIP</div><div class="bottom">DB</div></body></html>`;
}

async function render(browser: Browser, html: string, px: number, out: string): Promise<void> {
  const page = await browser.newPage({
    viewport: { width: 1024, height: 1024 },
    deviceScaleFactor: px / 1024,
  });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out });
  await page.close();
}

/** A solid-colour opaque PNG (the iOS launch screen: the app background, no logo). */
function solidPng(out: string, size: number, hex: string): void {
  const png = new PNG({ width: size, height: size, colorType: 2 });
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = r!;
    png.data[i + 1] = g!;
    png.data[i + 2] = b!;
    png.data[i + 3] = 255;
  }
  writeFileSync(out, PNG.sync.write(png, { colorType: 2 }));
}

/** iOS app icons must be opaque: round-trip through JPEG to drop the alpha channel. */
function opaque(png: string): void {
  const jpg = png.replace(/\.png$/, '.tmp.jpg');
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '100', png, '--out', jpg], {
    stdio: 'ignore',
  });
  execFileSync('sips', ['-s', 'format', 'png', jpg, '--out', png], { stdio: 'ignore' });
  execFileSync('rm', [jpg]);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const browser = await chromium.launch();
  if (args[0] === '--preview') {
    const cells = Object.entries(VARIANTS)
      .map(
        ([name, v]) =>
          `<figure><iframe srcdoc="${iconHtml(v, 0.12).replace(/"/g, '&quot;')}"></iframe><figcaption>${name}</figcaption></figure>`,
      )
      .join('');
    const sheet = `<!doctype html><html><body style="margin:0;padding:24px;background:#fff;font:600 28px system-ui;display:flex;gap:32px">
<style>figure{margin:0;text-align:center}iframe{width:1024px;height:1024px;border:0;border-radius:180px;transform:scale(.35);transform-origin:0 0;margin:0 -666px -666px 0;display:block}</style>${cells}</body></html>`;
    const page = await browser.newPage({ viewport: { width: 1200, height: 460 } });
    await page.setContent(sheet);
    await page.waitForTimeout(500);
    await page.screenshot({ path: args[1] ?? 'icon-preview.png' });
  } else {
    const v = VARIANTS[args[0] ?? ''];
    if (!v) throw new Error(`variant must be one of: ${Object.keys(VARIANTS).join(', ')}`);
    const pub = join(ROOT, 'public', 'icons');
    await render(browser, iconHtml(v, 0.12), 192, join(pub, 'icon-192.png'));
    await render(browser, iconHtml(v, 0.12), 512, join(pub, 'icon-512.png'));
    await render(browser, iconHtml(v, 0.2), 512, join(pub, 'maskable-512.png'));
    await render(browser, iconHtml(v, 0.12), 180, join(pub, 'apple-touch-icon.png'));
    await render(browser, iconHtml(v, 0.06), 64, join(pub, 'favicon-64.png'));
    const ios = join(
      ROOT,
      'ios',
      'App',
      'App',
      'Assets.xcassets',
      'AppIcon.appiconset',
      'AppIcon-512@2x.png',
    );
    await render(browser, iconHtml(v, 0.12), 1024, ios);
    opaque(ios);
    opaque(join(pub, 'apple-touch-icon.png'));
    const splash = join(ROOT, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset');
    for (const name of [
      'splash-2732x2732.png',
      'splash-2732x2732-1.png',
      'splash-2732x2732-2.png',
    ]) {
      solidPng(join(splash, name), 2732, APP_BACKGROUND);
    }
    console.log(`icons written for variant "${args[0]}"`);
  }
  await browser.close();
}

await main();
