import { expect, test } from './fixtures';

test('user changes the cookie consent from the footer', async ({ page }) => {
  await page.goto('/yksilo/fi');
  const modal = page.getByTestId('cookie-consent-modal');
  // The modal element itself is a zero-size wrapper, so visibility is checked from its title.
  const title = modal.getByTestId('title');
  const settings = page.getByRole('contentinfo').getByRole('button', { name: 'Evästeasetukset' });

  await expect(title).toHaveText('Käytämme evästeitä');
  await modal.getByTestId('decline-optional').click();
  await expect(title).toBeHidden();

  await settings.click();
  await expect(modal.getByTestId('current-selection')).toContainText('Hyväksy vain välttämättömät');
  await modal.getByTestId('accept-all').click();
  await expect(title).toBeHidden();

  await settings.click();
  await expect(modal.getByTestId('current-selection')).toContainText('Hyväksy kaikki');
});

test('the consent is remembered after a reload', async ({ page }) => {
  await page.goto('/yksilo/fi');
  await page.getByTestId('cookie-consent-modal').getByTestId('accept-all').click();

  await page.reload();

  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByTestId('cookie-consent-modal').getByTestId('title')).toBeHidden();
});

test('the cookie settings can be read in other languages', async ({ page }) => {
  await page.goto('/yksilo/fi');
  const modal = page.getByTestId('cookie-consent-modal');

  await modal.getByTestId('language-button-trigger').click();
  await modal.getByTestId('language-button-menu-item-sv').click();
  await expect(modal.getByTestId('title')).toHaveText('Vi använder cookies');

  await modal.getByTestId('language-button-trigger').click();
  await modal.getByTestId('language-button-menu-item-en').click();
  await expect(modal.getByTestId('title')).toHaveText('We use cookies');

  await modal.getByTestId('language-button-trigger').click();
  await modal.getByTestId('language-button-menu-item-fi').click();
  await expect(modal.getByTestId('title')).toHaveText('Käytämme evästeitä');
});
