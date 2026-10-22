/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves the project at /tennisdb/; local dev, preview and Capacitor use '/'.
  base: process.env.BASE_PATH ?? '/',
  build: {
    target: 'es2022',
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
