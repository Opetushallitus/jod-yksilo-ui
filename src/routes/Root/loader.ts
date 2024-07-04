// import { client } from '@/api/client';
import { components } from '@/api/schema';
import i18n, { fallbackLng, resources } from '@/i18n/config';
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
  const response = await fetch('/api/yksilo', {
    signal: request.signal,
  });
  if (response.ok) {
    return (await response.json()) as components['schemas']['YksiloCsrfDto'];
  }

  return null;
}) satisfies LoaderFunction;
