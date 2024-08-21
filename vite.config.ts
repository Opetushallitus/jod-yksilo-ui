/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

// The target API base URL
const target = process.env.API_BASE_URL ?? 'http://localhost:8080';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov'],
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  server: {
    proxy: {
      '/api': {
        target,
        xfwd: true,
      },
      '/login': {
        target,
        xfwd: true,
      },
      '/saml2': {
        target,
        xfwd: true,
      },
      '/logout': {
        target,
        xfwd: true,
      },
      '/openapi': {
        target,
        xfwd: true,
      },
    },
  },
});
