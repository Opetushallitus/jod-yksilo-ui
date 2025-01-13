import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

// The target API base URL
const target = process.env.API_BASE_URL ?? 'http://localhost:9080';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/yksilo/',
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
    port: 8080,
    proxy: {
      '/yksilo/api': {
        target,
        xfwd: true,
      },
      '/yksilo/login': {
        target,
        xfwd: true,
      },
      '/yksilo/saml2': {
        target,
        xfwd: true,
      },
      '/yksilo/logout': {
        target,
        xfwd: true,
      },
      '/yksilo/openapi': {
        target,
        xfwd: true,
      },
      '/urataidot': {
        target: 'http://localhost:5173',
        xfwd: true,
      },
    },
  },
});
