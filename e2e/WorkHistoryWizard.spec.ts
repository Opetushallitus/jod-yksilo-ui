import { expect, test } from '@playwright/test';

import { competences, suggestedCompetences, workHistory, workHistoryItem } from './fixtures';
import {
  mockAuthenticatedUser,
  mockFeatureFlags,
  mockProfileWizard,
  mockRedundantEndpoints,
  mockSelectedCompetences,
  mockSuggestedCompetences,
} from './mocks';

test.beforeEach(async ({ page }) => {
  await mockRedundantEndpoints(page);
  await mockFeatureFlags(page);
  await mockAuthenticatedUser(page);
  await mockSelectedCompetences(page, competences);
  await mockSuggestedCompetences(page, suggestedCompetences, competences);
  await mockProfileWizard(page, 'tyopaikat', workHistory);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/tyopaikkani');
  await page.getByText('Hyväksy kaikki').click();
});

test('add new workhistory', async ({ page, isMobile }) => {
  await mockProfileWizard(page, 'tyopaikat', []);
  // Open wizard
  await page.getByRole('button', { name: 'Lisää uusi työpaikka' }).click();

  // "Lisää uusi työpaikka" step
  await page.getByLabel('Työnantaja').fill('Testi Oy');
  await page.getByRole('textbox', { name: 'Toimenkuva' }).fill('Testaaja');
  await page.getByLabel('Alkoi').fill('01.01.2001');
  await page.getByLabel('Vapaamuotoinen kuvaus').fill('Työpaikan kuvaus');

  await page.keyboard.press('Tab');

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Tunnista osaamisia" step
  await page.getByRole('textbox', { name: 'Tunnista osaamisia' }).fill('kissa');

  await page.getByRole('button', { name: 'arvioida eläinten käyttäytymistä' }).click();
  await page.getByRole('button', { name: 'eläinten anatomia' }).click();
  await page.getByRole('button', { name: 'tarjota eläimille virikkeellinen ympäristö' }).click();

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Yhteenveto" step
  const rows = page.getByTestId('work-history-summary-table').locator('tbody tr');

  if (isMobile) {
    await expect(rows.nth(0).locator('td').nth(0)).toContainText('Testi Oy');
    await expect(rows.nth(0).locator('td').nth(0)).toContainText('1/2001');
    await expect(rows.nth(0).locator('td').nth(1)).toHaveText('3');
  } else {
    await expect(rows.nth(0).locator('td').nth(0)).toHaveText('Testi Oy');
    await expect(rows.nth(0).locator('td').nth(1)).toHaveText('1/2001');
    await expect(rows.nth(0).locator('td').nth(2)).toBeEmpty();
    await expect(rows.nth(0).locator('td').nth(3)).toHaveText('3');

    // Second row is for osaamiset when they are uncollapsed, so we check the third row
    await expect(rows.nth(2).locator('td').nth(0)).toHaveText('Testaaja');
    await expect(rows.nth(2).locator('td').nth(1)).toHaveText('1/2001');
    await expect(rows.nth(2).locator('td').nth(2)).toBeEmpty();
    await expect(rows.nth(2).locator('td').nth(3)).toHaveText('3');
  }

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/tyopaikat') && request.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload).toEqual(workHistoryItem);
});

test('delete workhistory item', async ({ page }) => {
  // Edit the first work history item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista työpaikka' }).click();
  const confirmButton = page.locator('button.ds\\:bg-alert-1', { hasText: 'Poista työpaikka' }).last();
  await expect(confirmButton).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (request) => request.url().includes('/api/profiili/tyopaikat') && request.method() === 'DELETE',
    ),
    confirmButton.click(),
  ]);
  const expectedId = workHistory[0].id;
  expect(request.url()).toContain('/api/profiili/tyopaikat/');
  expect(request.url()).toContain(expectedId);
});

test('edit workhistory item', async ({ page }) => {
  // Edit the first work history item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();

  await page.getByLabel('Työnantaja').fill('Testiperson Oyj');
  await page.keyboard.press('Tab');

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/tyopaikat') && request.method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload.nimi.fi).toBe('Testiperson Oyj');
});
