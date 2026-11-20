import { workHistory } from './data';
import { confirmDeletion, expect, test } from './fixtures';

test.beforeEach(({ backend }) => {
  backend.signIn();
  backend.tiedot = { tervetuloapolku: true, email: 'testi@example.com', syntymavuosi: 1990 };
  backend.tyopaikat = structuredClone(workHistory);
});

test('user shares the profile as a CV and the recipient sees only the shared data', async ({ page, open, backend }) => {
  await open('osaamisprofiili/tuo-ja-vie-tietoja');
  const main = page.getByRole('main');
  await expect(main.getByText('Ei jaettavia CV-linkkejä')).toBeVisible();

  await main.getByRole('button', { name: 'Luo uusi jaettava CV-linkki' }).click();
  const dialog = page.getByRole('dialog', { name: 'Luo jaettava CV-linkki' });
  await dialog.getByRole('textbox', { name: 'Linkin nimi' }).fill('Rekrytoijalle');
  await dialog.getByRole('button', { name: 'Seuraava' }).click();
  await dialog.getByRole('checkbox', { name: 'Nimi' }).click();
  await dialog.getByRole('checkbox', { name: 'Työpaikat' }).click();
  await dialog.getByRole('button', { name: 'Tallenna' }).click();
  await expect(dialog).toBeHidden();

  expect(backend.jakolinkit).toEqual([
    expect.objectContaining({
      nimi: 'Rekrytoijalle',
      nimiJaettu: true,
      emailJaettu: false,
      syntymavuosiJaettu: false,
      jaetutTyopaikat: [workHistory[0].id],
    }),
  ]);
  const token = backend.jakolinkit[0].ulkoinenId!;
  const preview = main.getByRole('link', { name: /^Esikatselu/ });
  await expect(preview).toHaveAttribute('href', new RegExp(`/yksilo/fi/cv\\?token=${token}$`));

  // The recipient does not need to log in.
  backend.user = null;
  await page.goto(`/yksilo/fi/cv?token=${token}`);
  const cv = page.getByRole('main');
  await expect(cv.getByText('Testi Yksilö').first()).toBeVisible();
  await expect(cv.getByText('Testi Oy').first()).toBeVisible();
  await expect(cv.getByText('testi@example.com')).toBeHidden();
  await expect(cv.getByText('1990')).toBeHidden();
});

test('user edits and deletes a share link', async ({ page, open, backend }) => {
  backend.jakolinkit = [
    {
      id: 'd0000000-0000-4000-8000-000000000001',
      ulkoinenId: 'd0000000-0000-4000-8000-000000000002',
      nimi: 'Rekrytoijalle',
      // A link can be valid for a year at most.
      voimassaAsti: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      nimiJaettu: true,
      jaetutTyopaikat: [],
    },
  ];
  await open('osaamisprofiili/tuo-ja-vie-tietoja');
  const main = page.getByRole('main');

  await main.getByRole('button', { name: 'Muokkaa' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Linkin nimi' }).fill('Uravalmentajalle');
  await dialog.getByRole('button', { name: 'Seuraava' }).click();
  await dialog.getByRole('checkbox', { name: 'Sähköposti' }).click();
  await dialog.getByRole('button', { name: 'Tallenna' }).click();
  await expect(dialog).toBeHidden();
  await expect(main.getByRole('button', { name: 'Uravalmentajalle' })).toBeVisible();
  expect(backend.jakolinkit[0]).toMatchObject({ nimi: 'Uravalmentajalle', nimiJaettu: true, emailJaettu: true });

  await main.getByRole('button', { name: 'Poista linkki' }).click();
  await confirmDeletion(page).click();

  await expect(main.getByText('Ei jaettavia CV-linkkejä')).toBeVisible();
  expect(backend.jakolinkit).toEqual([]);
});

test('an expired or unknown share link shows the not found page', async ({ page, open }) => {
  await open('cv?token=e0000000-0000-4000-8000-000000000000');

  await expect(page.getByRole('heading', { level: 1, name: 'Hups! Sivua ei löytynyt' })).toBeVisible();
});
