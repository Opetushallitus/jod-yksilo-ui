import { expect, Page, test } from '@playwright/test';
import {
  freetimeActivities,
  freetimeActivityItem,
  freetimeCompetences,
  suggestedFreetimeCompetences,
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
      body: JSON.stringify(suggestedFreetimeCompetences),
    });
  });

  await page.route('**/api/osaamiset', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(freetimeCompetences),
    });
  });
}

async function mockSelectedCompetences(page: Page) {
  await page.route('**/api/osaamiset?uri=**', async (route) => {
    const url = new URL(route.request().url());
    const uris = url.searchParams.getAll('uri');

    const selectedCompetences = freetimeCompetences.sisalto.filter((comp) => uris.includes(comp.uri));

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

async function mockFreetimeActivities(page: Page, data = freetimeActivities) {
  await page.route('**/api/profiili/vapaa-ajan-toiminnot', async (route) => {
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

async function mockFreetimeActivityItem(page: Page) {
  await page.route(`**/api/profiili/vapaa-ajan-toiminnot/${freetimeActivities[0].id}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(freetimeActivities[0]),
    });
  });
}

test('has title', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockFreetimeActivities(page, []);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/vapaa-ajan-toimintoni');
  await expect(page).toHaveTitle(/Vapaa-ajan toimintoni/);
});

test('add new freetime activity', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockFreetimeActivities(page, []);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/vapaa-ajan-toimintoni');

  // Open wizard
  await page.getByRole('button', { name: 'Lisää uusi vapaa-ajan toiminto' }).click();

  // "Lisää uusi vapaa-ajan toiminto"
  await expect(page.getByRole('heading', { name: 'Lisää uusi vapaa-ajan toiminto' })).toBeVisible();
  await page.getByLabel('Vapaa-ajan teeman nimi').fill('Testaaminen');
  await page.getByLabel('Vapaa-ajan toiminnon nimi').fill('Uima-altaan testaus');
  await page.getByLabel('Alkoi').fill('01.07.2001');
  await page.getByLabel('Loppui').fill('30.07.2001');

  await page.keyboard.press('Tab');
  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Tunnista osaamisia"
  await mockSuggestedCompetences(page);
  await mockSelectedCompetences(page);
  await expect(page.getByRole('heading', { name: 'Tunnista osaamisia' })).toBeVisible();
  await page.getByLabel('Tunnista osaamisia').fill('uida');

  await page.getByRole('button', { name: 'uida' }).click();
  await page.getByRole('button', { name: 'selviytyä merellä tilanteessa, jossa laiva joudutaan jättämään' }).click();
  await page.getByRole('button', { name: 'maailmanlaajuinen merihätä- ja turvallisuusjärjestelmä' }).click();

  await page.locator('button[aria-label*="Seuraava"]').click();

  // "Yhteenveto"
  await expect(page.getByRole('heading', { name: 'Yhteenveto' })).toBeVisible();
  await expect(page.getByText('Testaaminen')).toBeVisible();
  await expect(page.getByText('Uima-altaan testaus')).toBeVisible();
  await expect(page.getByText('3 osaamista')).toHaveCount(2);

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/vapaa-ajan-toiminnot') && request.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload).toEqual(freetimeActivityItem);
});

test('delete freetime activity item', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockFreetimeActivities(page);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/vapaa-ajan-toimintoni');
  await mockFreetimeActivityItem(page);

  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista vapaa-ajan toiminto' }).click();

  const deleteRequestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/vapaa-ajan-toiminnot') && request.method() === 'DELETE',
  );
  await page.getByRole('button', { name: 'Poista' }).click();
  const request = await deleteRequestPromise;
  const expectedId = freetimeActivities[0].id;
  expect(request.url()).toContain('/api/profiili/vapaa-ajan-toiminnot/');
  expect(request.url()).toContain(expectedId);
});

test('edit freetime activity item', async ({ page }) => {
  await mockAuthenticatedUser(page);
  await mockFreetimeActivities(page);
  await mockFreetimeActivityItem(page);

  await page.goto('/yksilo/fi/omat-sivuni/osaamiseni/vapaa-ajan-toimintoni');

  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();

  await page.getByLabel('Vapaa-ajan teeman nimi').fill('Testaus');

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/vapaa-ajan-toiminnot') && request.method() === 'PUT',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  const payload = JSON.parse(request.postData() || '{}');
  expect(payload.nimi.fi).toBe('Testaus');
});
