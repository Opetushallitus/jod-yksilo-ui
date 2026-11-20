import { expect, test } from './fixtures';

test('anonymous user sees the front page with links to the tool and the login', async ({ page, open, isMobile }) => {
  await open();

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1, name: 'Oma Osaamispolku' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Löydä mahdollisuuksia' })).toHaveAttribute('href', '/yksilo/fi/tyokalu');
  await expect(main.getByRole('link', { name: 'Luo oma osaamisprofiili' })).toHaveAttribute(
    'href',
    '/yksilo/fi/kirjaudu-sisaan',
  );
  const header = page.getByTestId('app-header');
  await expect(header.getByRole('link', { name: 'Kirjaudu' })).toBeVisible();
  if (!isMobile) {
    // On narrow screens the search is opened from a button, see Search.spec.ts.
    await expect(header.getByRole('searchbox', { name: 'Hae mahdollisuuksia' })).toBeVisible();
  }
});

test('signed-in user is linked to the profile from the front page', async ({ page, open, backend }) => {
  backend.signIn();
  await open();

  await expect(page.getByRole('main').getByRole('link', { name: 'Siirry profiiliin' })).toHaveAttribute(
    'href',
    '/yksilo/fi/osaamisprofiili',
  );
});

test('main menu links to the sections, and profile pages require a login', async ({ page, open }) => {
  await open();

  await page.getByTestId('open-nav-menu').click();
  const menu = page.getByRole('navigation', { name: 'Päänavigaatio' });
  await expect(menu.getByRole('link', { name: /^Osaamispolun etusivu/ })).toHaveAttribute('href', '/fi');
  await expect(menu.getByRole('link', { name: 'Oma Osaamispolku' })).toHaveAttribute('href', '/yksilo/fi');
  await expect(menu.getByRole('link', { name: 'Löydä mahdollisuuksia' })).toHaveAttribute('href', '/yksilo/fi/tyokalu');
  await expect(menu.getByRole('link', { name: /^Ohjaajan osio/ })).toHaveAttribute('href', '/ohjaaja/fi');
  await expect(menu.getByRole('link', { name: /^Tietopalvelu/ })).toHaveAttribute('href', '/tietopalvelu/fi');
  await expect(menu.getByRole('link', { name: /^Ohjaus- ja neuvontapalveluja/ })).toHaveAttribute(
    'href',
    'https://www.suomi.fi/aihe/ohjaus-ja-neuvontapalveluja',
  );

  await menu.getByRole('button', { name: 'Avaa alivalikko' }).click();
  for (const name of [
    'Osaamisprofiili',
    'Osaamiset',
    'Kiinnostukset',
    'Suosikit',
    'Tavoitteet',
    'Tuo ja vie tietoja',
    'Asetukset',
  ]) {
    await expect(menu.getByRole('link', { name, exact: true })).toHaveAttribute('href', '/yksilo/fi/kirjaudu-sisaan');
  }

  await menu.getByRole('button', { name: 'Sulje valikko' }).click();
  await expect(menu).toBeHidden();
});

test('main menu links to the profile pages when signed in', async ({ page, open, backend }) => {
  backend.signIn();
  await open();

  await page.getByTestId('open-nav-menu').click();
  const menu = page.getByRole('navigation', { name: 'Päänavigaatio' });
  await expect(menu.getByRole('link', { name: 'Osaamisprofiili', exact: true })).toHaveAttribute(
    'href',
    '/yksilo/fi/osaamisprofiili/etusivu',
  );
});

test('user changes the language from the header', async ({ page, open }) => {
  await open();

  await page.getByTestId('language-button-trigger').click();
  await page.getByRole('link', { name: 'På svenska' }).click();
  await expect(page).toHaveURL('/yksilo/sv');
  await expect(page.getByRole('main').getByRole('heading', { level: 1, name: 'Min kompetensstig' })).toBeVisible();

  await page.getByTestId('language-button-trigger').click();
  await page.getByRole('link', { name: 'In English' }).click();
  await expect(page).toHaveURL('/yksilo/en');
  await expect(page.getByRole('main').getByRole('heading', { level: 1, name: 'My Competency Path' })).toBeVisible();
});

test('unsupported language redirects to Finnish', async ({ page, open }) => {
  await open();

  await page.goto('/yksilo/de');

  await expect(page).toHaveURL('/yksilo/fi');
});

test('profile pages redirect an anonymous user to the front page', async ({ page, open }) => {
  await open('osaamisprofiili/suosikit');

  await expect(page).toHaveURL('/yksilo/fi');
});
