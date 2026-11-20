import { workHistory, workHistoryItem } from './data';
import { confirmDeletion, expect, test } from './fixtures';

test.beforeEach(async ({ backend }) => {
  backend.signIn();
  backend.tyopaikat = structuredClone(workHistory);
});

test('add new workhistory', async ({ page, isMobile, open, backend }) => {
  backend.tyopaikat = [];
  await open('osaamisprofiili/osaamiset/tyopaikat');
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

test('delete workhistory item', async ({ page, open }) => {
  await open('osaamisprofiili/osaamiset/tyopaikat');
  // Edit the first work history item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista työpaikka' }).click();
  const confirmButton = confirmDeletion(page);
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

test('edit workhistory item', async ({ page, open }) => {
  await open('osaamisprofiili/osaamiset/tyopaikat');
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

test('add a job title to an existing work place', async ({ page, open, backend }) => {
  await open('osaamisprofiili/osaamiset/tyopaikat');

  await page.getByRole('button', { name: 'Lisää uusi toimenkuva' }).click();
  // The title of the dialog changes on each step.
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('Lisää uusi toimenkuva');
  await dialog.getByRole('textbox', { name: 'Toimenkuva (pakollinen)' }).fill('Tiiminvetäjä');
  await dialog.getByRole('textbox', { name: 'Alkoi (pakollinen)' }).fill('01.02.2005');
  await dialog.getByRole('textbox', { name: 'Alkoi (pakollinen)' }).blur();
  await dialog.getByRole('button', { name: 'Seuraava' }).click();
  await dialog.getByRole('textbox', { name: 'Tunnista osaamisia' }).fill('kissa');
  await dialog.getByRole('button', { name: 'eläinten anatomia' }).click();
  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('table', { name: 'Työpaikat' }).getByRole('cell', { name: 'Tiiminvetäjä' }),
  ).toBeVisible();
  expect(backend.tyopaikat[0].toimenkuvat).toEqual([
    expect.objectContaining({ nimi: { fi: 'Testaaja' } }),
    expect.objectContaining({
      nimi: { fi: 'Tiiminvetäjä' },
      alkuPvm: '2005-02-01',
      osaamiset: ['http://data.europa.eu/esco/skill/e286eddc-75e5-4ae3-966b-ec89c1c046ba'],
    }),
  ]);
});

test('edit a job title', async ({ page, open, backend }) => {
  await open('osaamisprofiili/osaamiset/tyopaikat');

  // The first edit button is for the work place, the second for its job title.
  await page.getByRole('button', { name: 'Muokkaa' }).nth(1).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('Muokkaa toimenkuvaa');
  await dialog.getByRole('textbox', { name: 'Toimenkuva (pakollinen)' }).fill('Testipäällikkö');
  await dialog.getByRole('textbox', { name: 'Loppui' }).fill('31.12.2010');
  await dialog.getByRole('textbox', { name: 'Loppui' }).blur();
  await dialog.getByRole('button', { name: 'Seuraava' }).click();
  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('table', { name: 'Työpaikat' }).getByRole('cell', { name: 'Testipäällikkö' }),
  ).toBeVisible();
  expect(backend.tyopaikat[0].toimenkuvat?.[0]).toMatchObject({
    nimi: { fi: 'Testipäällikkö' },
    loppuPvm: '2010-12-31',
  });
});

test('deleting the only job title removes the work place', async ({ page, open, backend }) => {
  await open('osaamisprofiili/osaamiset/tyopaikat');

  await page.getByRole('button', { name: 'Muokkaa' }).nth(1).click();
  const dialog = page.getByRole('dialog', { name: 'Muokkaa toimenkuvaa' });
  await dialog.getByRole('button', { name: 'Poista' }).click();
  await confirmDeletion(page).click();

  await expect(page.getByRole('table', { name: 'Työpaikat' })).toBeHidden();
  expect(backend.tyopaikat).toEqual([]);
});
