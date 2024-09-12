import { client } from '@/api/client';
import { components } from '@/api/schema';
import { removeDuplicates } from '@/utils';
import { LoaderFunction } from 'react-router-dom';

export interface ToolLoaderData {
  tyomahdollisuusEhdotukset: components['schemas']['EhdotusDto'][];
  osaamiset: components['schemas']['YksilonOsaaminenDto'][];
}

export default (async ({ request }) => {
  let osaamiset: components['schemas']['YksilonOsaaminenDto'][] = [];

  try {
    const { data } = await client.GET('/api/profiili/osaamiset', {
      signal: request.signal,
    });
    osaamiset = removeDuplicates(data ?? [], 'osaaminen.uri');
  } catch (error) {
    // Ignore error -> User is not logged in
  }

  const { data: tyomahdollisuusEhdotukset } = await client.POST('/api/ehdotus/tyomahdollisuudet', {
    body: {
      osaamiset: osaamiset.map((osaaminen) => osaaminen.osaaminen.uri),
    },
    signal: request.signal,
  });

  return { tyomahdollisuusEhdotukset, osaamiset };
}) satisfies LoaderFunction;
