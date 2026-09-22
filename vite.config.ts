import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
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
    {
      name: 'serve-notifications-json',
      configureServer(server) {
        server.middlewares.use('/yksilo/config/notifications.json', (_, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify([
              // {
              //   id: 'test-notification',
              //   title: { fi: 'Testi-ilmoitus', sv: 'Testnotis', en: 'Test notification' },
              //   description: {
              //     fi: 'Tämä on testi-ilmoitus.',
              //     sv: 'Detta är en testnotis.',
              //     en: 'This is a test notification.',
              //   },
              //   variant: 'success' as const,
              //   link: {
              //     label: { fi: 'Lue lisää', sv: 'Läs mer', en: 'Read more' },
              //     url: {
              //       fi: 'http://localhost:8080/yksilo/fi',
              //       sv: 'http://localhost:8080/yksilo/sv',
              //       en: 'http://localhost:8080/yksilo/en',
              //     },
              //   },
              // },
            ]),
          );
        });
      },
    },
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React must sit in its own chunk: it changes rarely and everything depends on it.
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 40,
            },
            // The shared UI machinery pulled in by the design system.
            {
              name: 'ui-vendor',
              test: /[\\/]node_modules[\\/](@headlessui|@ark-ui|@floating-ui|@zag-js|@react-aria|@tanstack|@internationalized|motion|framer-motion|focus-trap|focus-trap-react|tabbable)[\\/]/,
              priority: 30,
            },
            // The design system itself. Matches both the installed package and a
            // `npm link`ed checkout, whose module ids are real paths.
            {
              name: 'design-system',
              test: /(?:[\\/]node_modules[\\/]@jod[\\/]design-system[\\/]|[\\/]jod-design-system[\\/]dist[\\/])/,
              priority: 20,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              minSize: 20_000,
            },
          ],
        },
      },
    },
  },
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
    // Keeps the dev server working against a `npm link`ed @jod/design-system:
    // without this it loads a second React from the linked checkout's own
    // node_modules and every hook call throws. Does not help Vitest, which
    // resolves externalized deps with Node — run tests against `npm pack`
    // output instead (see README).
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'motion',
      '@headlessui/react',
      '@ark-ui/react',
      '@floating-ui/react',
      '@internationalized/date',
      'cva',
      'tailwind-merge',
      'focus-trap-react',
    ],
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
      '/konfo-backend/external/koulutus/': {
        target: 'https://testiopintopolku.fi',
        changeOrigin: true,
      },
      '/yksilo/api': {
        target,
        xfwd: true,
      },
      '/yksilo/oauth2': {
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
