import { defineConfig } from '@playwright/test';

export const LEGACY_PORT = 4301;
export const APP_PORT = 4300;

// Parity suite: every view is rendered by the legacy v0.990 page and by the new build in the
// same browser and viewport, then compared pixel by pixel (tests/visual/support.ts).
export default defineConfig({
  testDir: 'tests/visual',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
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
      command: `npx tsx tests/visual/serve-static.ts legacy ${LEGACY_PORT}`,
      port: LEGACY_PORT,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npx vite build && npx vite preview --port ${APP_PORT} --strictPort`,
      port: APP_PORT,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
