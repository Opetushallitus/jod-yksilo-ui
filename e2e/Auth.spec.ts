import { expect, test } from './fixtures';

// The real Suomi.fi login is covered by the smoke tests against the test environment.
// Here the backend's login and logout endpoints are faked, so only the UI's part of the flow is tested.

test('returning user logs in and lands on the profile front page', async ({ page, open, backend }) => {
  backend.tiedot = { tervetuloapolku: true };
  await open();

  await page.getByTestId('app-header').getByRole('link', { name: 'Kirjaudu' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Luo oma osaamisprofiilisi!' })).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Tunnistaudu' }).click();

  await expect(page).toHaveURL('/yksilo/fi/osaamisprofiili/etusivu');
  await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toContainText('Testi');
  await expect(page.getByRole('dialog')).toBeHidden();
  expect(backend.loginRequests).toHaveLength(1);
  expect(backend.loginRequests[0].searchParams.get('lang')).toBe('fi');
});

test('first login goes through the welcome path', async ({ page, open, backend }) => {
  backend.tiedot = { tervetuloapolku: false, syntymavuosi: 1990, kotikunta: '091', sukupuoli: 'NAINEN' };
  await open('kirjaudu-sisaan');

  await page.getByRole('main').getByRole('link', { name: 'Tunnistaudu' }).click();

  await expect(page).toHaveURL('/yksilo/fi/osaamisprofiili/etusivu');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Tervetuloa luomaan osaamisprofiilisi!' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Seuraava' }).click();

  await expect(dialog.getByRole('heading', { name: 'Tarkista tietosi' })).toBeVisible();
  await expect(dialog.getByText('Helsinki', { exact: true }).first()).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Seuraava' })).toBeDisabled();
  // The user chooses not to share the gender.
  await dialog.getByRole('switch', { name: 'Sukupuoli' }).click();
  const email = dialog.getByRole('textbox', { name: 'Sähköpostiosoite' });
  await email.fill('testi@example.com');
  // The form is validated when the field loses focus.
  await email.blur();
  await dialog.getByRole('button', { name: 'Seuraava' }).click();

  await dialog.getByRole('button').last().click();

  await expect(dialog).toBeHidden();
  expect(backend.tiedot).toMatchObject({
    tervetuloapolku: true,
    email: 'testi@example.com',
    syntymavuosi: 1990,
    kotikunta: '091',
  });
  expect(backend.tiedot.sukupuoli).toBeUndefined();
});

test('user logs out from the user menu', async ({ page, open, backend }) => {
  backend.signIn();
  await open();
  const header = page.getByTestId('app-header');

  await header.getByRole('button', { name: 'Testi' }).click();
  await header.getByRole('button', { name: 'Kirjaudu ulos' }).click();

  await expect(header.getByRole('link', { name: 'Kirjaudu' })).toBeVisible();
  await expect(page).toHaveURL('/yksilo/fi');
  expect(backend.logoutRequests).toEqual([{ _csrf: 'test-csrf-token', lang: 'fi' }]);
});

test('user menu links to the profile', async ({ page, open, backend }) => {
  backend.signIn();
  await open();
  const header = page.getByTestId('app-header');

  await header.getByRole('button', { name: 'Testi' }).click();
  await header.getByRole('link', { name: 'Osaamisprofiili' }).click();

  await expect(page).toHaveURL('/yksilo/fi/osaamisprofiili/etusivu');
});
