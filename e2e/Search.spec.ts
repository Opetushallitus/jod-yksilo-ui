import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';

const results = (page: Page) =>
  page.getByRole('main').getByRole('list').first().getByRole('heading', { level: 3 }).getByRole('link');

/** The search filters are in a sidebar, or behind a button on narrow screens. */
const toggleFilter = async (page: Page, isMobile: boolean, name: string) => {
  if (isMobile) {
    await page.getByRole('main').getByRole('button', { name: 'Suodattimet' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('checkbox', { name: new RegExp(`^${name}`) }).click();
    await dialog.getByRole('button').last().click();
    await expect(dialog).toBeHidden();
  } else {
    await page
      .getByRole('complementary')
      .getByRole('checkbox', { name: new RegExp(`^${name}`) })
      .click();
  }
};

test('user searches opportunities from the header', async ({ page, open, isMobile }) => {
  await open();
  const header = page.getByTestId('app-header');
  if (isMobile) {
    await header.getByRole('button', { name: 'Hae' }).click();
  }

  await header.getByRole('searchbox', { name: 'Hae mahdollisuuksia' }).fill('tutkinto');
  await header.getByRole('button', { name: 'Hae' }).click();

  await expect(page).toHaveURL('/yksilo/fi/haku?q=tutkinto');
  await expect(page.getByRole('main').getByRole('heading', { level: 1, name: 'Hae mahdollisuuksia' })).toBeVisible();
  await expect(results(page)).toHaveText(['Liiketalouden perustutkinto', 'Eläintenhoidon ammattitutkinto']);
});

test('user filters the search results by type', async ({ page, open, isMobile }) => {
  // A query shorter than three characters lists all opportunities.
  await open('haku?q=ja');
  await expect(results(page)).toHaveCount(6);

  for (const [filter, expected] of [
    ['Ammatti', ['Huvipuistonjohtaja', 'Eläintenhoitaja']],
    ['Muu työmahdollisuus', ['Laitetyöntekijä']],
    ['Tutkinto', ['Liiketalouden perustutkinto', 'Eläintenhoidon ammattitutkinto']],
    ['Muu koulutusmahdollisuus', ['Vartijan koulutus']],
  ] as const) {
    await toggleFilter(page, isMobile, filter);
    await expect(results(page)).toHaveText([...expected]);
    await toggleFilter(page, isMobile, filter);
    await expect(results(page)).toHaveCount(6);
  }
});

test('user opens an opportunity from the search results', async ({ page, open }) => {
  await open('haku?q=vartija');

  await results(page).first().click();

  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toContainText('Vartijan koulutus');
});

test('a search without results says so', async ({ page, open }) => {
  await open('haku?q=astronautti');

  await expect(page.getByRole('main').getByRole('status')).toContainText('0');
  await expect(results(page)).toHaveCount(0);
});
