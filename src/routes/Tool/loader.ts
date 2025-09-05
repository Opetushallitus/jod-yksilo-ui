import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import { useToolStore } from '@/stores/useToolStore';
import type { LoaderFunction } from 'react-router';
import { type CompetencesLoaderData, getCompetenceData } from '../Profile/Competences/loader';

export type ToolLoaderData = {
  isLoggedIn: boolean;
  kiinnostukset: components['schemas']['OsaaminenDto'][];
  kiinnostuksetVapaateksti?: components['schemas']['LokalisoituTeksti'];
} & CompetencesLoaderData;

export default (async ({ request, context }): Promise<ToolLoaderData> => {
  const state = useToolStore.getState();
  const isLoggedIn = !!context;
  const emptyData: ToolLoaderData = {
    isLoggedIn: false,
    osaamiset: [],
    toimenkuvat: [],
    koulutukset: [],
    patevyydet: [],
    muutOsaamiset: [],
    kiinnostukset: [],
  };

  // Load tyomahdollisuudet and ehdotukset if they are not already loaded
  if (state.tyomahdollisuudet.length === 0) {
    await state.updateEhdotuksetAndTyomahdollisuudet(isLoggedIn);
  }

  // Load suosikit if the user is logged in
  if (isLoggedIn) {
    const suosikitResponse = await client.GET('/api/profiili/suosikit', { signal: request.signal });
    state.setSuosikit(suosikitResponse.data ?? []);

    // Get competence data from profile
    const competenceLoaderData = await getCompetenceData(request, context);

    const { data } = await client.GET('/api/profiili/kiinnostukset/osaamiset', { signal: request.signal });
    const kiinnostukset = await osaamisetService.find(data?.kiinnostukset);
    const kiinnostuksetVapaateksti = data?.vapaateksti;

    return { isLoggedIn, kiinnostukset, kiinnostuksetVapaateksti, ...competenceLoaderData };
  } else {
    return emptyData;
  }
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
