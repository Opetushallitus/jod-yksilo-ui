import { client } from '@/api/client';
import { OsaaminenDto, osaamiset as osaamisetService } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { removeDuplicates } from '@/utils';
import { LoaderFunction } from 'react-router-dom';

type YksilonOsaaminenDto = components['schemas']['YksilonOsaaminenDto'];

export interface ToolLoaderData {
  osaamiset: YksilonOsaaminenDto[];
  kiinnostukset: OsaaminenDto[];
  suosikit: components['schemas']['SuosikkiDto'][];
  isLoggedIn: boolean;
}

export default (async ({ request, context }) => {
  let osaamiset: ToolLoaderData['osaamiset'] = [];
  let kiinnostukset: ToolLoaderData['kiinnostukset'] = [];
  let suosikit: ToolLoaderData['suosikit'] = [];

  if (context) {
    const [osaamisetResponse, kiinnostuksetResponse, suosikitResponse] = await Promise.all([
      client.GET('/api/profiili/osaamiset', {
        signal: request.signal,
      }),
      client
        .GET('/api/profiili/kiinnostukset/osaamiset', {
          signal: request.signal,
        })
        .then((response) => osaamisetService.find(response.data)),

      client.GET('/api/profiili/suosikit', { signal: request.signal }),
    ]);

    const { data: osaamisetData = [] } = osaamisetResponse;
    kiinnostukset = kiinnostuksetResponse;
    osaamiset = removeDuplicates(osaamisetData, 'osaaminen.uri');
    suosikit = suosikitResponse.data ?? [];
  }

  return { osaamiset, kiinnostukset, suosikit, isLoggedIn: !!context } as ToolLoaderData;
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
