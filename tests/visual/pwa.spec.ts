// The web build installs a service worker that precaches everything, so after one online
// visit the app loads and works with the network off.
import { APP_URL, expect, open, test } from './support';

test('works offline after the first visit', async ({ context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'one viewport is enough');

  const page = await open(context, APP_URL);
  // The worker activates and claims the page once the precache is complete.
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 15_000,
  });

  const manifest = await page.evaluate(async () => {
    const href = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')!.href;
    return (await fetch(href)).json();
  });
  expect(manifest).toMatchObject({ short_name: 'EquipDB', display: 'standalone' });

  await context.setOffline(true);
  await page.reload();
  await page.locator('html[data-ready="1"]').waitFor({ state: 'attached' });
  await expect(page.locator('tr[data-id]')).toHaveCount(281);
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
  });
  expect(fonts.join(',')).toMatch(/DM Sans/);
  expect(fonts.join(',')).toMatch(/Space Mono/);

  // Navigating offline still works: the filters and search run on the cached bundle.
  await page.locator('#btn-racquet-percept').click();
  await expect(page.locator('#percept-content')).toBeVisible();
  await context.setOffline(false);
});
