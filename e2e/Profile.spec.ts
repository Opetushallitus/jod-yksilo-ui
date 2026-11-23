import { workHistory } from './data';
import { confirmDeletion, expect, test } from './fixtures';

const HUVIPUISTO = 'http://data.europa.eu/esco/skill/e2e-huvipuisto';

test.beforeEach(({ backend }) => {
  backend.signIn();
  backend.tyopaikat = structuredClone(workHistory);
  backend.muuOsaaminen = { muuOsaaminen: [HUVIPUISTO] };
});

test('profile front page summarizes the profile', async ({ page, open }) => {
  await open('osaamisprofiili/etusivu');

  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { level: 1, name: 'Hei Testi - tervetuloa osaamisprofiiliisi' }),
  ).toBeVisible();
  const breadcrumb = page.getByRole('navigation', { name: 'Murupolku' });
  await expect(breadcrumb.getByRole('link', { name: 'Oma Osaamispolku' })).toHaveAttribute('href', '/yksilo/fi');
  // One work place with three competences, and one other competence.
  await expect(main.getByRole('listitem').filter({ has: page.getByRole('link', { name: 'Työpaikat' }) })).toContainText(
    '(1)',
  );
  await expect(main.getByRole('link', { name: 'Lisätyt osaamiset 4' })).toHaveAttribute(
    'href',
    '/yksilo/fi/osaamisprofiili/osaamiset',
  );
  await expect(main.getByRole('link', { name: 'Löydä mahdollisuuksia' }).first()).toHaveAttribute(
    'href',
    '/yksilo/fi/tyokalu',
  );
  await expect(main.getByRole('link', { name: 'Asetukset' })).toHaveAttribute(
    'href',
    '/yksilo/fi/osaamisprofiili/asetukset',
  );
});

test('competences page groups the competences by their source', async ({ page, open }) => {
  await open('osaamisprofiili/osaamiset');

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1, name: 'Osaamiset' })).toBeVisible();
  await expect(main.getByRole('button', { name: 'Työpaikoista kertynyt osaaminen (3)' })).toBeVisible();
  await expect(main.getByRole('button', { name: /^eläinten anatomia/ })).toBeVisible();
  await expect(main.getByRole('button', { name: 'Koulutuksesta kertynyt osaaminen (0)' })).toBeVisible();
  await expect(main.getByRole('button', { name: 'Muu osaaminen (1)' })).toBeVisible();
  await expect(main.getByRole('link', { name: 'Siirry muihin osaamisiin' })).toHaveAttribute(
    'href',
    '/yksilo/fi/osaamisprofiili/osaamiset/muu-osaaminen',
  );
});

test('user changes the email address and the consents in the settings', async ({ page, open, backend }) => {
  await open('osaamisprofiili/asetukset');
  const main = page.getByRole('main');

  await main.getByRole('textbox', { name: 'Sähköpostiosoite' }).fill('uusi@example.com');
  await expect.poll(() => backend.tiedot.email).toBe('uusi@example.com');

  await main.getByRole('switch', { name: /^Lupa käyttää henkilötietojani palvelussa toteutettujen tekoäly/ }).click();
  await expect.poll(() => backend.tiedot.lupaKayttaaTekoalynKoulutukseen).toBe(true);
});

test('user downloads the profile data', async ({ page, open, backend }) => {
  await open('osaamisprofiili/asetukset');

  await page.getByRole('main').getByRole('link', { name: 'Lataa osaamisprofiilin tiedot (JSON)' }).click();

  // WebKit does not report the download, so the request is checked from the backend.
  await expect.poll(() => backend.exportCount).toBe(1);
});

test('user deletes the profile and the next login starts from the beginning', async ({ page, open, backend }) => {
  await open('osaamisprofiili/asetukset');

  await page.getByRole('main').getByRole('button', { name: 'Poista osaamisprofiili' }).click();
  await confirmDeletion(page).click();

  await expect(page.getByTestId('app-header').getByRole('link', { name: 'Kirjaudu' })).toBeVisible();
  expect(backend.logoutRequests).toEqual([expect.objectContaining({ deletion: 'true' })]);
  expect(backend.tyopaikat).toEqual([]);

  await page.goto('/yksilo/fi/kirjaudu-sisaan');
  await page.getByRole('main').getByRole('link', { name: 'Tunnistaudu' }).click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Tervetuloa luomaan osaamisprofiilisi!' }),
  ).toBeVisible();
});
