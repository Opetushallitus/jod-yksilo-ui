import { client } from '@/api/client';
import { LoaderFunction } from 'react-router-dom';

export default (async ({ request }) => {
  const { data, error } = await client.GET('/api/profiili/vapaa-ajan-toiminnot', { signal: request.signal });
  if (!error) {
    return data;
  }
  return [];
}) satisfies LoaderFunction;
