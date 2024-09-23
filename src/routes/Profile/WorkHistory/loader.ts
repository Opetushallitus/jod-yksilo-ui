import { client } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

export default (async ({ request }) => {
  const { data, error } = await client.GET('/api/profiili/tyopaikat', { signal: request.signal });
  if (!error) {
    return data;
  }
  return [];
}) satisfies LoaderFunction<components['schemas']['YksiloCsrfDto'] | null>;
