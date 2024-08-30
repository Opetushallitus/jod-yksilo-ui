import { client } from '@/api/client';
import { setCsrfToken } from '@/state/csrf/csrfSlice';
import { store } from '@/state/store';
import { LoaderFunction } from 'react-router-dom';

export default (async ({ request }) => {
  // Fetch CSRF token
  const { data, error } = await client.GET('/api/yksilo', {
    signal: request.signal,
  });

  if (!error) {
    store.dispatch(setCsrfToken(data.csrf));
    return data;
  }

  return null;
}) satisfies LoaderFunction;
