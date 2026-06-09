import { expect, test } from '@playwright/test';

import {
  educationCompetences,
  educationHistory,
  educationHistoryItem,
  suggestedEducationCompetences,
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
  await mockSuggestedCompetences(page, suggestedEducationCompetences, educationCompetences);
  await mockSelectedCompetences(page, educationCompetences);
  await mockProfileWizard(page, 'koulutuskokonaisuudet', educationHistory);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/koulutukseni');
  await page.getByText('Hyväksy kaikki').click();
});

test('add new education', async ({ page, isMobile }) => {
  await mockProfileWizard(page, 'koulutuskokonaisuudet', []);
  // Open wizard
  await page.getByRole('button', { name: 'Lisää uusi koulutus' }).click();

  // "Lisää uusi koulutus"
  await page.getByLabel('Oppilaitos tai koulutuksen järjestäjä').fill('Iso Opisto');
  await page.getByLabel('Tutkinnon tai koulutuksen nimi').fill('Oppilas');
  await page.getByLabel('Alkoi').fill('01.01.2001');
  await page.getByLabel('Vapaamuotoinen kuvaus').fill('Koulutuksen kuvaus');

  await page.keyboard.press('Tab');
  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Tunnista osaamisia" step
  await page.getByRole('textbox', { name: 'Tunnista osaamisia' }).fill('opetus');

  await page.getByRole('button', { name: 'opetussuunnitelman tavoitteet' }).click();
  await page.getByRole('button', { name: 'arviointiprosessit' }).click();
  await page.getByRole('button', { name: 'kehittää opetusohjelma' }).click();

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Yhteenveto" step
  const rows = page.getByTestId('education-history-summary-table').locator('tbody tr');
  if (isMobile) {
    await expect(rows.nth(0).locator('td').nth(0)).toContainText('Iso Opisto');
    await expect(rows.nth(0).locator('td').nth(0)).toContainText('1/2001');
    await expect(rows.nth(0).locator('td').nth(1)).toHaveText('3');
  } else {
    await expect(rows.nth(0).locator('td').nth(0)).toHaveText('Iso Opisto');
    await expect(rows.nth(0).locator('td').nth(1)).toHaveText('1/2001');
    await expect(rows.nth(0).locator('td').nth(2)).toBeEmpty();
    await expect(rows.nth(0).locator('td').nth(3)).toHaveText('3');

    // Second row is for osaamiset when they are uncollapsed, so we check the third row
    await expect(rows.nth(2).locator('td').nth(0)).toHaveText('Oppilas');
    await expect(rows.nth(2).locator('td').nth(1)).toHaveText('1/2001');
    await expect(rows.nth(2).locator('td').nth(2)).toBeEmpty();
    await expect(rows.nth(2).locator('td').nth(3)).toHaveText('3');
  }

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/koulutuskokonaisuudet') && request.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload).toEqual(educationHistoryItem);
});

test('delete educationHistory item', async ({ page }) => {
  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista koulutus' }).click();
  const confirmButton = page.locator('button.ds\\:bg-alert-1', { hasText: 'Poista koulutus' }).last();
  await expect(confirmButton).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (request) => request.url().includes('/api/profiili/koulutuskokonaisuudet') && request.method() === 'DELETE',
    ),
    confirmButton.click(),
  ]);

  const expectedId = educationHistory[0].id;
  expect(request.url()).toContain('/api/profiili/koulutuskokonaisuudet/');
  expect(request.url()).toContain(expectedId);
});

test('edit educationHistory item', async ({ page }) => {
  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByLabel('Oppilaitos tai koulutuksen järjestäjä').fill('Opisto');

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/koulutuskokonaisuudet') && request.method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload.nimi.fi).toBe('Opisto');
});
