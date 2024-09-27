import { client } from '@/api/client';
import { osaamiset } from '@/api/osaamiset';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

export default (async ({ request }) => {
  return await client
    .GET('/api/profiili/muu-osaaminen', { signal: request.signal })
    .then((res) => res.data ?? [])
    .then(osaamiset.find);
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
