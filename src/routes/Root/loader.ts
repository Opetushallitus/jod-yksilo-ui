import { client } from '@/api/client';
import { authProvider } from '@/providers';
import { LoaderFunction } from 'react-router-dom';

export default (async ({ request }) => {
  if (authProvider.loginState === 'unknown') {
    // Fetch CSRF token
    const { data, error } = await client.GET('/api/yksilo', {
      signal: request.signal,
    });

    if (!error) {
      return data;
    } else {
      // unknown --> loggedOut
      authProvider.logout();
    }
  }
  return null;
}) satisfies LoaderFunction;
