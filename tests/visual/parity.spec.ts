import {
  APP_URL,
  LEGACY_URL,
  expect,
  expectSameRendering,
  loadedFontFamilies,
  open,
  screenshot,
  test,
} from './support';

// The UI tag shows the app version (v0.991) while legacy says v0.990: a declared difference.
const maskVersion = {
  mask: (page: import('@playwright/test').Page) => [page.locator('.version-tag')],
};

test('harness: legacy renders identically twice, with the vendored fonts', async ({
  context,
}, testInfo) => {
  const first = await open(context, LEGACY_URL);
  const second = await open(context, LEGACY_URL);
  expect(await loadedFontFamilies(first)).toEqual(['DM Sans', 'Space Mono']);
  await expectSameRendering(testInfo, await screenshot(first), await screenshot(second));
});

test('default view: Strings / Regna / Toroline', async ({ context }, testInfo) => {
  test.fail(true, 'expected to fail until the app shell is ported in step 2');
  const legacy = await open(context, LEGACY_URL);
  const app = await open(context, APP_URL);
  await expectSameRendering(
    testInfo,
    await screenshot(legacy, maskVersion),
    await screenshot(app, maskVersion),
  );
});
