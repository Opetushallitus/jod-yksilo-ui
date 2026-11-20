import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// By default the tests run on Chrome only (desktop and mobile) to keep the runs fast. Set E2E_ALL_BROWSERS=1, or pick
// projects with --project, to run on the other browsers too.
const defaultProjects = new Set(['Google Chrome', 'Mobile Chrome']);
if (process.argv.some((arg) => arg.startsWith('--project'))) {
  // The worker processes do not get the command line arguments, so they are told through the environment.
  process.env.E2E_ALL_BROWSERS = '1';
}
const allBrowsers = !!process.env.E2E_ALL_BROWSERS;
const port = 8280;

// https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // The tests are independent (the backend is faked in each browser), so CI uses every core (4 on GitHub's
  // ubuntu-latest). Locally the default is half of them.
  workers: isCI ? '100%' : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'html',
  use: {
    contextOptions: {
      reducedMotion: 'reduce',
    },
    baseURL: `http://localhost:${port}`,
    locale: 'fi-FI',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], ...(isCI ? {} : { channel: 'chrome' }) },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], ...(isCI ? {} : { channel: 'msedge' }) },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
  ].filter((project) => allBrowsers || defaultProjects.has(project.name)),
  webServer: {
    // The backend is faked in the browser (see e2e/backend.ts), so no backend needs to be running.
    command: isCI ? `vite preview --port ${port} --strictPort` : `vite dev --port ${port} --strictPort`,
    url: `http://localhost:${port}/yksilo/`,
    reuseExistingServer: !isCI,
  },
});
