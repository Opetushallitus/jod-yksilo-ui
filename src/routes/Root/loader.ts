import { client } from '@/api/client';
import i18n, { fallbackLng, resources } from '@/i18n/config';
import { setCsrfToken } from '@/state/csrf/csrfSlice';
import { store } from '@/state/store';
import { LoaderFunction, redirect } from 'react-router-dom';

export default (async ({ params: { lng }, request }) => {
  // Redirect if the language is not supported
  if (lng && !Object.keys(resources).includes(lng)) {
    return redirect(`/${fallbackLng}`);
  }

  // Change language if it is different from the current language
  if (lng && lng !== i18n.language && Object.keys(resources).includes(lng)) {
    await i18n.changeLanguage(lng);
  }

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
