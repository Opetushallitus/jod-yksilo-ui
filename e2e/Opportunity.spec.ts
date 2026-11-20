import { confirmDeletion, expect, test } from './fixtures';

const LAITETYONTEKIJA = 'a0000000-0000-4000-8000-000000000001';
const VARTIJAN_KOULUTUS = 'b0000000-0000-4000-8000-000000000001';

test('anonymous user opens a job opportunity from the tool', async ({ page, open, isMobile }) => {
  await open('tyokalu');
  const main = page.getByRole('main');
  if (isMobile) {
    await main.getByRole('tab', { name: 'Sitten löydä mahdollisuutesi' }).click();
  }

  await main.getByRole('link', { name: 'Laitetyöntekijä' }).click();

  await expect(page).toHaveURL(`/yksilo/fi/tyomahdollisuus/${LAITETYONTEKIJA}`);
  await expect(main.getByRole('heading', { level: 1 })).toContainText('Laitetyöntekijä');
  const breadcrumb = page.getByRole('navigation', { name: 'Murupolku' });
  await expect(breadcrumb.getByRole('link', { name: 'Löydä mahdollisuuksia' })).toHaveAttribute(
    'href',
    '/yksilo/fi/tyokalu',
  );
  await expect(main.getByRole('table', { name: 'Painota osaamisia' })).toContainText(
    'valvoa huvipuiston turvallisuutta',
  );
  await expect(
    main.getByRole('heading', { level: 2, name: 'Ammattiryhmä — Muut muualla luokittelemattomat työntekijät' }),
  ).toBeVisible();
  await expect(main.getByRole('link', { name: /^Siirry Työmarkkinatoriin/ })).toHaveAttribute(
    'href',
    'https://tyomarkkinatori.fi/henkiloasiakkaat/avoimet-tyopaikat/?in=9629',
  );
  if (!isMobile) {
    const onThisPage = page.getByRole('complementary').getByRole('navigation');
    for (const section of ['Kuvaus', 'Osaamiset', 'Avoimet työpaikat', 'Samankaltaiset mahdollisuudet']) {
      await expect(onThisPage.getByRole('link', { name: section })).toHaveAttribute(
        'href',
        `/yksilo/fi/tyomahdollisuus/${LAITETYONTEKIJA}#${section}`,
      );
    }
  }
});

test('anonymous user is asked to log in to save a favorite', async ({ page, open }) => {
  await open(`tyomahdollisuus/${LAITETYONTEKIJA}`);

  await page.getByRole('main').getByRole('button', { name: 'Tallenna suosikiksi' }).first().click();

  const dialog = page.getByRole('dialog', { name: 'Kirjaudu' });
  await expect(dialog.getByRole('link', { name: 'Kirjaudu' })).toHaveAttribute('href', '/yksilo/fi/kirjaudu-sisaan');
  await dialog.getByRole('button', { name: 'Peruuta' }).click();
  await expect(dialog).toBeHidden();
});

test('education opportunity shows the duration, competences and open education offers', async ({
  page,
  open,
  isMobile,
}) => {
  await open(`koulutusmahdollisuus/${VARTIJAN_KOULUTUS}`);

  const main = page.getByRole('main');
  await expect(main.getByRole('heading', { level: 1 })).toContainText('Vartijan koulutus');
  await expect(main.getByText('Koulutuksen keskimääräinen kesto on 3 kuukautta.')).toBeVisible();
  await expect(main.getByRole('table', { name: 'Painota osaamisia' })).toContainText(
    'valvoa huvipuiston turvallisuutta',
  );
  // The offers come from Opintopolku.
  await expect(main.getByRole('link', { name: /^Vartijan peruskoulutus/ })).toHaveAttribute(
    'href',
    'https://opintopolku.fi/konfo/fi/koulutus/1.2.246.562.13.00000000000000000001',
  );
  await expect(main.getByText('7 opintopistettä')).toBeVisible();
  if (!isMobile) {
    const onThisPage = page.getByRole('complementary').getByRole('navigation');
    for (const section of ['Kuvaus', 'Kesto', 'Osaamiset', 'Avoimet koulutukset']) {
      await expect(onThisPage.getByRole('link', { name: section })).toBeVisible();
    }
  }
});

test('similar opportunities link to each other', async ({ page, open }) => {
  await open(`koulutusmahdollisuus/${VARTIJAN_KOULUTUS}`);
  const main = page.getByRole('main');

  await main
    .getByRole('tabpanel', { name: 'Työmahdollisuudet' })
    .getByRole('link', { name: 'Huvipuistonjohtaja' })
    .click();

  await expect(main.getByRole('heading', { level: 1 })).toContainText('Huvipuistonjohtaja');
});

test.describe('signed in', () => {
  test.beforeEach(({ backend }) => {
    backend.signIn();
  });

  test('user saves and removes a favorite on the opportunity page', async ({ page, open, backend }) => {
    await open(`tyomahdollisuus/${LAITETYONTEKIJA}`);
    const main = page.getByRole('main');

    await main.getByRole('button', { name: 'Tallenna suosikiksi' }).first().click();
    await expect(main.getByRole('button', { name: 'Poista suosikeista' }).first()).toBeVisible();
    expect(backend.suosikit).toEqual([
      expect.objectContaining({ kohdeId: LAITETYONTEKIJA, tyyppi: 'TYOMAHDOLLISUUS' }),
    ]);

    await main.getByRole('button', { name: 'Poista suosikeista' }).first().click();
    await confirmDeletion(page).click();

    await expect(page.getByText('Poisto onnistui')).toBeVisible();
    await expect(main.getByRole('button', { name: 'Tallenna suosikiksi' }).first()).toBeVisible();
    expect(backend.suosikit).toEqual([]);
  });

  test('user saves a favorite from the tool', async ({ page, open, backend, isMobile }) => {
    await open('tyokalu');
    const main = page.getByRole('main');
    if (isMobile) {
      await main.getByRole('tab', { name: 'Sitten löydä mahdollisuutesi' }).click();
    }
    const card = main.getByRole('listitem').filter({ has: page.getByRole('link', { name: 'Vartijan koulutus' }) });

    await card.getByRole('button', { name: 'Tallenna suosikiksi' }).click();

    await expect(card.getByRole('button', { name: 'Poista suosikeista' })).toBeVisible();
    expect(backend.suosikit).toEqual([
      expect.objectContaining({ kohdeId: VARTIJAN_KOULUTUS, tyyppi: 'KOULUTUSMAHDOLLISUUS' }),
    ]);
  });
});
