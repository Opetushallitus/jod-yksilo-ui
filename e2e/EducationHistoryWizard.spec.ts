import { expect, Page, test } from '@playwright/test';
import {
  educationCompetences,
  educationHistory,
  educationHistoryItem,
  suggestedEducationCompetences,
} from './fixtures';
import { mockAuthenticatedUser, mockProfileWizard, mockSelectedCompetences, mockSuggestedCompetences } from './mocks';

async function mockEducationHistory(page: Page, data = educationHistory) {
  await mockProfileWizard(page, 'koulutuskokonaisuudet', data);
}

test('add new education', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockEducationHistory(page, []);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/koulutukseni');

  // Open wizard
  await page.getByRole('button', { name: 'Lisää uusi koulutus' }).click();

  // "Lisää uusi koulutus"
  await page.getByLabel('Oppilaitos tai koulutuksen järjestäjä').fill('Iso Opisto');
  await page.getByLabel('Tutkinnon tai koulutuksen nimi').fill('Oppilas');
  await page.getByLabel('Alkoi').fill('01.01.2001');

  await page.keyboard.press('Tab');
  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Tunnista osaamisia" step
  await mockSuggestedCompetences(page, suggestedEducationCompetences, educationCompetences);
  await mockSelectedCompetences(page, educationCompetences);
  await page.getByLabel('Tunnista osaamisia').fill('opetus');

  await page.getByRole('button', { name: 'opetussuunnitelman tavoitteet' }).click();
  await page.getByRole('button', { name: 'arviointiprosessit' }).click();
  await page.getByRole('button', { name: 'kehittää opetusohjelma' }).click();

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Yhteenveto" step
  await expect(page.getByText('Iso Opisto')).toBeVisible();
  await expect(page.getByText('Oppilas')).toBeVisible();
  await expect(page.getByText('3 osaamista')).toHaveCount(2);

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/koulutuskokonaisuudet') && request.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload).toEqual(educationHistoryItem);
});

test('delete educationHistory item', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockEducationHistory(page);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/koulutukseni');

  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista koulutus' }).click();

  const deleteRequestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/koulutuskokonaisuudet') && request.method() === 'DELETE',
  );
  await page.getByRole('button', { name: 'Poista koulutus' }).click();
  const request = await deleteRequestPromise;
  const expectedId = educationHistory[0].id;
  expect(request.url()).toContain('/api/profiili/koulutuskokonaisuudet/');
  expect(request.url()).toContain(expectedId);
});

test('edit educationHistory item', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockEducationHistory(page);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/koulutukseni');

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
