/// <reference types="vitest/config" />
import { tsImport } from 'tsx/esm/api';
import { defineConfig, type Plugin } from 'vite';

type Validator = typeof import('./scripts/validate-data');

/**
 * Fails the dev server start and every build when the data breaks an invariant (see
 * src/core/validate.ts), and reports new problems when data, copy or styles change in dev.
 * The validator is loaded through tsx at run time so this config imports no app source.
 */
function validateData(): Plugin {
  const run = async (): Promise<string> => {
    const v = (await tsImport('./scripts/validate-data.ts', import.meta.url)) as Validator;
    const issues = v.collectIssues();
    return issues.length
      ? `Data validation failed (${issues.length}):\n${v.formatIssues(issues)}`
      : '';
  };
  return {
    name: 'tennisdb:validate-data',
    async buildStart() {
      const report = await run();
      if (report) this.error(report);
    },
    async handleHotUpdate({ file, server }) {
      if (!/[\\/](data|content)[\\/][^\\/]+\.json$|[\\/]src[\\/]styles[\\/]/.test(file)) return;
      const report = await run();
      if (report) server.config.logger.error(report);
    },
  };
}

export default defineConfig({
  // GitHub Pages serves the project at /tennisdb/; local dev, preview and Capacitor use '/'.
  base: process.env.BASE_PATH ?? '/',
  plugins: [validateData()],
  build: {
    // Ship the stylesheet unminified, i.e. v0.990's CSS verbatim. Lightning CSS (Vite's CSS
    // minifier) turns `backdrop-filter: X; -webkit-backdrop-filter: X` into the prefixed
    // declaration alone, which Chromium ignores, losing the palette and compare blur.
    cssMinify: false,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
