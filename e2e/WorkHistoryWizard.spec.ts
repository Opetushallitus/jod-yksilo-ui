import { expect, Page, test } from '@playwright/test';
import { competences, suggestedCompetences, workHistory, workHistoryItem } from './fixtures';
import { mockAuthenticatedUser, mockProfileWizard, mockSelectedCompetences, mockSuggestedCompetences } from './mocks';

async function mockWorkHistory(page: Page, data = workHistory) {
  await mockProfileWizard(page, 'tyopaikat', data);
}

test('add new workhistory', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockWorkHistory(page, []);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/tyopaikkani');

  // Open wizard
  await page.getByRole('button', { name: 'Lisää uusi työpaikka' }).click();

  // "Lisää uusi työpaikka" step
  await page.getByLabel('Työnantaja').fill('Testi Oy');
  await page.getByLabel('Toimenkuva').fill('Testaaja');
  await page.getByLabel('Alkoi').fill('01.01.2001');

  await page.keyboard.press('Tab');

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Tunnista osaamisia" step
  await mockSuggestedCompetences(page, suggestedCompetences, competences);
  await mockSelectedCompetences(page, competences);
  await page.getByLabel('Tunnista osaamisia').fill('kissa');

  await page.getByRole('button', { name: 'arvioida eläinten käyttäytymistä' }).click();
  await page.getByRole('button', { name: 'eläinten anatomia' }).click();
  await page.getByRole('button', { name: 'tarjota eläimille virikkeellinen ympäristö' }).click();

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Yhteenveto" step
  await expect(page.getByText('Testi Oy')).toBeVisible();
  await expect(page.getByText('Testaaja')).toBeVisible();
  await expect(page.getByText('3 osaamista')).toHaveCount(2);

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/tyopaikat') && request.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload).toEqual(workHistoryItem);
});

test('delete workhistory item', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockWorkHistory(page);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/tyopaikkani');

  // Edit the first work history item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista työpaikka' }).click();

  const deleteRequestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/tyopaikat') && request.method() === 'DELETE',
  );
  await page.getByRole('button', { name: 'Poista työpaikka' }).click();
  const request = await deleteRequestPromise;
  const expectedId = workHistory[0].id;
  expect(request.url()).toContain('/api/profiili/tyopaikat/');
  expect(request.url()).toContain(expectedId);
});

test('edit workhistory item', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockWorkHistory(page);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/tyopaikkani');

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
