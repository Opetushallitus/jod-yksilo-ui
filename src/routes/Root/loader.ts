import { client, registerCsrfMiddleware, unregisterCsrfMiddleware } from '@/api/client';
import { components } from '@/api/schema';
import { LoaderFunction } from 'react-router-dom';

let currentCsrf: components['schemas']['CsrfTokenDto'] | null = null;

export const clearCsrf = () => {
  if (currentCsrf) {
    unregisterCsrfMiddleware(currentCsrf);
  }
  currentCsrf = null;
};

export default (async ({ request }) => {
  // Fetch CSRF token
  const { data, error } = await client.GET('/api/yksilo', {
    signal: request.signal,
  });

  if (!error) {
    // Unregister the current CSRF middleware because the token has changed
    if (currentCsrf) {
      unregisterCsrfMiddleware(currentCsrf);
    }

    registerCsrfMiddleware(data.csrf);
    currentCsrf = data.csrf;
    return data;
  }

  return null;
}) satisfies LoaderFunction;
