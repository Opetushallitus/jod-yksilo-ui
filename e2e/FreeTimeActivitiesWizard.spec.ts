import { expect, test } from '@playwright/test';

import {
  freetimeActivities,
  freetimeActivityItem,
  freetimeCompetences,
  suggestedFreetimeCompetences,
} from './fixtures';
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
  await mockSuggestedCompetences(page, suggestedFreetimeCompetences, freetimeCompetences);
  await mockSelectedCompetences(page, freetimeCompetences);
  await mockProfileWizard(page, 'vapaa-ajan-teemat', freetimeActivities);

  await page.goto('/yksilo/fi/osaamisprofiili/osaamiset/vapaa-ajan-teemat');
  await page.getByText('Hyväksy kaikki').click();
});

test('add new freetime activity', async ({ page, isMobile }) => {
  await mockProfileWizard(page, 'vapaa-ajan-teemat', []);
  // Open wizard
  await page.getByRole('button', { name: 'Lisää uusi vapaa-ajan teema' }).click();

  // "Lisää uusi vapaa-ajan teema"
  await page.getByLabel('Vapaa-ajan teeman nimi').fill('Testaaminen');
  await page.getByLabel('Vapaa-ajan toiminnon nimi').fill('Uima-altaan testaus');
  await page.getByLabel('Alkoi').fill('01.07.2001');
  await page.getByLabel('Loppui').fill('30.07.2001');
  await page.getByLabel('Vapaamuotoinen kuvaus').fill('Toiminnon kuvaus');

  await page.keyboard.press('Tab');
  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Tunnista osaamisia"
  await page.getByRole('textbox', { name: 'Tunnista osaamisia' }).fill('uida');

  await page.getByRole('button', { name: 'uida' }).click();
  await page.getByRole('button', { name: 'selviytyä merellä tilanteessa, jossa laiva joudutaan jättämään' }).click();
  await page.getByRole('button', { name: 'maailmanlaajuinen merihätä- ja turvallisuusjärjestelmä' }).click();

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Yhteenveto"
  const rows = page.getByTestId('free-time-summary-table').locator('tbody tr');

  if (isMobile) {
    await expect(rows.nth(0).locator('td').nth(0)).toContainText('Testaaminen');
    await expect(rows.nth(0).locator('td').nth(0)).toContainText('7/2001');
    await expect(rows.nth(0).locator('td').nth(1)).toHaveText('3');
  } else {
    await expect(rows.nth(0).locator('td').nth(0)).toHaveText('Testaaminen');
    await expect(rows.nth(0).locator('td').nth(1)).toHaveText('7/2001');
    await expect(rows.nth(0).locator('td').nth(2)).toHaveText('7/2001');
    await expect(rows.nth(0).locator('td').nth(3)).toHaveText('3');

    // Second row is for osaamiset when they are uncollapsed, so we check the third row
    await expect(rows.nth(2).locator('td').nth(0)).toHaveText('Uima-altaan testaus');
    await expect(rows.nth(2).locator('td').nth(1)).toHaveText('7/2001');
    await expect(rows.nth(2).locator('td').nth(2)).toHaveText('7/2001');
    await expect(rows.nth(2).locator('td').nth(3)).toHaveText('3');
  }

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/vapaa-ajan-teemat') && request.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload).toEqual(freetimeActivityItem);
});

test('delete freetime activity item', async ({ page }) => {
  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista teema' }).click();
  const confirmButton = page.locator('button.ds\\:bg-alert-1', { hasText: 'Poista' }).last();
  await expect(confirmButton).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (request) => request.url().includes('/api/profiili/vapaa-ajan-teemat') && request.method() === 'DELETE',
    ),
    confirmButton.click(),
  ]);
  const expectedId = freetimeActivities[0].id;
  expect(request.url()).toContain('/api/profiili/vapaa-ajan-teemat/');
  expect(request.url()).toContain(expectedId);
});

test('edit freetime activity item', async ({ page }) => {
  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();

  await page.getByLabel('Vapaa-ajan teeman nimi').fill('Testaus');

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/vapaa-ajan-teemat') && request.method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload.nimi.fi).toBe('Testaus');
});
