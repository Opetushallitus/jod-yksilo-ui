import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { configDefaults } from 'vitest/config';

// The target API base URL
const target = process.env.API_BASE_URL ?? 'http://localhost:9080';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/yksilo/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-features-json',
      configureServer(server) {
        server.middlewares.use('/yksilo/config/features.json', (_, res) => {
          const featuresPath = join(process.cwd(), 'config', 'features.json');
          const content = readFileSync(featuresPath, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(content);
        });
      },
    },
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e'],
    setupFiles: ['./vitest.setup.ts', './src/i18n/config.ts'],
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
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), '../jod-assets'],
    },
    proxy: {
      '/koodisto-service/rest/json': {
        target: 'https://virkailija.opintopolku.fi',
        changeOrigin: true,
      },
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
      '/yksilo/oauth2/authorize/koski': {
        target,
        xfwd: true,
      },
      '/yksilo/oauth2/authorization/koski': {
        target,
        xfwd: true,
      },
      '/yksilo/oauth2/response/koski': {
        target,
        xfwd: true,
      },
      '/api/integraatiot/koski/koulutukset': {
        target,
        xfwd: true,
      },
      '/yksilo/config/features.json': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: () => '/config/features.json',
      },
      '/urataidot': {
        target: 'http://localhost:5173',
        xfwd: true,
      },
      '/api': {
        target: 'https://jodkehitys.fi',
        changeOrigin: true,
        xfwd: true,
      },
      '/': {
        target: 'http://localhost:5173', // Landing page UI
        xfwd: true,
        bypass: (req) => {
          if (req.url && req.url.startsWith('/yksilo')) {
            return req.url;
          }
        },
      },
    },
  },
});
