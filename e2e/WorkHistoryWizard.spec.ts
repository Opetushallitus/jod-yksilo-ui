import { expect, Page, test } from '@playwright/test';
import { competences, suggestedCompetences, userProfile, workHistory, workHistoryItem } from './fixtures';

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
      body: JSON.stringify(suggestedCompetences),
    });
  });

  await page.route('**/api/osaamiset', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(competences),
    });
  });
}

async function mockWorkHistory(page: Page, data = workHistory) {
  await page.route('**/api/profiili/tyopaikat', async (route) => {
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

    const selectedCompetences = competences.sisalto.filter((comp) => uris.includes(comp.uri));

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

test('has title', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockWorkHistory(page, []);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/tyopaikkani');
  await expect(page).toHaveTitle(/Työpaikkani/);
});

test('add new workhistory', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockWorkHistory(page, []);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/tyopaikkani');
  await expect(page).toHaveTitle(/Työpaikkani/);

  // Open wizard
  await page.getByRole('button', { name: 'Lisää uusi työpaikka' }).click();

  // "Lisää uusi työpaikka" step
  await expect(page.getByRole('heading', { name: 'Lisää uusi työpaikka' })).toBeVisible();
  await page.getByLabel('Työnantaja').fill('Testi Oy');
  await page.getByLabel('Toimenkuva').fill('Testaaja');
  await page.getByLabel('Alkoi').fill('01.01.2001');

  // Validation checks are triggering after pressing Tab multiple times to get away
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Tunnista osaamisia" step
  await mockSuggestedCompetences(page);
  await mockSelectedCompetences(page);
  await expect(page.getByRole('heading', { name: 'Tunnista osaamisia' })).toBeVisible();
  await page.getByLabel('Tunnista osaamisia').fill('kissa');

  await page.getByRole('button', { name: 'arvioida eläinten käyttäytymistä' }).click();
  await page.getByRole('button', { name: 'eläinten anatomia' }).click();
  await page.getByRole('button', { name: 'tarjota eläimille virikkeellinen ympäristö' }).click();

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Yhteenveto" step
  await expect(page.getByRole('heading', { name: 'Yhteenveto' })).toBeVisible();
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
  await expect(page).toHaveTitle(/Työpaikkani/);

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
  await expect(page).toHaveTitle(/Työpaikkani/);

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
