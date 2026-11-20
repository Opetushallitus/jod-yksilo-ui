import { test as base, expect, type Page } from '@playwright/test';

import { FakeBackend } from './backend';

interface Fixtures {
  backend: FakeBackend;
  /** Opens a page under /yksilo/{lang} and accepts all cookies, like a returning user would have done. */
  open: (path?: string, lang?: 'fi' | 'sv' | 'en') => Promise<void>;
}

export const acceptAllCookies = async (page: Page) => {
  const modal = page.getByTestId('cookie-consent-modal');
  await modal.getByTestId('accept-all').click();
  // The modal element itself is a zero-size wrapper that is never "visible", so check its content instead.
  await expect(modal.getByTestId('title')).toBeHidden();
};

/**
 * The confirmation dialog of a deletion, e.g. "Poista toimenkuva". It is opened on top of an edit dialog that has its own
 * delete button, so it is found by its "Poista …" heading instead of being just any dialog.
 */
export const confirmDeletion = (page: Page) =>
  page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: /^Poista/ }) })
    .getByRole('button', { name: /^Poista/ });

export const test = base.extend<Fixtures>({
  // Installed for every test, also those that use only `page`, so that no test can reach a real backend.
  backend: [
    async ({ page }, use) => {
      const backend = new FakeBackend();
      await backend.install(page);
      await use(backend);
      expect(backend.unhandledRequests, 'Requests not handled by e2e/backend.ts').toEqual([]);
    },
    { auto: true },
  ],
  open: async ({ page }, use) => {
    let cookiesAccepted = false;
    await use(async (path = '', lang = 'fi') => {
      await page.goto(`/yksilo/${lang}/${path}`);
      if (!cookiesAccepted) {
        await acceptAllCookies(page);
        cookiesAccepted = true;
      }
    });
  },
});

export { expect };
