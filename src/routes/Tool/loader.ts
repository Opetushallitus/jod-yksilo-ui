import { client } from '@/api/client';
import { components } from '@/api/schema';
import { removeDuplicates } from '@/utils';
import { LoaderFunction } from 'react-router-dom';

export interface ToolLoaderData {
  tyomahdollisuudet: components['schemas']['SivuDtoTyomahdollisuusDto'];
  osaamiset: components['schemas']['YksilonOsaaminenDto'][];
}

export default (async ({ request }) => {
  const { data: tyomahdollisuudet } = await client.GET('/api/tyomahdollisuudet', { signal: request.signal });

  let osaamiset: components['schemas']['YksilonOsaaminenDto'][] = [];

  try {
    const { data } = await client.GET('/api/profiili/osaamiset', {
      signal: request.signal,
    });
    osaamiset = removeDuplicates(data ?? [], 'osaaminen.uri');
  } catch (error) {
    // Ignore error -> User is not logged in
  }

  return { tyomahdollisuudet, osaamiset };
}) satisfies LoaderFunction;
