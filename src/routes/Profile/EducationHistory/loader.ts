import { client } from '@/api/client';
import { LoaderFunction } from 'react-router-dom';

export default (async ({ request }) => {
  const { data } = await client.GET('/api/profiili/koulutuskokonaisuudet', { signal: request.signal });
  return data;
}) satisfies LoaderFunction;
