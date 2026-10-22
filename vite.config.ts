/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves the project at /tennisdb/; local dev, preview and Capacitor use '/'.
  base: process.env.BASE_PATH ?? '/',
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
