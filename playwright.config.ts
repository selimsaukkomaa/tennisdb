import { defineConfig } from '@playwright/test';

export const APP_PORT = 4300;

// Browser suite: the app's key views against approved baselines in tests/visual/baselines
// (pixels on macOS, DOM everywhere; see views.spec.ts and dom.spec.ts), and offline support.
// Update the baselines on purpose, after a change is approved: `npx playwright test
// --update-snapshots`.
export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // On CI, 'github' turns each failure into an annotation, readable without signing in.
  reporter: process.env.CI ? [['github'], ['list'], ['html', { open: 'never' }]] : 'list',
  // DOM baselines (text) have no platform in their path; pixel baselines do (below).
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      pathTemplate: '{testDir}/baselines/pixels/{arg}-{projectName}-{platform}{ext}',
      threshold: 0.1,
      maxDiffPixelRatio: 0.001,
    },
  },
  use: {
    browserName: 'chromium',
    colorScheme: 'light',
    locale: 'en-US',
    timezoneId: 'UTC',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
    {
      name: 'iphone',
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: `npx vite build && npx vite preview --port ${APP_PORT} --strictPort`,
      port: APP_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
