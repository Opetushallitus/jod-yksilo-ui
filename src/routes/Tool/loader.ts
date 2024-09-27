import { client } from '@/api/client';
import { OsaaminenDto, osaamiset as osaamisetService } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { removeDuplicates } from '@/utils';
import { LoaderFunction } from 'react-router-dom';

type YksilonOsaaminenDto = components['schemas']['YksilonOsaaminenDto'];
export interface ToolLoaderData {
  osaamiset: YksilonOsaaminenDto[];
  kiinnostukset: OsaaminenDto[];
}

export default (async ({ request, context }) => {
  let osaamiset: YksilonOsaaminenDto[] = [];
  let kiinnostukset: OsaaminenDto[] = [];

  if (context) {
    const [osaamisetResponse, kiinnostuksetResponse] = await Promise.all([
      client.GET('/api/profiili/osaamiset', {
        signal: request.signal,
      }),
      client
        .GET('/api/profiili/kiinnostukset/osaamiset', {
          signal: request.signal,
        })
        .then((response) => osaamisetService.find(response.data)),
    ]);

    const { data: osaamisetData = [] } = osaamisetResponse;
    kiinnostukset = kiinnostuksetResponse;
    osaamiset = removeDuplicates(osaamisetData, 'osaaminen.uri');
  }

  return { osaamiset, kiinnostukset } as ToolLoaderData;
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
