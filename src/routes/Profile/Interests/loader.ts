import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { LoaderFunction } from 'react-router';

export default (async ({ request }) => {
  return await client
    .GET('/api/profiili/kiinnostukset/osaamiset', { signal: request.signal })
    .then((res) => res.data ?? [])
    .then(osaamiset.find);
}) satisfies LoaderFunction;
