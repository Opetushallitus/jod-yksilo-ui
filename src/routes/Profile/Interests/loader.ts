import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { initializeLocalizedText } from '@/utils';
import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  const { data } = await client.GET('/api/profiili/kiinnostukset/osaamiset', { signal: request.signal });
  return {
    kiinnostukset: await osaamiset.find(data?.kiinnostukset),
    vapaateksti: initializeLocalizedText(data?.vapaateksti),
  };
}) satisfies LoaderFunction;
