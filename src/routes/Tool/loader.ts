import { client } from '@/api/client';
import { osaamiset as osaamisetService } from '@/api/osaamiset';
import type { components } from '@/api/schema';
import i18n from '@/i18n/config';
import { useToolStore } from '@/stores/useToolStore';
import type { LoaderFunction } from 'react-router';
import { JobCodesetValues } from '../../utils/jakaumaUtils';
import { type CompetencesLoaderData, getCompetenceData } from '../Profile/Competences/loader';

export type ToolLoaderData = {
  isLoggedIn: boolean;
  kiinnostukset: components['schemas']['OsaaminenDto'][];
  kiinnostuksetVapaateksti?: components['schemas']['LokalisoituTeksti'];
  filters?: {
    maakunta?: JobCodesetValues['maakunta'];
  };
} & CompetencesLoaderData;

const getKiinnostukset = async (
  request: Request,
): Promise<{
  kiinnostukset: components['schemas']['OsaaminenDto'][];
  kiinnostuksetVapaateksti?: components['schemas']['LokalisoituTeksti'];
}> => {
  const { data } = await client.GET('/api/profiili/kiinnostukset/osaamiset', { signal: request.signal });
  const kiinnostukset = await osaamisetService.find(data?.kiinnostukset);
  const kiinnostuksetVapaateksti = data?.vapaateksti;

  return { kiinnostukset, kiinnostuksetVapaateksti };
};

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
    filters: {},
  };

  const languageHasChanged = state.previousEhdotusUpdateLang !== i18n.language;

  // Load tyomahdollisuudet and ehdotukset if they are not already loaded
  if (state.tyomahdollisuudet.length === 0 || languageHasChanged) {
    //We don't need to await this
    state.updateEhdotuksetAndTyomahdollisuudet(isLoggedIn, languageHasChanged);
  }

  // Load suosikit if the user is logged in
  if (isLoggedIn) {
    const [suosikitResponse, competenceLoaderData, { kiinnostukset, kiinnostuksetVapaateksti }] = await Promise.all([
      client.GET('/api/profiili/suosikit', { signal: request.signal }),
      getCompetenceData(request, context),
      getKiinnostukset(request),
    ]);
    state.setSuosikit(suosikitResponse.data ?? []);

    return { isLoggedIn, kiinnostukset, filters: {}, kiinnostuksetVapaateksti, ...competenceLoaderData };
  } else {
    return emptyData;
  }
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
