import { Page } from '@playwright/test';

import type { components } from '../src/api/schema';
import { featureFlags, userProfile } from './fixtures';

export async function mockRedundantEndpoints(page: Page) {
  await page.route('**/manifest-fi.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  const emptySvg = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';

  await page.route('**/favicon*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: emptySvg,
    });
  });
  await page.route('**/apple-touch-icon.png', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: emptySvg,
    });
  });
}

export async function mockAuthenticatedUser(page: Page) {
  await page.route('**/api/profiili/yksilo', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(userProfile),
    });
  });
  await page.route('**/api/profiili/yksilo/tiedot-ja-luvat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        allowKotikunta: true,
        allowSyntymavuosi: true,
        allowSukupuoli: true,
        kotikunta: 'kunta_123',
        kotikuntaNimi: 'Testikunta',
        syntymavuosi: 1990,
        sukupuoli: 'MIES',
        sukupuoliNimi: 'Mies',
        tervetuloapolku: true,
      }),
    });
  });
}

export async function mockFeatureFlags(page: Page, flags: Record<string, boolean> = {}) {
  await page.route('**/config/features.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...featureFlags,
        ...flags,
      }),
    });
  });
}

export async function mockSuggestedCompetences(
  page: Page,
  suggested: components['schemas']['Ehdotus'][],
  competences: components['schemas']['SivuDtoOsaaminenDto'],
) {
  await page.route('**/api/ehdotus/osaamiset', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(suggested),
    });
  });

  await page.route('**/api/osaamiset', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(competences),
    });
  });
}

type ProfileData =
  | {
      toimenkuvat: components['schemas']['ToimenkuvaDto'][];
      toiminnot?: never;
      koulutukset?: never;
    }
  | {
      toimenkuvat?: never;
      toiminnot: components['schemas']['ToimintoDto'][];
      koulutukset?: never;
    }
  | {
      toimenkuvat?: never;
      toiminnot?: never;
      koulutukset: components['schemas']['KoulutusDto'][];
    };

type ProfileWizardData = {
  id?: string;
  nimi: components['schemas']['LokalisoituTeksti'];
} & ProfileData;

type ProfilePageName = 'tyopaikat' | 'vapaa-ajan-teemat' | 'koulutuskokonaisuudet' | 'muu-osaaminen' | 'kiinnostukset';

export async function mockProfileWizard(page: Page, profilePage: ProfilePageName, data: ProfileWizardData[]) {
  await page.route(`**/api/profiili/${profilePage}/*`, async (route) => {
    const req = route.request();
    const method = req.method();

    if (method === 'GET') {
      const id = new URL(req.url()).pathname.split('/').pop();
      const item = data.find((w) => w.id === id);
      await route.fulfill({
        status: item ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(item ?? { message: 'Not found' }),
      });
      return;
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 204, contentType: 'application/json', body: '' });
      return;
    }

    if (method === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
      return;
    }

    await route.continue();
  });

  await page.route(`**/api/profiili/${profilePage}`, async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    } else {
      await route.continue();
    }
  });
}

export async function mockSelectedCompetences(page: Page, competences: components['schemas']['SivuDtoOsaaminenDto']) {
  await page.route('**/api/osaamiset?uri=**', async (route) => {
    const url = new URL(route.request().url());
    const uris = url.searchParams.getAll('uri');

    const selectedCompetences = competences.sisalto.filter((comp) => uris.includes(comp.uri));

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        sisalto: selectedCompetences,
        maara: selectedCompetences.length,
        sivuja: 1,
      }),
    });
  });
}
