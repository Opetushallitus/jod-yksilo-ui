import { expect, Page, test } from '@playwright/test';
import {
  educationCompetences,
  educationHistory,
  educationHistoryItem,
  suggestedEducationCompetences,
  userProfile,
} from './fixtures';

async function mockAuthenticatedUser(page: Page) {
  await page.route('**/api/profiili/yksilo', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(userProfile),
    });
  });
}

async function mockSuggestedCompetences(page: Page) {
  await page.route('**/api/ehdotus/osaamiset', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(suggestedEducationCompetences),
    });
  });

  await page.route('**/api/osaamiset', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(educationCompetences),
    });
  });
}

async function mockEducationHistory(page: Page, data = educationHistory) {
  await page.route('**/api/profiili/koulutuskokonaisuudet', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else if (method === 'DELETE') {
      await route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: '',
      });
    }
  });
}

async function mockSelectedCompetences(page: Page) {
  await page.route('**/api/osaamiset?uri=**', async (route) => {
    const url = new URL(route.request().url());
    const uris = url.searchParams.getAll('uri');

    const selectedCompetences = educationCompetences.sisalto.filter((comp) => uris.includes(comp.uri));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sisalto: selectedCompetences,
        maara: selectedCompetences.length,
        sivuja: 1,
      }),
    });
  });
}

async function mockEducationHistoryItem(page: Page) {
  await page.route(`**/api/profiili/koulutuskokonaisuudet/${educationHistory[0].id}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(educationHistory[0]),
    });
  });
}

test('has title', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockEducationHistory(page, []);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/koulutukseni');
  await expect(page).toHaveTitle(/Koulutukseni/);
});

test('add new education', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockEducationHistory(page, []);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/koulutukseni');
  await expect(page).toHaveTitle(/Koulutukseni/);

  // Open wizard
  await page.getByRole('button', { name: 'Lisää uusi koulutus' }).click();

  // "Lisää uusi koulutus"
  await expect(page.getByRole('heading', { name: 'Lisää uusi koulutus' })).toBeVisible();
  await page.getByLabel('Oppilaitos tai koulutuksen järjestäjä').fill('Iso Opisto');
  await page.getByLabel('Tutkinnon tai koulutuksen nimi').fill('Oppilas');
  await page.getByLabel('Alkoi').fill('01.01.2001');

  await page.keyboard.press('Tab');
  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Tunnista osaamisia" step
  await mockSuggestedCompetences(page);
  await mockSelectedCompetences(page);
  await expect(page.getByRole('heading', { name: 'Tunnista osaamisia' })).toBeVisible();
  await page.getByLabel('Tunnista osaamisia').fill('opetus');

  await page.getByRole('button', { name: 'opetussuunnitelman tavoitteet' }).click();
  await page.getByRole('button', { name: 'arviointiprosessit' }).click();
  await page.getByRole('button', { name: 'kehittää opetusohjelma' }).click();

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Yhteenveto" step
  await expect(page.getByRole('heading', { name: 'Yhteenveto' })).toBeVisible();
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
  await mockEducationHistoryItem(page);

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
  await mockEducationHistoryItem(page);

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
