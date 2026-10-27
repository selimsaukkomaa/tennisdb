// Backup round trip in a real browser: Export downloads the log, Import (file picker + confirm)
// merges it into another, empty log.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { APP_URL, expect, open, test } from './support';

const seed = JSON.parse(
  readFileSync(fileURLToPath(new URL('../fixtures/log-seed.json', import.meta.url)), 'utf8'),
) as { tennis_log_v2: unknown };

test('export, then import into an empty log', async ({ browser, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one viewport is enough');

  await context.addInitScript((doc: string) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('tennis_log_v2', doc);
      sessionStorage.setItem('seeded', '1');
    }
  }, JSON.stringify(seed.tennis_log_v2));
  const source = await open(context, APP_URL);
  await source.locator('[data-log-toggle="regna"]').click();
  const [download] = await Promise.all([
    source.waitForEvent('download'),
    source.locator('.log-section[data-racquet="regna"] [data-log-export]').click(),
  ]);
  expect(download.suggestedFilename()).toBe('tennisdb-log-2026-10-22.json');
  const file = testInfo.outputPath('backup.json');
  await download.saveAs(file);
  const backup = JSON.parse(readFileSync(file, 'utf8'));
  expect(backup).toMatchObject({ schema: 2, app: 'tennisdb' });
  expect(backup.entries).toHaveLength(3);

  // A separate, empty browser profile stands in for the other device.
  const other = await browser.newContext();
  const target = await other.newPage();
  await target.goto(APP_URL);
  await target.locator('html[data-ready="1"]').waitFor({ state: 'attached' });
  await target.locator('[data-log-toggle="regna"]').click();
  let question = '';
  target.on('dialog', (d) => {
    question = d.message();
    void d.accept();
  });
  const [chooser] = await Promise.all([
    target.waitForEvent('filechooser'),
    target.locator('.log-section[data-racquet="regna"] [data-log-import]').click(),
  ]);
  await chooser.setFiles(file);
  await expect(target.locator('.log-section[data-racquet="regna"] .log-entry')).toHaveCount(2);
  expect(question).toBe('Import 3 new and 0 updated entries? Entries already in the log are kept.');
  await expect(target.locator('.context-line[data-racquet="regna"] .ctx-strung-name')).toHaveText(
    'Caviar',
  );
  await other.close();
});

test('on an empty log the backup links sit inside the panel', async ({ context }, testInfo) => {
  test.skip(testInfo.project.name !== 'iphone', 'the narrow layout is where it showed');
  const page = await open(context, APP_URL);
  await page.locator('[data-log-toggle="regna"]').click();
  const panel = await page.locator('.log-section[data-racquet="regna"] .log-panel').boundingBox();
  const link = await page
    .locator('.log-section[data-racquet="regna"] [data-log-import]')
    .boundingBox();
  expect(link!.y + link!.height).toBeLessThanOrEqual(panel!.y + panel!.height);
});
