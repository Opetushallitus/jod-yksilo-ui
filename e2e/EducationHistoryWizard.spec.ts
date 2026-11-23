import { educationHistory, educationHistoryItem } from './data';
import { confirmDeletion, expect, test } from './fixtures';

test.beforeEach(async ({ backend }) => {
  backend.signIn();
  backend.koulutuskokonaisuudet = structuredClone(educationHistory);
});

test('add new education', async ({ page, isMobile, open, backend }) => {
  backend.koulutuskokonaisuudet = [];
  await open('osaamisprofiili/osaamiset/koulutukset');
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

test('delete educationHistory item', async ({ page, open }) => {
  await open('osaamisprofiili/osaamiset/koulutukset');
  // Edit the first item
  await page.getByRole('button', { name: 'Muokkaa' }).first().click();
  await page.getByRole('button', { name: 'Poista koulutus' }).click();
  const confirmButton = confirmDeletion(page);
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

test('edit educationHistory item', async ({ page, open }) => {
  await open('osaamisprofiili/osaamiset/koulutukset');
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

test('add a degree to an existing education', async ({ page, open, backend }) => {
  await open('osaamisprofiili/osaamiset/koulutukset');

  await page.getByRole('button', { name: 'Lisää opintoja tähän koulutukseen' }).click();
  // The title of the dialog changes on each step.
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: /^Tutkinnon tai koulutuksen nimi/ }).fill('Jatko-opinnot');
  await dialog.getByRole('textbox', { name: /^Tutkinnon tai koulutuksen nimi/ }).blur();
  await dialog.getByRole('button', { name: 'Seuraava' }).click();
  await dialog.getByRole('textbox', { name: 'Tunnista osaamisia' }).fill('opetus');
  await dialog.getByRole('button', { name: 'arviointiprosessit' }).click();
  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('table', { name: 'Koulutukset' }).getByRole('cell', { name: 'Jatko-opinnot' }),
  ).toBeVisible();
  expect(backend.koulutuskokonaisuudet[0].koulutukset).toEqual([
    expect.objectContaining({ nimi: { fi: 'Oppilas' } }),
    expect.objectContaining({
      nimi: { fi: 'Jatko-opinnot' },
      osaamiset: ['http://data.europa.eu/esco/skill/31b67516-af16-4b97-8430-a8a8e0f84190'],
    }),
  ]);
});

test('edit a degree', async ({ page, open, backend }) => {
  await open('osaamisprofiili/osaamiset/koulutukset');

  // The first edit button is for the education, the second for its degree.
  await page.getByRole('button', { name: 'Muokkaa' }).nth(1).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveAccessibleName('Muokkaa tutkintoa tai koulutusta');
  const name = dialog.getByRole('textbox', { name: /^Tutkinnon tai koulutuksen nimi/ });
  await name.fill('Opiskelija');
  await name.blur();
  await dialog.getByRole('button', { name: 'Seuraava' }).click();
  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('table', { name: 'Koulutukset' }).getByRole('cell', { name: 'Opiskelija' }),
  ).toBeVisible();
  expect(backend.koulutuskokonaisuudet[0].koulutukset?.[0]).toMatchObject({ nimi: { fi: 'Opiskelija' } });
});

test('deleting a degree keeps the other degrees of the education', async ({ page, open, backend }) => {
  backend.koulutuskokonaisuudet[0].koulutukset?.push({
    id: 'dc6d5886-6326-4b80-84d1-a135491136fd',
    nimi: { fi: 'Jatko-opinnot' },
    alkuPvm: '2005-01-01',
    osaamiset: ['http://data.europa.eu/esco/skill/31b67516-af16-4b97-8430-a8a8e0f84190'],
  });
  await open('osaamisprofiili/osaamiset/koulutukset');
  const table = page.getByRole('table', { name: 'Koulutukset' });
  await expect(table.getByRole('cell', { name: 'Jatko-opinnot' })).toBeVisible();

  await table.getByRole('row').filter({ hasText: 'Jatko-opinnot' }).getByRole('button', { name: 'Muokkaa' }).click();
  const dialog = page.getByRole('dialog', { name: 'Muokkaa tutkintoa tai koulutusta' });
  await dialog.getByRole('button', { name: 'Poista' }).click();
  await confirmDeletion(page).click();

  await expect(table.getByRole('cell', { name: 'Jatko-opinnot' })).toBeHidden();
  await expect(table.getByRole('cell', { name: 'Oppilas' })).toBeVisible();
  expect(backend.koulutuskokonaisuudet).toHaveLength(1);
  expect(backend.koulutuskokonaisuudet[0].koulutukset).toEqual([expect.objectContaining({ nimi: { fi: 'Oppilas' } })]);
});
