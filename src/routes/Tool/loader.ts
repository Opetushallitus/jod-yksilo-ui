import { client } from '@/api/client';
import { components } from '@/api/schema';
import { removeDuplicates } from '@/utils';
import { LoaderFunction } from 'react-router-dom';

export interface ToolLoaderData {
  osaamiset: components['schemas']['YksilonOsaaminenDto'][];
}

export default (async ({ request, context }) => {
  let osaamiset: components['schemas']['YksilonOsaaminenDto'][] = [];
  if (context) {
    const { data } = await client.GET('/api/profiili/osaamiset', {
      signal: request.signal,
    });
    osaamiset = removeDuplicates(data ?? [], 'osaaminen.uri');
  }

  return { osaamiset };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
