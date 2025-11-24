import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import type { components } from '@/api/schema';

import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const { data } = await client.GET('/api/profiili/muu-osaaminen', { signal: request.signal });

  return {
    muuOsaaminen: await osaamiset.find(data?.muuOsaaminen),
    vapaateksti: data?.vapaateksti,
  };
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
