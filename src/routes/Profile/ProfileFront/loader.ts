import type { LoaderFunction } from 'react-router';

import { client } from '@/api/client';
import type { components } from '@/api/schema';
import type { YksiloLoaderContext } from '@/stores/useSessionManagerStore';

type OsaamisenLahdeTyyppi = components['schemas']['OsaamisenLahdeDto']['tyyppi'];

export interface ProfileSummary {
  sections: {
    tyopaikat: number;
    koulutukset: number;
    vapaaAjanToiminnot: number;
    kiinnostukset: number;
    suosikit: number;
    tavoitteet: number;
  };
  osaamiset: {
    total: number;
    tyopaikat: number;
    koulutukset: number;
    vapaaAjanToiminnot: number;
    muutOsaamiset: number;
  };
}

export default (async ({ request }) => {
  const { signal } = request;
  const [tyopaikatRes, koulutuksetRes, vapaaAjanTeematRes, kiinnostuksetRes, suosikitRes, tavoitteetRes, osaamisetRes] =
    await Promise.all([
      client.GET('/api/profiili/tyopaikat', { signal }),
      client.GET('/api/profiili/koulutuskokonaisuudet', { signal }),
      client.GET('/api/profiili/vapaa-ajan-teemat', { signal }),
      client.GET('/api/profiili/kiinnostukset/osaamiset', { signal }),
      client.GET('/api/profiili/suosikit', { signal }),
      client.GET('/api/profiili/tavoitteet', { signal }),
      client.GET('/api/profiili/osaamiset', { signal }),
    ]);

  const kiinnostukset = kiinnostuksetRes.data?.kiinnostukset ?? [];
  const osaamiset = osaamisetRes.data ?? [];

  // The same competence may be identified from several sources of the same type (eg. two workplaces), count it once
  const countUniqueOsaamiset = (tyyppi: OsaamisenLahdeTyyppi) =>
    new Set(osaamiset.filter((o) => o.lahde.tyyppi === tyyppi).map((o) => o.osaaminen.uri)).size;

  return {
    sections: {
      tyopaikat: tyopaikatRes.data?.length ?? 0,
      koulutukset: koulutuksetRes.data?.length ?? 0,
      vapaaAjanToiminnot: vapaaAjanTeematRes.data?.length ?? 0,
      kiinnostukset: kiinnostukset.length,
      suosikit: suosikitRes.data?.length ?? 0,
      tavoitteet: tavoitteetRes.data?.length ?? 0,
    },
    osaamiset: {
      total: new Set(osaamiset.map((o) => o.osaaminen.uri)).size,
      tyopaikat: countUniqueOsaamiset('TOIMENKUVA'),
      koulutukset: countUniqueOsaamiset('KOULUTUS'),
      vapaaAjanToiminnot: countUniqueOsaamiset('TOIMINTO'),
      muutOsaamiset: countUniqueOsaamiset('MUU_OSAAMINEN'),
    },
  } satisfies ProfileSummary;
}) satisfies LoaderFunction<YksiloLoaderContext>;
