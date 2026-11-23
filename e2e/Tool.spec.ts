import type { Page } from '@playwright/test';

import { workHistory } from './data';
import { expect, test } from './fixtures';

// The opportunity suggestions are faked with a small catalog (see e2e/catalog.ts) and a predictable scoring, so the
// tests check that the user's selections reach the backend and that the UI ranks, filters and sorts the results.
// The quality of the real suggestions is not tested here.

const HUVIPUISTO = 'http://data.europa.eu/esco/skill/e2e-huvipuisto';
const PELISAANNOT = 'http://data.europa.eu/esco/skill/e2e-pelisaannot';

const opportunities = (page: Page) =>
  page
    .getByRole('main')
    .getByRole('listitem')
    .filter({ has: page.getByRole('button', { name: 'Tallenna suosikiksi' }) });

/** Titles of the listed opportunities, in the order they are shown. */
const titles = (page: Page) => opportunities(page).getByRole('heading', { level: 3 }).getByRole('link');

/** On narrow screens the inputs and the results are on separate tabs. */
const showTab = async (page: Page, name: 'Täytä ensin tietosi' | 'Sitten löydä mahdollisuutesi') => {
  const tab = page.getByRole('main').getByRole('tab', { name });
  if (await tab.isVisible()) {
    await tab.click();
  }
};
const showInputs = (page: Page) => showTab(page, 'Täytä ensin tietosi');
const showResults = (page: Page) => showTab(page, 'Sitten löydä mahdollisuutesi');

const addCompetence = async (page: Page, text: string, name: string) => {
  await showInputs(page);
  const main = page.getByRole('main');
  const region = main.getByRole('region', { name: 'Kartoita osaamisesi' });
  if (!(await region.isVisible())) {
    await main.getByRole('button', { name: 'Kartoita osaamisesi' }).click();
  }
  await region.getByRole('textbox').fill(text);
  await region.getByRole('button', { name: new RegExp(`^${name}`) }).click();
  await expect(region.getByRole('list', { name: 'Ehdotetut osaamiset' }).getByText(name)).toBeHidden();
};

const addInterest = async (page: Page, text: string, name: string) => {
  await showInputs(page);
  const main = page.getByRole('main');
  const region = main.getByRole('region', { name: 'Kartoita kiinnostuksesi' });
  if (!(await region.isVisible())) {
    await main.getByRole('button', { name: 'Kartoita kiinnostuksesi' }).click();
  }
  await region.getByRole('textbox').first().fill(text);
  await region.getByRole('button', { name: new RegExp(`^${name}`) }).click();
  await expect(region.getByRole('list', { name: 'Ehdotetut kiinnostukset' }).getByText(name)).toBeHidden();
};

const updateOpportunities = async (page: Page) => {
  await showInputs(page);
  await page.getByRole('main').getByRole('button', { name: 'Päivitä mahdollisuutesi' }).click();
  await showResults(page);
  await expect(page.getByRole('main').getByRole('status').filter({ hasText: 'Mahdollisuudet ladattu' })).toBeVisible();
};

/** Opens a section of the settings, unless it is open already. */
const FILTER_SECTIONS = [
  'Koulutusmahdollisuuksien tyyppi',
  'Kesto',
  'Työmahdollisuuksien tyyppi',
  'Ylätason ammattiryhmä',
];

const expand = async (settings: ReturnType<Page['getByRole']>, name: string): Promise<void> => {
  if (FILTER_SECTIONS.includes(name)) {
    await expand(settings, 'Suodatus');
  }
  // A section shows the number of its selections, e.g. "Suodatus (1)".
  const button = settings.getByRole('button', { name: new RegExp(String.raw`^${name}( \(\d+\))?$`) });
  if ((await button.getAttribute('aria-expanded')) !== 'true') {
    await button.click();
  }
};

/** Opens the settings, lets `change` adjust them, and applies them. */
const adjustSettings = async (page: Page, change: (settings: ReturnType<Page['getByRole']>) => Promise<void>) => {
  await showResults(page);
  await page.getByRole('main').getByRole('button', { name: 'Näytä säätimet' }).click();
  const settings = page.getByRole('dialog', { name: 'Säätimet' });
  await change(settings);
  await settings.getByRole('button', { name: 'Päivitä' }).click();
  await expect(settings).toBeHidden();
};

test.beforeEach(async ({ open }) => {
  await open('tyokalu');
});

test('user finds opportunities that match the competences and interests', async ({ page, backend }) => {
  await showResults(page);
  await expect(titles(page)).toHaveCount(6);

  await addCompetence(page, 'puisto', 'valvoa huvipuiston turvallisuutta');
  await addInterest(page, 'raha', 'pelisäännöt');
  await updateOpportunities(page);

  expect(backend.ehdotusRequests.at(-1)).toMatchObject({
    osaamiset: [HUVIPUISTO],
    kiinnostukset: [PELISAANNOT],
    osaamisPainotus: 0.5,
    kiinnostusPainotus: 0.5,
  });
  // Huvipuistonjohtaja matches both, the others only one or none.
  await expect(titles(page).first()).toHaveText('Huvipuistonjohtaja');
  await expect(opportunities(page).first()).toContainText('100%Sopivuus');
  await expect(opportunities(page).last()).toContainText(/(^|\D)0%Sopivuus/);
});

test('weighting the interests changes the suggestions', async ({ page, backend }) => {
  await addCompetence(page, 'puisto', 'valvoa huvipuiston turvallisuutta');
  await addInterest(page, 'raha', 'pelisäännöt');
  await updateOpportunities(page);

  await adjustSettings(page, async (settings) => {
    await expand(settings, 'Painotus');
    // Only the interests count.
    await settings.getByRole('slider', { name: 'Osaamisten ja kiinnostusten painotus' }).press('End');
  });

  await expect.poll(() => backend.ehdotusRequests.at(-1)).toMatchObject({ osaamisPainotus: 0, kiinnostusPainotus: 1 });
  // Laitetyöntekijä needs the competence, but not the interest.
  await expect(opportunities(page).filter({ hasText: 'Laitetyöntekijä' })).toContainText(/(^|\D)0%Sopivuus/);
});

test('user shows only job opportunities and sorts them alphabetically', async ({ page }) => {
  await adjustSettings(page, async (settings) => {
    await settings.getByRole('checkbox', { name: /^Työmahdollisuudet/ }).click();
    await expand(settings, 'Järjestys');
    await settings.getByRole('radio', { name: 'Aakkosjärjestyksessä' }).click();
  });

  await expect(titles(page)).toHaveText(['Eläintenhoitaja', 'Huvipuistonjohtaja', 'Laitetyöntekijä']);
});

test('user filters job opportunities by type, occupation group and region', async ({ page }) => {
  await adjustSettings(page, async (settings) => {
    await settings.getByRole('checkbox', { name: /^Työmahdollisuudet/ }).click();
    await expand(settings, 'Työmahdollisuuksien tyyppi');
    await settings.getByRole('checkbox', { name: /^Muu työmahdollisuus/ }).click();
  });
  await expect(titles(page)).toHaveText(['Laitetyöntekijä']);

  await adjustSettings(page, async (settings) => {
    await expand(settings, 'Työmahdollisuuksien tyyppi');
    await settings.getByRole('checkbox', { name: /^Muu työmahdollisuus/ }).click();
    await expand(settings, 'Ylätason ammattiryhmä');
    await settings.getByRole('checkbox', { name: 'Johtajat' }).click();
  });
  await expect(titles(page)).toHaveText(['Huvipuistonjohtaja']);

  await adjustSettings(page, async (settings) => {
    await expand(settings, 'Ylätason ammattiryhmä');
    await settings.getByRole('checkbox', { name: 'Johtajat' }).click();
    await expand(settings, 'Sijainti');
    await settings.getByRole('checkbox', { name: 'Uusimaa' }).click();
  });
  await expect(titles(page)).toHaveCount(2);
  await expect(titles(page)).toContainText(['Eläintenhoitaja', 'Laitetyöntekijä']);
});

test('user filters education opportunities by type and duration', async ({ page }) => {
  await adjustSettings(page, async (settings) => {
    await settings.getByRole('checkbox', { name: /^Koulutusmahdollisuudet/ }).click();
    await expand(settings, 'Koulutusmahdollisuuksien tyyppi');
    await settings.getByRole('checkbox', { name: /^Tutkinto/ }).click();
  });
  await expect(titles(page)).toHaveCount(2);
  await expect(titles(page)).toContainText(['Eläintenhoidon ammattitutkinto', 'Liiketalouden perustutkinto']);

  await adjustSettings(page, async (settings) => {
    await expand(settings, 'Koulutusmahdollisuuksien tyyppi');
    await settings.getByRole('checkbox', { name: /^Tutkinto/ }).click();
    await expand(settings, 'Kesto');
    // The steps are 1 day, 1 month, 1 year, 3 years and 6+ years: at most a year leaves only the short course.
    const max = settings.getByRole('slider', { name: /^Maksimikesto/ });
    await max.press('ArrowLeft');
    await max.press('ArrowLeft');
  });
  await expect(titles(page)).toHaveText(['Vartijan koulutus']);
});

test('clearing the settings shows all opportunities again', async ({ page }) => {
  await adjustSettings(page, async (settings) => {
    await settings.getByRole('checkbox', { name: /^Työmahdollisuudet/ }).click();
  });
  await expect(titles(page)).toHaveCount(3);

  await adjustSettings(page, async (settings) => {
    await settings.getByRole('button', { name: 'Poista valinnat' }).click();
  });
  await expect(titles(page)).toHaveCount(6);
});

test('selected competences and interests can be removed', async ({ page }) => {
  await addCompetence(page, 'puisto', 'valvoa huvipuiston turvallisuutta');
  const competences = page.getByRole('main').getByRole('region', { name: 'Kartoita osaamisesi' });
  const update = page.getByRole('main').getByRole('button', { name: 'Päivitä mahdollisuutesi' });
  await expect(update).toBeEnabled();

  await competences.getByRole('button', { name: /^valvoa huvipuiston turvallisuutta/ }).click();

  await expect(competences.getByText('Ei valittuja osaamisia')).toBeVisible();
});

test('support links help with thinking about the situation', async ({ page }) => {
  const main = page.getByRole('main');
  await main.getByRole('button', { name: 'Tukea pohdintaan' }).click();

  const support = main.getByRole('region', { name: 'Tukea pohdintaan' });
  await expect(support.getByRole('link', { name: /^Urataitojen itsearviointi/ })).toHaveAttribute(
    'href',
    '/urataidot/fi',
  );
  await expect(support.getByRole('link', { name: /^Tietoa oman urasuunnittelun tueksi/ })).toHaveAttribute(
    'href',
    '/tietopalvelu/fi/tietoa-oman-uran-suunnittelun-tueksi',
  );
  await expect(support.getByRole('link', { name: /^Ohjaus- ja neuvontapalveluja/ })).toHaveAttribute(
    'href',
    'https://www.suomi.fi/aihe/ohjaus-ja-neuvontapalveluja',
  );
});

test('user identifies interests by chatting with the virtual assistant', async ({ page, backend }) => {
  const main = page.getByRole('main');
  await main.getByRole('button', { name: 'Kartoita kiinnostuksesi' }).click();
  await main.getByRole('button', { name: 'Tunnista kiinnostuksia tekoälyllä' }).click();
  const dialog = page.getByRole('dialog', { name: 'Kiinnostusten kartoitus' });
  const chat = dialog.getByRole('tabpanel', { name: 'Keskustelu' });

  await dialog.getByRole('textbox', { name: 'Vastaa botille...' }).fill('raha kiinnostaa');
  await dialog.getByRole('button', { name: 'Lähetä' }).click();
  await chat.getByRole('button', { name: 'pelisäännöt' }).click();
  await chat.getByRole('button', { name: 'hallinnoida rahoitusta' }).click();

  // The selected interests can be reviewed and removed before saving.
  await dialog.getByRole('tab', { name: /^Kiinnostukset/ }).click();
  const selected = dialog.getByRole('tabpanel', { name: /^Kiinnostukset/ });
  await expect(selected.getByRole('button', { name: /^pelisäännöt/ })).toBeVisible();
  await selected.getByRole('button', { name: /^hallinnoida rahoitusta/ }).click();
  await expect(selected.getByRole('button', { name: /^hallinnoida rahoitusta/ })).toBeHidden();

  await dialog.getByRole('button', { name: 'Tallenna' }).click();

  await expect(dialog).toBeHidden();
  expect(backend.keskustelut).toEqual([
    expect.objectContaining({ tila: 'KIINNOSTUKSET', viestit: ['raha kiinnostaa'] }),
  ]);
  const interests = main.getByRole('region', { name: 'Kartoita kiinnostuksesi' });
  await expect(interests.getByRole('button', { name: /^pelisäännöt/ })).toBeVisible();
  await expect(interests.getByRole('button', { name: /^hallinnoida rahoitusta/ })).toBeHidden();
});

test.describe('signed in', () => {
  test.beforeEach(async ({ backend }) => {
    backend.signIn();
    backend.tyopaikat = structuredClone(workHistory);
    backend.kiinnostukset = { kiinnostukset: [PELISAANNOT] };
  });

  test('user imports competences and interests from the profile', async ({ page, open, backend }) => {
    await open('tyokalu');
    const main = page.getByRole('main');
    await main.getByRole('button', { name: 'Tuo osaamisprofiilista' }).click();
    await main.getByRole('button', { name: 'Tuo tietoja profiilista' }).click();

    const dialog = page.getByRole('dialog', { name: 'Tietojen tuonti profiilista' });
    await expect(dialog.getByRole('checkbox', { name: 'Testi Oy' })).toBeChecked();
    // Nothing to import from the empty sections.
    await expect(dialog.getByRole('checkbox', { name: 'Koulutukset' })).toBeDisabled();
    await dialog.getByRole('button', { name: 'Tuo' }).click();
    await expect(dialog).toBeHidden();

    await updateOpportunities(page);
    expect(backend.ehdotusRequests.at(-1)).toMatchObject({
      osaamiset: expect.arrayContaining(workHistory[0].toimenkuvat[0].osaamiset),
      kiinnostukset: [PELISAANNOT],
    });
    // The imported work history matches all competences of Eläintenhoitaja, but not the interest.
    await expect(opportunities(page).filter({ hasText: 'Eläintenhoitaja' })).toContainText('50%Sopivuus');
  });

  test('user exports the competences found in the tool to the profile', async ({ page, open, backend }) => {
    await open('tyokalu');
    await addCompetence(page, 'puisto', 'valvoa huvipuiston turvallisuutta');
    const main = page.getByRole('main');
    await main.getByRole('button', { name: 'Tuo osaamisprofiilista' }).click();
    await main.getByRole('button', { name: 'Vie tietoja profiiliin' }).click();

    const dialog = page.getByRole('dialog', { name: 'Tietojen vienti profiiliin' });
    await expect(dialog.getByRole('checkbox', { name: 'Osaamiseni' })).toBeChecked();
    await dialog.getByRole('button', { name: 'Vie' }).click();

    await expect(dialog).toBeHidden();
    await expect.poll(() => backend.muuOsaaminen.muuOsaaminen).toEqual([HUVIPUISTO]);
  });
});
