import type { Locator } from '@playwright/test';

import { confirmDeletion, expect, test } from './fixtures';

const HUVIPUISTO = 'http://data.europa.eu/esco/skill/e2e-huvipuisto';
const PELISAANNOT = 'http://data.europa.eu/esco/skill/e2e-pelisaannot';
const RAHOITUS = 'http://data.europa.eu/esco/skill/e2e-rahoitus';
const LAITETYONTEKIJA = 'a0000000-0000-4000-8000-000000000001';
const VARTIJAN_KOULUTUS = 'b0000000-0000-4000-8000-000000000001';

/** Adds a suggested competence in a dialog that recognizes competences from a text. */
const addSuggested = async (dialog: Locator, text: string, name: string) => {
  await dialog.getByRole('textbox').first().fill(text);
  await dialog
    .getByRole('list', { name: /^Ehdotetut/ })
    .getByRole('button', { name: new RegExp(`^${name}`) })
    .click();
  await expect(
    dialog.getByRole('list', { name: /^Valitut/ }).getByRole('button', { name: new RegExp(`^${name}`) }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('list', { name: /^Ehdotetut/ }).getByRole('button', { name: new RegExp(`^${name}`) }),
  ).toBeHidden();
};

/** Removes a selected competence in such a dialog. */
const removeSelected = async (dialog: Locator, name: string) => {
  const tag = dialog.getByRole('list', { name: /^Valitut/ }).getByRole('button', { name: new RegExp(`^${name}`) });
  // The list is re-rendered when a tag is added, so retry until the tag is really gone.
  await expect(async () => {
    if (await tag.isVisible()) {
      await tag.click({ timeout: 1000 });
    }
    await expect(tag).toBeHidden({ timeout: 1000 });
  }).toPass();
};

test.beforeEach(({ backend }) => {
  backend.signIn();
});

test('user adds and removes other competences', async ({ page, open, backend }) => {
  backend.muuOsaaminen = { muuOsaaminen: [HUVIPUISTO] };
  await open('osaamisprofiili/osaamiset/muu-osaaminen');
  const main = page.getByRole('main');

  await main.getByRole('button', { name: 'Muokkaa osaamisia' }).click();
  const dialog = page.getByRole('dialog', { name: 'Muokkaa osaamisia' });
  await addSuggested(dialog, 'raha', 'hallinnoida rahoitusta');
  await removeSelected(dialog, 'valvoa huvipuiston turvallisuutta');
  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  await expect(main.getByRole('button', { name: /^hallinnoida rahoitusta/ })).toBeVisible();
  await expect(main.getByRole('button', { name: /^valvoa huvipuiston/ })).toBeHidden();
  expect(backend.muuOsaaminen.muuOsaaminen).toEqual([RAHOITUS]);
});

test('cancelling the edit keeps the other competences', async ({ page, open, backend }) => {
  backend.muuOsaaminen = { muuOsaaminen: [HUVIPUISTO] };
  await open('osaamisprofiili/osaamiset/muu-osaaminen');

  await page.getByRole('main').getByRole('button', { name: 'Muokkaa osaamisia' }).click();
  const dialog = page.getByRole('dialog', { name: 'Muokkaa osaamisia' });
  await addSuggested(dialog, 'raha', 'pelisäännöt');
  await dialog.getByRole('button', { name: 'Peruuta' }).click();

  await expect(dialog).toBeHidden();
  expect(backend.muuOsaaminen.muuOsaaminen).toEqual([HUVIPUISTO]);
});

test('user describes the competences in own words', async ({ page, open, backend }) => {
  await open('osaamisprofiili/osaamiset');

  await page
    .getByRole('main')
    .getByRole('textbox', { name: 'Vapaamuotoinen kuvaus' })
    .fill('Osaan korjata polkupyöriä.');

  // The text is saved automatically.
  await expect.poll(() => backend.muuOsaaminen.vapaateksti).toEqual({ fi: 'Osaan korjata polkupyöriä.' });
});

test('user adds and removes interests', async ({ page, open, backend }) => {
  backend.kiinnostukset = { kiinnostukset: [PELISAANNOT] };
  await open('osaamisprofiili/kiinnostukset');
  const main = page.getByRole('main');

  await main.getByRole('button', { name: 'Muokkaa kiinnostuksia' }).click();
  const dialog = page.getByRole('dialog');
  await addSuggested(dialog, 'puisto', 'valvoa huvipuiston turvallisuutta');
  await removeSelected(dialog, 'pelisäännöt');
  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  await expect(main.getByRole('button', { name: /^valvoa huvipuiston turvallisuutta/ })).toBeVisible();
  expect(backend.kiinnostukset.kiinnostukset).toEqual([HUVIPUISTO]);

  await main.getByRole('textbox', { name: 'Vapaamuotoinen kuvaus' }).fill('Kiinnostaa luonto.');
  await expect.poll(() => backend.kiinnostukset.vapaateksti).toEqual({ fi: 'Kiinnostaa luonto.' });
});

test('favorites list the saved opportunities, which can be removed', async ({ page, open, backend }) => {
  backend.suosikit = [
    { id: 'f1', kohdeId: LAITETYONTEKIJA, tyyppi: 'TYOMAHDOLLISUUS' },
    { id: 'f2', kohdeId: VARTIJAN_KOULUTUS, tyyppi: 'KOULUTUSMAHDOLLISUUS' },
  ];
  await open('osaamisprofiili/suosikit');
  const main = page.getByRole('main');

  await expect(main.getByRole('link', { name: 'Laitetyöntekijä' })).toHaveAttribute(
    'href',
    `/yksilo/fi/tyomahdollisuus/${LAITETYONTEKIJA}?origin=favorites`,
  );
  await expect(main.getByRole('link', { name: 'Vartijan koulutus' })).toBeVisible();

  // The card is the innermost element that holds both the title and the button.
  const card = main
    .locator('div')
    .filter({ has: page.getByRole('link', { name: 'Laitetyöntekijä' }) })
    .filter({ has: page.getByRole('button', { name: 'Poista suosikeista' }) })
    .last();
  await card.getByRole('button', { name: 'Poista suosikeista' }).click();
  await confirmDeletion(page).click();

  await expect(main.getByRole('link', { name: 'Laitetyöntekijä' })).toBeHidden();
  await expect(main.getByRole('link', { name: 'Vartijan koulutus' })).toBeVisible();
  expect(backend.suosikit.map((s) => s.kohdeId)).toEqual([VARTIJAN_KOULUTUS]);
});

test('favorites page links to the tool when there are no favorites', async ({ page, open }) => {
  await open('osaamisprofiili/suosikit');

  await expect(page.getByRole('main').getByRole('link', { name: 'Löydä mahdollisuuksia' })).toHaveAttribute(
    'href',
    '/yksilo/fi/tyokalu',
  );
});
