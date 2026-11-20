import { freetimeActivities, freetimeActivityItem } from './data';
import { confirmDeletion, expect, test } from './fixtures';

test.beforeEach(async ({ backend }) => {
  backend.signIn();
  backend.teemat = structuredClone(freetimeActivities);
});

test('add new freetime activity', async ({ page, isMobile, open, backend }) => {
  backend.teemat = [];
  await open('osaamisprofiili/osaamiset/vapaa-ajan-toiminnot');
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

  await page.getByRole('button', { name: 'uida' }).first().click();
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

test('add new freetime activity without a start date', async ({ page, open, backend }) => {
  backend.teemat = [];
  await open('osaamisprofiili/osaamiset/vapaa-ajan-toiminnot');
  await page.getByRole('button', { name: 'Lisää uusi vapaa-ajan teema' }).click();
  await page.getByLabel('Vapaa-ajan teeman nimi').fill('Testaaminen');
  await page.getByLabel('Vapaa-ajan toiminnon nimi').fill('Uima-altaan testaus');
  await page.getByLabel('Loppui').fill('30.07.2001');
  await page.keyboard.press('Tab');
  await page.locator('button[aria-label*="Seuraava"]').click();
  await page.locator('button[aria-label*="Seuraava"]').click();
  await expect(page.getByTestId('free-time-summary-table')).toContainText('7/2001');

  const requestPromise = page.waitForRequest(
    (request) => request.url().includes('/api/profiili/vapaa-ajan-teemat') && request.method() === 'POST',
  );
  await page.getByRole('button', { name: 'Tallenna' }).click();
  const request = await requestPromise;
  expect(request.postDataJSON().toiminnot[0]).not.toHaveProperty('alkuPvm');
  expect(request.postDataJSON().toiminnot[0].loppuPvm).toBe('2001-07-30');
});

test('delete freetime activity item', async ({ page, open }) => {
  await open('osaamisprofiili/osaamiset/vapaa-ajan-toiminnot');
  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista teema' }).click();
  const confirmButton = confirmDeletion(page);
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

test('edit freetime activity item', async ({ page, open }) => {
  await open('osaamisprofiili/osaamiset/vapaa-ajan-toiminnot');
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

test('edit a free time activity', async ({ page, open, backend }) => {
  await open('osaamisprofiili/osaamiset/vapaa-ajan-toiminnot');

  // The first edit button is for the theme, the second for its activity.
  await page.getByRole('button', { name: 'Muokkaa' }).nth(1).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('Muokkaa vapaa-ajan toimintoa');
  await dialog.getByRole('textbox', { name: 'Vapaa-ajan toiminnon nimi (pakollinen)' }).fill('Uimahypyt');
  await dialog.getByRole('textbox', { name: 'Vapaa-ajan toiminnon nimi (pakollinen)' }).blur();
  await dialog.getByRole('button', { name: 'Seuraava' }).click();
  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('table', { name: 'Vapaa-ajan toiminnot' }).getByRole('cell', { name: 'Uimahypyt' }),
  ).toBeVisible();
  expect(backend.teemat[0].toiminnot?.[0]).toMatchObject({ nimi: { fi: 'Uimahypyt' } });
});

test('add an activity to an existing theme', async ({ page, open, backend }) => {
  await open('osaamisprofiili/osaamiset/vapaa-ajan-toiminnot');

  await page.getByRole('button', { name: 'Lisää uusi toiminto' }).click();
  // The title of the dialog changes on each step.
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('Lisää uusi toiminto');
  const name = dialog.getByRole('textbox', { name: 'Vapaa-ajan toiminnon nimi (pakollinen)' });
  await name.fill('Hengenpelastus');
  await name.blur();
  await dialog.getByRole('button', { name: 'Seuraava' }).click();
  await dialog.getByRole('textbox', { name: 'Tunnista osaamisia' }).fill('uida');
  await dialog.getByRole('button', { name: 'uida' }).first().click();
  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('table', { name: 'Vapaa-ajan toiminnot' }).getByRole('cell', { name: 'Hengenpelastus' }),
  ).toBeVisible();
  expect(backend.teemat[0].toiminnot).toEqual([
    expect.objectContaining({ nimi: { fi: 'Uima-altaan testaus' } }),
    expect.objectContaining({ nimi: { fi: 'Hengenpelastus' }, osaamiset: [expect.any(String)] }),
  ]);
});

test('deleting an activity keeps the other activities of the theme', async ({ page, open, backend }) => {
  backend.teemat[0].toiminnot?.push({
    id: 'f873c947-9531-4249-9c4c-fd57faec6d93',
    nimi: { fi: 'Hengenpelastus' },
    alkuPvm: '2025-08-01',
    osaamiset: ['http://data.europa.eu/esco/skill/9926889a-7074-4e37-acce-1271fe6c5a6f'],
  });
  await open('osaamisprofiili/osaamiset/vapaa-ajan-toiminnot');
  const table = page.getByRole('table', { name: 'Vapaa-ajan toiminnot' });
  await expect(table.getByRole('cell', { name: 'Hengenpelastus' })).toBeVisible();

  await table.getByRole('row').filter({ hasText: 'Hengenpelastus' }).getByRole('button', { name: 'Muokkaa' }).click();
  const dialog = page.getByRole('dialog', { name: 'Muokkaa vapaa-ajan toimintoa' });
  await dialog.getByRole('button', { name: 'Poista' }).click();
  await confirmDeletion(page).click();

  await expect(table.getByRole('cell', { name: 'Hengenpelastus' })).toBeHidden();
  await expect(table.getByRole('cell', { name: 'Uima-altaan testaus' })).toBeVisible();
  expect(backend.teemat).toHaveLength(1);
  expect(backend.teemat[0].toiminnot).toEqual([expect.objectContaining({ nimi: { fi: 'Uima-altaan testaus' } })]);
});
